import React, { useState, useEffect } from 'react';
import { ReceiptData, ChatMessage } from './types/bill';
import { calculateSplitSummary } from './utils/splitCalculator';
import { Navbar } from './components/Navbar';
import { ReceiptPane } from './components/ReceiptPane';
import { ChatPane } from './components/ChatPane';
import { ReceiptUploadModal } from './components/ReceiptUploadModal';
import { ReceiptImageModal } from './components/ReceiptImageModal';
import { ShareSummaryModal } from './components/ShareSummaryModal';

// Initial default sample receipt: El Toro Mexican Cantina
const DEFAULT_RECEIPT: ReceiptData = {
  restaurantName: 'El Toro Mexican Cantina',
  date: '2025-05-18 20:45',
  currency: '$',
  items: [
    { id: 'item-1', name: 'Loaded Queso Nachos', price: 14.50, quantity: 1, category: 'Appetizer', assignedTo: [] },
    { id: 'item-2', name: 'Birria Tacos (3pcs)', price: 17.00, quantity: 1, category: 'Main', assignedTo: [] },
    { id: 'item-3', name: 'Carne Asada Fajitas', price: 22.50, quantity: 1, category: 'Main', assignedTo: [] },
    { id: 'item-4', name: 'House Classic Margarita', price: 26.00, quantity: 2, category: 'Drinks', assignedTo: [] },
    { id: 'item-5', name: 'Guacamole & Fresh Chips', price: 9.50, quantity: 1, category: 'Appetizer', assignedTo: [] },
    { id: 'item-6', name: 'Cinnamon Churros & Dip', price: 8.50, quantity: 1, category: 'Dessert', assignedTo: [] },
  ],
  subtotal: 98.00,
  tax: 8.82,
  tip: 17.64,
  tipPercentage: 18,
  total: 124.46,
};

const DEFAULT_PARTICIPANTS = ['Dhruv', 'Sarah', 'Sue'];

