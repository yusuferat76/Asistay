import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ReceiptData, SplitSummary } from '../types/bill';
import { getParticipantColor } from '../utils/splitCalculator';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  Users,
  CheckCircle2,
  Trash2,
  HelpCircle,
  CornerDownLeft,
  X,
} from 'lucide-react';

interface ChatPaneProps {
  messages: ChatMessage[];
  receipt: ReceiptData;
  splitSummary: SplitSummary;
  participants: string[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onAddParticipant: (name: string) => void;
  onRemoveParticipant: (name: string) => void;
  onClearHistory: () => void;
}

export const ChatPane: React.FC<ChatPaneProps> = ({
  messages,
  receipt,
  splitSummary,
  participants,
  isLoading,
  onSendMessage,
  onAddParticipant,
  onRemoveParticipant,
  onClearHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const [newPersonName, setNewPersonName] = useState('');
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPersonName.trim()) {
      onAddParticipant(newPersonName.trim());
      setNewPersonName('');
      setIsAddingPerson(false);
    }
  };

  // Generate dynamic contextual suggestions based on current receipt state
  const unassignedItems = receipt.items.filter((i) => (i.assignedTo || []).length === 0);
  const dynamicSuggestions: string[] = [];

  if (unassignedItems.length > 0 && participants.length > 0) {
    dynamicSuggestions.push(`${participants[0]} had the ${unassignedItems[0].name.toLowerCase()}`);
  }
  if (unassignedItems.length > 1 && participants.length > 1) {
    dynamicSuggestions.push(`${participants[0]} and ${participants[1]} shared the ${unassignedItems[1].name.toLowerCase()}`);
  }
  if (unassignedItems.length > 0) {
    dynamicSuggestions.push(`Split ${unassignedItems[0].name.toLowerCase()} evenly among everyone`);
  }
  dynamicSuggestions.push('Who owes what right now?');
  dynamicSuggestions.push('Set tip to 20%');

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Smart Split Assistant</h3>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Type natural commands to assign items and split tabs
            </p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          title="Clear chat history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Participants Quick Bar */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium text-slate-300">People ({participants.length}):</span>
        </div>

        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto no-scrollbar">
          {participants.map((person, idx) => {
            const color = getParticipantColor(idx);
            return (
              <span
                key={person}
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 ${color.bg} ${color.text} ${color.border}`}
              >
                <span>{person}</span>
                <button
                  onClick={() => onRemoveParticipant(person)}
                  className="hover:opacity-75 transition-opacity"
                  title={`Remove ${person}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}

          {isAddingPerson ? (
            <form onSubmit={handleCreatePerson} className="inline-flex items-center gap-1 shrink-0">
              <input
                type="text"
                placeholder="Name"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                autoFocus
                className="w-20 px-2 py-0.5 text-xs bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-2 py-0.5 text-xs bg-indigo-600 text-white rounded font-medium"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingPerson(false)}
                className="text-slate-400 hover:text-white px-1"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingPerson(true)}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition shrink-0"
            >
              <Plus className="w-3 h-3" />
              <span>Add Person</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scrollable Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/30'
                  : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 shadow-sm'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {msg.text}
              </div>

              {/* Action badges if any changes were applied */}
              {msg.actionBadges && msg.actionBadges.length > 0 && (
                <div className="pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                  {msg.actionBadges.map((badge, bIdx) => (
                    <span
                      key={bIdx}
                      className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{badge}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Message timestamp */}
              <div
                className={`text-[10px] text-right ${
                  msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 text-slate-300 flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-slate-400 ml-1">Analyzing receipt instructions...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 space-y-2 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
          <HelpCircle className="w-3 h-3 text-indigo-400" />
          <span>Quick Suggestions</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {dynamicSuggestions.map((suggestion, sIdx) => (
            <button
              key={sIdx}
              onClick={() => onSendMessage(suggestion)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 border border-slate-700/80 whitespace-nowrap transition"
            >
              "{suggestion}"
            </button>
          ))}
        </div>

        {/* Chat input box */}
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2 pt-1">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder={`e.g. "Dhruv had the nachos" or "Sarah & Sue shared the pizza"...`}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700/90 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-950/40"
          >
            <span>Send</span>
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
