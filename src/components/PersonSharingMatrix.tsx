import React from 'react';
import { User, Check, Plus, Trash2, Users } from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';

interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  assignedTo: string[];
}

interface PersonSharingMatrixProps {
  items: ReceiptItem[];
  participants: string[];
  onToggleAssignment: (itemId: string, personName: string) => void;
  onAddParticipant: (name: string) => void;
  onRemoveParticipant: (name: string) => void;
}

export const PersonSharingMatrix: React.FC<PersonSharingMatrixProps> = ({
  items,
  participants,
  onToggleAssignment,
  onAddParticipant,
  onRemoveParticipant,
}) => {
  const [newPersonName, setNewPersonName] = React.useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPersonName.trim()) {
      onAddParticipant(newPersonName.trim());
      setNewPersonName('');
      playTacticalSound('click');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] rounded-2xl border border-blue-900/40 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-blue-900/40 bg-[#0a0a0a] flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-400">
          <Users className="w-5 h-5" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-white">Kişi Paylaşım Matrisi</h3>
        </div>
        
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Yeni Kişi..."
            className="px-3 py-1.5 bg-black border border-blue-900/40 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 w-32 transition"
          />
          <button
            type="submit"
            className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Matrix Body */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-[#0a0a0a]">
            <tr>
              <th className="p-4 text-left border-b border-blue-900/20 min-w-[200px] text-slate-400 font-bold uppercase tracking-tighter">
                Fiş Kalemleri
              </th>
              {participants.map((person) => (
                <th 
                  key={person} 
                  className="p-4 border-b border-blue-900/20 text-center group relative min-w-[100px]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-blue-900/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-white font-bold">{person}</span>
                    <button 
                      onClick={() => onRemoveParticipant(person)}
                      className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-red-950 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-blue-950/10 transition-colors group">
                <td className="p-4 border-b border-blue-900/10">
                  <div className="flex flex-col gap-0.5">
                    <div className="text-white font-bold group-hover:text-blue-400 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-emerald-500 font-mono text-[10px]">
                      ₺{item.price.toFixed(2)}
                    </div>
                  </div>
                </td>
                {participants.map((person) => {
                  const isAssigned = item.assignedTo.includes(person);
                  return (
                    <td 
                      key={person} 
                      className="p-4 border-b border-blue-900/10 text-center cursor-pointer"
                      onClick={() => onToggleAssignment(item.id, person)}
                    >
                      <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center transition-all duration-300 border-2 ${
                        isAssigned 
                          ? 'bg-blue-600 border-blue-400 cyber-glow-blue scale-110' 
                          : 'bg-black border-blue-900/30 hover:border-blue-700/60'
                      }`}>
                        {isAssigned ? (
                          <Check className="w-6 h-6 text-white" />
                        ) : null}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-blue-900/10 border border-blue-900/30 flex items-center justify-center text-blue-900">
              <Users className="w-8 h-8" />
            </div>
            <p className="text-slate-500 max-w-xs mx-auto">
              Henüz taranmış kalem bulunamadı. Lütfen bir fatura yükleyin.
            </p>
          </div>
        )}
      </div>

      {/* Summary Row */}
      <div className="p-4 bg-[#0a0a0a] border-t border-blue-900/40 grid grid-cols-2 gap-4">
        <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/40">
          <div className="text-[10px] text-blue-400 font-bold uppercase mb-1">Toplam Kalem</div>
          <div className="text-xl font-black text-white">{items.length}</div>
        </div>
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
          <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Eşleşen Tutar</div>
          <div className="text-xl font-black text-white">
            ₺{items.reduce((acc, it) => acc + (it.assignedTo.length > 0 ? it.price : 0), 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
