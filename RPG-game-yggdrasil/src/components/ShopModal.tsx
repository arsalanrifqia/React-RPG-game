import React from 'react';
import { X, ShoppingBag, Coins, Sparkles } from 'lucide-react';
import { CharacterData, Item } from '../types';
import { LOOT_POOL } from '../utils/gameData';

interface ShopModalProps {
  character: CharacterData;
  userCoins: number;
  onClose: () => void;
  onBuyItem: (item: Item, cost: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ character, userCoins, onClose, onBuyItem }) => {
  const shopItems = LOOT_POOL.filter(i => i.type === 'potion' || i.rarity === 'Uncommon' || i.rarity === 'Rare');

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Merchant Bazaar</h2>
              <p className="text-xs text-slate-400">Purchase provisions, elixirs, and weapons</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-amber-400 text-xs font-bold">
            <Coins className="w-4 h-4" /> {userCoins} Coins
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="my-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1 flex-1">
          {shopItems.map((item, idx) => {
            const canAfford = userCoins >= item.value;
            return (
              <div key={item.id + idx} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm text-slate-100">{item.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      item.rarity === 'Rare' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      item.rarity === 'Uncommon' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {item.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{item.description}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> {item.value} Coins
                  </span>
                  <button
                    onClick={() => canAfford && onBuyItem(item, item.value)}
                    disabled={!canAfford}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Buy
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
