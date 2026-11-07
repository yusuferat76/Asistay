import React, { useState } from 'react';
import { ReceiptItem } from '../types/bill';
import { getParticipantColor } from '../utils/splitCalculator';
import { Users, Plus, Check, Trash2, Edit2, X } from 'lucide-react';

interface ReceiptItemCardProps {
  item: ReceiptItem;
  allParticipants: string[];
  currency: string;
  onToggleAssign: (itemId: string, person: string) => void;
  onSplitAll: (itemId: string) => void;
  onClearAssign: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, name: string, price: number) => void;
}

export const ReceiptItemCard: React.FC<ReceiptItemCardProps> = ({
  item,
  allParticipants,
  currency,
  onToggleAssign,
  onSplitAll,
  onClearAssign,
  onDeleteItem,
  onUpdateItem,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editPrice, setEditPrice] = useState(item.price.toString());
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const assignees = item.assignedTo || [];
  const isAssigned = assignees.length > 0;
  const splitCostPerPerson = isAssigned ? (item.price / assignees.length).toFixed(2) : item.price.toFixed(2);

  const handleSaveEdit = () => {
    const parsedPrice = parseFloat(editPrice);
    if (editName.trim() && !isNaN(parsedPrice) && parsedPrice >= 0) {
      onUpdateItem(item.id, editName.trim(), parsedPrice);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`relative group rounded-xl p-3.5 transition-all duration-200 border ${
        isAssigned
          ? 'bg-slate-900/80 border-slate-700/60 hover:border-slate-600 shadow-sm'
          : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
      }`}
    >
      {isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 px-2.5 py-1 text-sm bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              placeholder="Item name"
            />
            <div className="relative w-24">
              <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">{currency}</span>
              <input
                type="number"
                step="0.01"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full pl-6 pr-2 py-1 text-sm bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-mono"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Top row: Quantity, Name, and Price */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-baseline gap-2 flex-1 min-w-0">
              {item.quantity > 1 && (
                <span className="px-1.5 py-0.5 text-xs font-bold font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                  {item.quantity}x
                </span>
              )}
              <h4 className="font-semibold text-sm text-slate-100 truncate group-hover:text-white transition">
                {item.name}
              </h4>
              {item.category && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
                  {item.category}
                </span>
              )}
            </div>

            <div className="text-right shrink-0">
              <span className="font-mono font-bold text-sm text-emerald-400">
                {currency}{item.price.toFixed(2)}
              </span>
              {isAssigned && assignees.length > 1 && (
                <div className="text-[11px] text-slate-400 font-mono">
                  {currency}{splitCostPerPerson} each
                </div>
              )}
            </div>
          </div>

          {/* Bottom row: Assigned Chips & Actions */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap min-h-6">
              {isAssigned ? (
                assignees.map((person) => {
                  const pIdx = allParticipants.indexOf(person);
                  const color = getParticipantColor(pIdx >= 0 ? pIdx : 0);
                  return (
                    <span
                      key={person}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${color.bg} ${color.text} ${color.border}`}
                    >
                      <span>{person}</span>
                      <button
                        onClick={() => onToggleAssign(item.id, person)}
                        className="hover:opacity-75 transition-opacity p-0.5"
                        title={`Remove ${person}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-amber-400/90 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Unassigned
                </span>
              )}

              {/* Quick assign button */}
              <div className="relative">
                <button
                  onClick={() => setIsAssignOpen(!isAssignOpen)}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="Assign person"
                >
                  <Plus className="w-3 h-3" />
                  <span>Assign</span>
                </button>

                {isAssignOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsAssignOpen(false)}
                    />
                    <div className="absolute left-0 bottom-full mb-1 z-30 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Select Participants
                      </div>
                      {allParticipants.length === 0 ? (
                        <div className="text-xs text-slate-400 p-2 text-center">
                          Add people in chat or navbar first!
                        </div>
                      ) : (
                        allParticipants.map((person, idx) => {
                          const isSelected = assignees.includes(person);
                          const color = getParticipantColor(idx);
                          return (
                            <button
                              key={person}
                              onClick={() => onToggleAssign(item.id, person)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition ${
                                isSelected
                                  ? `${color.bg} ${color.text} font-semibold`
                                  : 'text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              <span>{person}</span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </button>
                          );
                        })
                      )}

                      {allParticipants.length > 1 && (
                        <div className="pt-1 mt-1 border-t border-slate-700/60">
                          <button
                            onClick={() => {
                              onSplitAll(item.id);
                              setIsAssignOpen(false);
                            }}
                            className="w-full flex items-center justify-center gap-1.5 px-2 py-1 text-xs text-indigo-400 hover:bg-indigo-500/10 rounded-lg font-medium transition"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Split All Ways</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Edit / Delete actions */}
            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
                title="Edit item"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteItem(item.id)}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                title="Delete item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
