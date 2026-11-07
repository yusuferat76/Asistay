import React, { useState } from 'react';
import { ReceiptData, SplitSummary } from '../types/bill';
import { ReceiptItemCard } from './ReceiptItemCard';
import { PersonBreakdownCard } from './PersonBreakdownCard';
import { getParticipantColor } from '../utils/splitCalculator';
import {
  Receipt,
  Plus,
  Percent,
  Calculator,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Filter,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ReceiptPaneProps {
  receipt: ReceiptData;
  splitSummary: SplitSummary;
  allParticipants: string[];
  onToggleAssign: (itemId: string, person: string) => void;
  onSplitAll: (itemId: string) => void;
  onClearAssign: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, name: string, price: number) => void;
  onAddItem: (name: string, price: number, category: string) => void;
  onUpdateTax: (tax: number) => void;
  onUpdateTipPercentage: (tipPercent: number) => void;
  onUpdateTipAmount: (tipAmount: number) => void;
  onViewImage: () => void;
}

export const ReceiptPane: React.FC<ReceiptPaneProps> = ({
  receipt,
  splitSummary,
  allParticipants,
  onToggleAssign,
  onSplitAll,
  onClearAssign,
  onDeleteItem,
  onUpdateItem,
  onAddItem,
  onUpdateTax,
  onUpdateTipPercentage,
  onUpdateTipAmount,
  onViewImage,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'summary'>('items');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('General');
  const [isEditingTax, setIsEditingTax] = useState(false);
  const [taxInput, setTaxInput] = useState(receipt.tax.toString());
  const [customTipInput, setCustomTipInput] = useState('');
  const [isCustomTipOpen, setIsCustomTipOpen] = useState(false);

  // Extract unique categories
  const categories = ['ALL', 'UNASSIGNED', ...Array.from(new Set(receipt.items.map((i) => i.category || 'General')))];

  const filteredItems = receipt.items.filter((item) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'UNASSIGNED') return (item.assignedTo || []).length === 0;
    return (item.category || 'General') === filterCategory;
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(newItemPrice);
    if (newItemName.trim() && !isNaN(p) && p >= 0) {
      onAddItem(newItemName.trim(), p, newItemCategory);
      setNewItemName('');
      setNewItemPrice('');
      setIsAddingItem(false);
    }
  };

  const handleSaveTax = () => {
    const t = parseFloat(taxInput);
    if (!isNaN(t) && t >= 0) {
      onUpdateTax(t);
      setIsEditingTax(false);
    }
  };

  const handleApplyCustomTip = () => {
    const amt = parseFloat(customTipInput);
    if (!isNaN(amt) && amt >= 0) {
      onUpdateTipAmount(amt);
      setIsCustomTipOpen(false);
      setCustomTipInput('');
    }
  };

  const assignedPercent = splitSummary.totalSubtotal > 0
    ? Math.min(100, Math.round((splitSummary.assignedSubtotal / splitSummary.totalSubtotal) * 100))
    : 0;

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 overflow-hidden">
      {/* Receipt Top Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate">
                {receipt.restaurantName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{receipt.date}</span>
                <span>•</span>
                <span>{receipt.items.length} items</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {receipt.imageUrl && (
              <button
                onClick={onViewImage}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700/60"
                title="View original uploaded receipt image"
              >
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Photo</span>
              </button>
            )}

            <button
              onClick={() => setIsAddingItem(!isAddingItem)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Assignment Progress & Distribution Bar */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              {splitSummary.unassignedSubtotal === 0 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">All Items Assigned!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {receipt.currency}{splitSummary.assignedSubtotal.toFixed(2)} of {receipt.currency}{splitSummary.totalSubtotal.toFixed(2)} claimed ({assignedPercent}%)
                  </span>
                </>
              )}
            </span>
            <span className="font-mono text-slate-400">
              {splitSummary.assignedItemsCount} / {splitSummary.totalItemsCount} items
            </span>
          </div>

          {/* Multi-segmented color progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
            {splitSummary.participantsShares.map((p, idx) => {
              const color = getParticipantColor(idx);
              const widthPct = splitSummary.totalSubtotal > 0
                ? (p.subtotal / splitSummary.totalSubtotal) * 100
                : 0;
              if (widthPct <= 0) return null;
              return (
                <div
                  key={p.participantName}
                  style={{ width: `${widthPct}%`, backgroundColor: color.hex }}
                  title={`${p.participantName}: ${widthPct.toFixed(1)}%`}
                  className="h-full transition-all duration-300"
                />
              );
            })}
            {splitSummary.unassignedSubtotal > 0 && (
              <div
                style={{
                  width: `${(splitSummary.unassignedSubtotal / splitSummary.totalSubtotal) * 100}%`,
                }}
                className="h-full bg-amber-500/30 transition-all duration-300"
                title={`Unassigned: ${splitSummary.unassignedSubtotal.toFixed(2)}`}
              />
            )}
          </div>
        </div>

        {/* View Switcher: Items List vs Real-Time Who Owes What */}
        <div className="flex mt-3 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'items'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Receipt Items ({receipt.items.length})
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'summary'
                ? 'bg-emerald-600/90 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Who Owes What</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {splitSummary.participantsShares.filter((p) => p.total > 0).length}
            </span>
          </button>
        </div>
      </div>

      {/* Manual Item Creator Drawer */}
      {isAddingItem && (
        <form onSubmit={handleCreateItem} className="p-3 bg-slate-900 border-b border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-300">Add New Receipt Item</div>
          <div className="grid grid-cols-12 gap-2">
            <input
              type="text"
              placeholder="Item name (e.g., Crispy Wings)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="col-span-6 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              required
            />
            <div className="col-span-3 relative">
              <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">{receipt.currency}</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="w-full pl-6 pr-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="col-span-3 px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Appetizer">Appetizer</option>
              <option value="Main">Main</option>
              <option value="Drinks">Drinks</option>
              <option value="Dessert">Dessert</option>
              <option value="Sides">Sides</option>
              <option value="General">General</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
            >
              Add Item
            </button>
          </div>
        </form>
      )}

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'items' ? (
          <div className="space-y-3">
            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                    filterCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat === 'UNASSIGNED' ? `⚠️ Unassigned (${splitSummary.unassignedItems.length})` : cat}
                </button>
              ))}
            </div>

            {/* Items Cards */}
            <div className="space-y-2">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No items in this filter category.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <ReceiptItemCard
                    key={item.id}
                    item={item}
                    allParticipants={allParticipants}
                    currency={receipt.currency}
                    onToggleAssign={onToggleAssign}
                    onSplitAll={onSplitAll}
                    onClearAssign={onClearAssign}
                    onDeleteItem={onDeleteItem}
                    onUpdateItem={onUpdateItem}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          /* Who Owes What Tab */
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Per-Person Breakdown</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Tax & Tip automatically distributed
              </span>
            </div>

            {splitSummary.participantsShares.map((share, idx) => (
              <PersonBreakdownCard
                key={share.participantName}
                share={share}
                index={idx}
                currency={receipt.currency}
              />
            ))}

            {splitSummary.unassignedSubtotal > 0 && (
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Unassigned Remaining</span>
                  </span>
                  <span className="font-mono">{receipt.currency}{splitSummary.unassignedTotal.toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-amber-200/80">
                  {splitSummary.unassignedItems.length} items ({receipt.currency}{splitSummary.unassignedSubtotal.toFixed(2)} subtotal + {receipt.currency}{splitSummary.unassignedTax.toFixed(2)} tax + {receipt.currency}{splitSummary.unassignedTip.toFixed(2)} tip) are not assigned yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Subtotals, Tax & Tip Footer */}
      <div className="p-4 bg-slate-900/95 border-t border-slate-800 space-y-2.5">
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Items Subtotal:</span>
            <span className="font-mono font-semibold text-slate-200">
              {receipt.currency}{splitSummary.totalSubtotal.toFixed(2)}
            </span>
          </div>

          {/* Tax row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Sales Tax:</span>
              <button
                onClick={() => {
                  setTaxInput(receipt.tax.toString());
                  setIsEditingTax(!isEditingTax);
                }}
                className="text-[11px] text-indigo-400 hover:underline"
              >
                {isEditingTax ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {isEditingTax ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">{receipt.currency}</span>
                <input
                  type="number"
                  step="0.01"
                  value={taxInput}
                  onChange={(e) => setTaxInput(e.target.value)}
                  className="w-16 px-1.5 py-0.5 text-xs bg-slate-800 border border-slate-600 rounded text-right font-mono text-white focus:outline-none"
                />
                <button
                  onClick={handleSaveTax}
                  className="px-1.5 py-0.5 text-[10px] bg-indigo-600 text-white rounded font-medium"
                >
                  OK
                </button>
              </div>
            ) : (
              <span className="font-mono font-semibold text-slate-200">
                +{receipt.currency}{receipt.tax.toFixed(2)}
              </span>
            )}
          </div>

          {/* Tip Selector row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400 flex items-center gap-1">
              <span>Tip / Gratuity:</span>
            </span>
            <span className="font-mono font-semibold text-emerald-400">
              +{receipt.currency}{receipt.tip.toFixed(2)}
            </span>
          </div>

          {/* Tip quick preset pills */}
          <div className="flex items-center gap-1 pt-0.5">
            {[15, 18, 20, 25].map((pct) => {
              const active = receipt.tipPercentage === pct;
              return (
                <button
                  key={pct}
                  onClick={() => onUpdateTipPercentage(pct)}
                  className={`flex-1 py-1 rounded-md text-[11px] font-semibold font-mono transition border ${
                    active
                      ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500/50'
                      : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700/60'
                  }`}
                >
                  {pct}%
                </button>
              );
            })}
            <button
              onClick={() => setIsCustomTipOpen(!isCustomTipOpen)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition border ${
                isCustomTipOpen
                  ? 'bg-indigo-600/30 text-indigo-400 border-indigo-500/50'
                  : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700/60'
              }`}
            >
              Custom
            </button>
          </div>

          {isCustomTipOpen && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-xs text-slate-400">Set Tip $:</span>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 15.00"
                value={customTipInput}
                onChange={(e) => setCustomTipInput(e.target.value)}
                className="flex-1 px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded text-white font-mono focus:outline-none"
              />
              <button
                onClick={handleApplyCustomTip}
                className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-500 transition"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Receipt Grand Total
            </div>
            <div className="text-xs text-slate-400">
              Includes Subtotal + Tax + Tip
            </div>
          </div>
          <div className="font-mono font-extrabold text-xl text-white">
            {receipt.currency}{splitSummary.grandTotal.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
