import React, { useState, useEffect } from 'react';
import { X, Trophy, Award } from 'lucide-react';
import { CharacterData } from '../types';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [leaders, setLeaders] = useState<CharacterData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setLeaders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Realm Leaderboard</h2>
              <p className="text-xs text-slate-400">Top ranked heroes across all dungeons</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="my-4 overflow-y-auto space-y-2 pr-1 flex-1">
          {loading ? (
            <div className="text-center text-slate-500 py-12 text-xs">Loading legends...</div>
          ) : leaders.length === 0 ? (
            <div className="text-center text-slate-500 py-12 text-xs">No heroes recorded yet. Be the first!</div>
          ) : (
            leaders.map((hero, idx) => (
              <div
                key={hero.uid || idx}
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  idx === 0 ? 'bg-amber-950/30 border-amber-500/50' :
                  idx === 1 ? 'bg-slate-800/80 border-slate-700' :
                  idx === 2 ? 'bg-orange-950/20 border-orange-800/40' :
                  'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    idx === 0 ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' :
                    idx === 1 ? 'bg-slate-300 text-slate-950' :
                    idx === 2 ? 'bg-orange-500 text-slate-950' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{hero.name}</h4>
                    <span className="text-[11px] text-slate-400">{hero.className} Class</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-amber-400">Level {hero.level}</div>
                  <span className="text-[10px] text-slate-500">{hero.exp} EXP</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
