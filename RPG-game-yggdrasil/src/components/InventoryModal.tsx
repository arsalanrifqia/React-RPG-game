import React from 'react';
import { X, Shield, Sword, Sparkles, Trash2, CheckCircle } from 'lucide-react';
import { CharacterData, Item } from '../types';

interface InventoryModalProps {
  character: CharacterData;
  onClose: () => void;
  onUpdateCharacter: (updated: CharacterData) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ character, onClose, onUpdateCharacter }) => {
  const equipItem = async (item: Item, index: number) => {
    const slot = item.type;
    if (slot === 'potion') {
      // Use potion
      if (item.stats.hp) {
        const newHp = Math.min(character.maxHp, character.hp + item.stats.hp);
        const newInv = [...character.inventory];
        newInv.splice(index, 1);
        const updated = { ...character, hp: newHp, inventory: newInv };
        await saveChar(updated);
      }
      return;
    }

    if (slot === 'weapon' || slot === 'armor' || slot === 'accessory') {
      const currentEquipped = character.equipment[slot];
      const newInv = [...character.inventory];
      newInv.splice(index, 1);
      if (currentEquipped) {
        newInv.push(currentEquipped);
      }

      const updated = {
        ...character,
        equipment: {
          ...character.equipment,
          [slot]: item
        },
        inventory: newInv
      };
      await saveChar(updated);
    }
  };

  const unequipItem = async (slot: 'weapon' | 'armor' | 'accessory') => {
    const item = character.equipment[slot];
    if (!item) return;

    const newInv = [...character.inventory, item];
    const updated = {
      ...character,
      equipment: {
        ...character.equipment,
        [slot]: null
      },
      inventory: newInv
    };
    await saveChar(updated);
  };

  const saveChar = async (updated: CharacterData) => {
    onUpdateCharacter(updated);
    try {
      await fetch('/api/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate bonus stats from equipment
  const getStatBonus = (stat: string) => {
    let bonus = 0;
    Object.values(character.equipment).forEach((item) => {
      const it = item as Item | null;
      if (it && it.stats && (it.stats as any)[stat]) {
        bonus += (it.stats as any)[stat];
      }
    });
    return bonus;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sword className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Character & Inventory</h2>
              <p className="text-xs text-slate-400">Manage your equipped gear and backpack items</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 overflow-y-auto pr-1">
          {/* Equipment Slots */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Equipped Gear
            </h3>
            
            {(['weapon', 'armor', 'accessory'] as ('weapon' | 'armor' | 'accessory')[]).map((slot) => {
              const eq = character.equipment[slot];
              return (
                <div key={slot} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{slot}</span>
                    {eq && (
                      <button
                        onClick={() => unequipItem(slot)}
                        className="text-[10px] text-red-400 hover:underline cursor-pointer"
                      >
                        Unequip
                      </button>
                    )}
                  </div>
                  {eq ? (
                    <div>
                      <div className="font-semibold text-sm text-amber-300">{eq.name}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {Object.entries(eq.stats).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 italic py-2">Empty Slot</div>
                  )}
                </div>
              );
            })}

            {/* Stats Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
              <div className="font-bold text-slate-300 mb-2">Total Stats</div>
              <div className="flex justify-between">
                <span className="text-slate-400">Strength:</span>
                <span className="text-amber-400 font-semibold">{character.strength} (+{getStatBonus('strength')})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Intelligence:</span>
                <span className="text-blue-400 font-semibold">{character.intelligence} (+{getStatBonus('intelligence')})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Agility:</span>
                <span className="text-emerald-400 font-semibold">{character.agility} (+{getStatBonus('agility')})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vitality:</span>
                <span className="text-rose-400 font-semibold">{character.vitality} (+{getStatBonus('vitality')})</span>
              </div>
            </div>
          </div>

          {/* Backpack Inventory */}
          <div className="md:col-span-2 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col">
            <h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Backpack Inventory ({character.inventory.length})
            </h3>

            {character.inventory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-12">
                Your backpack is empty. Defeat dungeon bosses to claim rare loot!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[350px] pr-1">
                {character.inventory.map((item, idx) => (
                  <div key={item.id + idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm text-slate-200">{item.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          item.rarity === 'Legendary' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                          item.rarity === 'Epic' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                          item.rarity === 'Rare' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {item.rarity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                      <div className="text-[11px] text-emerald-400 mt-2">
                        {Object.entries(item.stats).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={() => equipItem(item, idx)}
                      className="mt-3 w-full py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold rounded-lg border border-purple-500/30 transition-colors cursor-pointer"
                    >
                      {item.type === 'potion' ? 'Drink Potion' : 'Equip Item'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