export default function App() {
  const [receipt, setReceipt] = useState<ReceiptData>(DEFAULT_RECEIPT);
  const [participants, setParticipants] = useState<string[]>(DEFAULT_PARTICIPANTS);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Chat message thread
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `👋 Welcome to SplitWise AI! I've loaded your receipt from ${DEFAULT_RECEIPT.restaurantName}.

You can tell me who had what using plain English, such as:
• "Dhruv had the nachos"
• "Sarah and Sue shared the fajitas"
• "Everyone split the guacamole & chips"
• "Set tip to 20%"

I'll automatically update the bill on the left and divide tax & tip proportionally!`,
      timestamp: 'Just now',
    },
  ]);

  // Recalculate summary in real-time
  const splitSummary = calculateSplitSummary(
    receipt.items,
    receipt.tax,
    receipt.tip,
    participants
  );

  // Load sample receipt from server or local preset
  const handleLoadSample = async (sampleKey: string) => {
    try {
      const res = await fetch('/api/receipts/samples');
      const data = await res.json();
      const sample = data.samples?.find((s: any) => s.id === sampleKey);

      if (sample) {
        setReceipt({
          restaurantName: sample.name,
          date: sample.date,
          currency: sample.currency,
          items: sample.items,
          subtotal: sample.subtotal,
          tax: sample.tax,
          tip: sample.tip,
          tipPercentage: 18,
          total: sample.total,
        });

        if (sample.defaultParticipants && sample.defaultParticipants.length > 0) {
          setParticipants(sample.defaultParticipants);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: 'assistant',
            text: `🧾 Loaded sample receipt for "${sample.name}" with ${sample.items.length} items. Ready to assign!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load sample receipt:', err);
    }
  };

  // Receipt parsed from upload
  const handleReceiptParsed = (parsedReceipt: any) => {
    setReceipt({
      restaurantName: parsedReceipt.restaurantName,
      date: parsedReceipt.date,
      currency: parsedReceipt.currency || '$',
      items: parsedReceipt.items,
      subtotal: parsedReceipt.subtotal,
      tax: parsedReceipt.tax,
      tip: parsedReceipt.tip,
      tipPercentage: 18,
      total: parsedReceipt.total,
      imageUrl: parsedReceipt.imageUrl,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: 'assistant',
        text: `✨ Successfully scanned receipt for "${parsedReceipt.restaurantName}"! Extracted ${parsedReceipt.items.length} items totaling ${parsedReceipt.currency || '$'}${parsedReceipt.total.toFixed(2)}. Who had what?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Toggle item assignee
  const handleToggleAssign = (itemId: string, person: string) => {
    setReceipt((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === itemId) {
          const current = item.assignedTo || [];
          const exists = current.includes(person);
          const next = exists ? current.filter((p) => p !== person) : [...current, person];
          return { ...item, assignedTo: next };
        }
        return item;
      });
      return { ...prev, items: updatedItems };
    });
  };

  // Split item across all known participants
  const handleSplitAll = (itemId: string) => {
    setReceipt((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, assignedTo: [...participants] };
        }
        return item;
      });
      return { ...prev, items: updatedItems };
    });
  };

  // Clear item assignments
  const handleClearAssign = (itemId: string) => {
    setReceipt((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, assignedTo: [] };
        }
        return item;
      });
      return { ...prev, items: updatedItems };
    });
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    setReceipt((prev) => {
      const updatedItems = prev.items.filter((item) => item.id !== itemId);
      const newSubtotal = updatedItems.reduce((acc, it) => acc + it.price, 0);
      const newTax = Number((newSubtotal * 0.08875).toFixed(2));
      const newTip = Number((newSubtotal * ((prev.tipPercentage || 18) / 100)).toFixed(2));
      return {
        ...prev,
        items: updatedItems,
        subtotal: Number(newSubtotal.toFixed(2)),
        tax: newTax,
        tip: newTip,
        total: Number((newSubtotal + newTax + newTip).toFixed(2)),
      };
    });
  };

  // Update item name or price
  const handleUpdateItem = (itemId: string, name: string, price: number) => {
    setReceipt((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, name, price };
        }
        return item;
      });
      const newSubtotal = updatedItems.reduce((acc, it) => acc + it.price, 0);
      const newTax = Number((newSubtotal * 0.08875).toFixed(2));
      const newTip = Number((newSubtotal * ((prev.tipPercentage || 18) / 100)).toFixed(2));
      return {
        ...prev,
        items: updatedItems,
        subtotal: Number(newSubtotal.toFixed(2)),
        tax: newTax,
        tip: newTip,
        total: Number((newSubtotal + newTax + newTip).toFixed(2)),
      };
    });
  };

  // Add new item manually
  const handleAddItem = (name: string, price: number, category: string) => {
    const newItem = {
      id: `item-${Date.now()}`,
      name,
      price,
      quantity: 1,
      category,
      assignedTo: [],
    };
    setReceipt((prev) => {
      const updatedItems = [...prev.items, newItem];
      const newSubtotal = updatedItems.reduce((acc, it) => acc + it.price, 0);
      const newTax = Number((newSubtotal * 0.08875).toFixed(2));
      const newTip = Number((newSubtotal * ((prev.tipPercentage || 18) / 100)).toFixed(2));
      return {
        ...prev,
        items: updatedItems,
        subtotal: Number(newSubtotal.toFixed(2)),
        tax: newTax,
        tip: newTip,
        total: Number((newSubtotal + newTax + newTip).toFixed(2)),
      };
    });
  };

  // Update Tax
  const handleUpdateTax = (tax: number) => {
    setReceipt((prev) => ({
      ...prev,
      tax: Number(tax.toFixed(2)),
      total: Number((prev.subtotal + tax + prev.tip).toFixed(2)),
    }));
  };

  // Update Tip %
  const handleUpdateTipPercentage = (tipPercent: number) => {
    setReceipt((prev) => {
      const tipAmount = Number((prev.subtotal * (tipPercent / 100)).toFixed(2));
      return {
        ...prev,
        tip: tipAmount,
        tipPercentage: tipPercent,
        total: Number((prev.subtotal + prev.tax + tipAmount).toFixed(2)),
      };
    });
  };

  // Update Tip Dollar Amount
  const handleUpdateTipAmount = (tipAmount: number) => {
    setReceipt((prev) => {
      const tipPercent = prev.subtotal > 0 ? Math.round((tipAmount / prev.subtotal) * 100) : 0;
      return {
        ...prev,
        tip: Number(tipAmount.toFixed(2)),
        tipPercentage: tipPercent,
        total: Number((prev.subtotal + prev.tax + tipAmount).toFixed(2)),
      };
    });
  };

  // Add Participant
  const handleAddParticipant = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !participants.includes(trimmed)) {
      setParticipants((prev) => [...prev, trimmed]);
    }
  };

  // Remove Participant
  const handleRemoveParticipant = (name: string) => {
    setParticipants((prev) => prev.filter((p) => p !== name));
    // Also remove from any items they were assigned to
    setReceipt((prev) => ({
      ...prev,
      items: prev.items.map((it) => ({
        ...it,
        assignedTo: (it.assignedTo || []).filter((p) => p !== name),
      })),
    }));
  };

  // Reset tab
  const handleReset = () => {
    if (window.confirm('Reset all item assignments and participants?')) {
      setReceipt((prev) => ({
        ...prev,
        items: prev.items.map((it) => ({ ...it, assignedTo: [] })),
      }));
      setMessages([
        {
          id: `reset-${Date.now()}`,
          sender: 'assistant',
          text: '🔄 All assignments cleared! Tell me who had what to start fresh.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // Handle Natural Language Chat Command
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          currentReceipt: receipt,
          participants,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to process command.');
      }

      const { reply, actions, newParticipants } = resData.data;

      // Add new participants if discovered by Gemini
      let currentParticipants = [...participants];
      if (newParticipants && Array.isArray(newParticipants)) {
        newParticipants.forEach((p: string) => {
          const trimmed = p.trim();
          if (trimmed && !currentParticipants.includes(trimmed)) {
            currentParticipants.push(trimmed);
          }
        });
        setParticipants(currentParticipants);
      }

      // Apply actions to receipt items
      const appliedBadges: string[] = [];
      let updatedItems = [...receipt.items];
      let updatedTip = receipt.tip;
      let updatedTipPct = receipt.tipPercentage;

      if (actions && Array.isArray(actions)) {
        for (const action of actions) {
          // Add person
          if (action.type === 'ADD_PERSON' && action.people) {
            action.people.forEach((p: string) => {
              const trimmed = p.trim();
              if (trimmed && !currentParticipants.includes(trimmed)) {
                currentParticipants.push(trimmed);
                appliedBadges.push(`Added ${trimmed}`);
              }
            });
            setParticipants(currentParticipants);
          }

          // Tip action
          if (action.type === 'SET_TIP') {
            if (typeof action.tipPercent === 'number') {
              updatedTipPct = action.tipPercent;
              updatedTip = Number((receipt.subtotal * (action.tipPercent / 100)).toFixed(2));
              appliedBadges.push(`Tip set to ${action.tipPercent}% ($${updatedTip.toFixed(2)})`);
            } else if (typeof action.tipAmount === 'number') {
              updatedTip = Number(action.tipAmount.toFixed(2));
              appliedBadges.push(`Tip set to $${updatedTip.toFixed(2)}`);
            }
          }

          // Clear all assignments
          if (action.type === 'CLEAR_ALL') {
            updatedItems = updatedItems.map((it) => ({ ...it, assignedTo: [] }));
            appliedBadges.push('Cleared all assignments');
          }

          // Item assignments / splits
          if (action.type === 'ASSIGN' || action.type === 'SPLIT' || action.type === 'SPLIT_ALL' || action.type === 'UNASSIGN') {
            // Find target items by ID or fuzzy matching name
            const targetItems = updatedItems.filter((it) => {
              if (action.itemId && it.id === action.itemId) return true;
              if (action.itemName) {
                const normSearch = action.itemName.toLowerCase();
                const normItem = it.name.toLowerCase();
                return normItem.includes(normSearch) || normSearch.includes(normItem);
              }
              return false;
            });

            const people = action.type === 'SPLIT_ALL' ? currentParticipants : (action.people || []);

            // Also ensure any mentioned people are in participants
            people.forEach((p: string) => {
              if (!currentParticipants.includes(p)) {
                currentParticipants.push(p);
                setParticipants(currentParticipants);
              }
            });

            targetItems.forEach((target) => {
              updatedItems = updatedItems.map((it) => {
                if (it.id === target.id) {
                  if (action.type === 'UNASSIGN') {
                    if (people.length === 0) {
                      appliedBadges.push(`Unassigned "${it.name}"`);
                      return { ...it, assignedTo: [] };
                    } else {
                      const next = (it.assignedTo || []).filter((p) => !people.includes(p));
                      appliedBadges.push(`Removed ${people.join(', ')} from "${it.name}"`);
                      return { ...it, assignedTo: next };
                    }
                  } else if (action.type === 'ASSIGN') {
                    appliedBadges.push(`Assigned "${it.name}" to ${people.join(', ')}`);
                    return { ...it, assignedTo: [...people] };
                  } else if (action.type === 'SPLIT' || action.type === 'SPLIT_ALL') {
                    appliedBadges.push(`Split "${it.name}" between ${people.join(', ')}`);
                    return { ...it, assignedTo: [...people] };
                  }
                }
                return it;
              });
            });
          }
        }
      }

      // Update receipt state
      setReceipt((prev) => ({
        ...prev,
        items: updatedItems,
        tip: updatedTip,
        tipPercentage: updatedTipPct,
        total: Number((prev.subtotal + prev.tax + updatedTip).toFixed(2)),
      }));

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          text: reply || 'Updated the bill split!',
          actionBadges: appliedBadges.length > 0 ? appliedBadges : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ ${err.message || 'Sorry, I had trouble processing that command. Please try again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Navigation */}
      <Navbar
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onReset={handleReset}
        onLoadSample={handleLoadSample}
      />

      {/* Main Split-Screen Layout */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Pane: AI Parsed Receipt & Real-time Split Summary */}
        <section className="md:col-span-6 lg:col-span-7 h-full overflow-hidden flex flex-col">
          <ReceiptPane
            receipt={receipt}
            splitSummary={splitSummary}
            allParticipants={participants}
            onToggleAssign={handleToggleAssign}
            onSplitAll={handleSplitAll}
            onClearAssign={handleClearAssign}
            onDeleteItem={handleDeleteItem}
            onUpdateItem={handleUpdateItem}
            onAddItem={handleAddItem}
            onUpdateTax={handleUpdateTax}
            onUpdateTipPercentage={handleUpdateTipPercentage}
            onUpdateTipAmount={handleUpdateTipAmount}
            onViewImage={() => setIsImageOpen(true)}
          />
        </section>

        {/* Right Pane: Smart Chat Interface */}
        <section className="md:col-span-6 lg:col-span-5 h-full overflow-hidden flex flex-col border-t md:border-t-0 md:border-l border-slate-800">
          <ChatPane
            messages={messages}
            receipt={receipt}
            splitSummary={splitSummary}
            participants={participants}
            isLoading={isChatLoading}
            onSendMessage={handleSendMessage}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
            onClearHistory={() =>
              setMessages([
                {
                  id: `clear-${Date.now()}`,
                  sender: 'assistant',
                  text: 'Chat history cleared. How can I help you split the tab?',
                  timestamp: 'Just now',
                },
              ])
            }
          />
        </section>
      </main>

      {/* Modals */}
      <ReceiptUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onReceiptParsed={handleReceiptParsed}
        onLoadSample={handleLoadSample}
      />

      <ReceiptImageModal
        isOpen={isImageOpen}
        onClose={() => setIsImageOpen(false)}
        imageUrl={receipt.imageUrl}
        restaurantName={receipt.restaurantName}
      />

      <ShareSummaryModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        summary={splitSummary}
        restaurantName={receipt.restaurantName}
        currency={receipt.currency}
      />
    </div>
  );
}
