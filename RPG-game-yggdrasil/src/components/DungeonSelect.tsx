import React, { useState, useEffect } from 'react';
import { X, Shield, Users, Play, Sparkles, Flame, Plus, Check } from 'lucide-react';
import { Dungeon, CharacterData, MultiplayerRoom } from '../types';
import { DUNGEONS } from '../utils/gameData';
import { io, Socket } from 'socket.io-client';

interface DungeonSelectProps {
  character: CharacterData;
  onClose: () => void;
  onStartSoloCombat: (dungeon: Dungeon, difficulty: string) => void;
  onStartCoopRoom: (room: MultiplayerRoom, socket: Socket) => void;
}

export const DungeonSelect: React.FC<DungeonSelectProps> = ({ character, onClose, onStartSoloCombat, onStartCoopRoom }) => {
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon>(DUNGEONS[0]);
  const [difficulty, setDifficulty] = useState<'Normal' | 'Hard' | 'Nightmare' | 'Abyss'>('Normal');
  const [mode, setMode] = useState<'solo' | 'coop'>('solo');
  const [rooms, setRooms] = useState<MultiplayerRoom[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeRoom, setActiveRoom] = useState<MultiplayerRoom | null>(null);

  useEffect(() => {
    const s = io();
    setSocket(s);

    s.emit('get-rooms');
    s.on('rooms-list', (list: MultiplayerRoom[]) => {
      setRooms(list);
    });

    s.on('room-created', (room: MultiplayerRoom) => {
      setActiveRoom(room);
    });

    s.on('room-updated', (room: MultiplayerRoom) => {
      setActiveRoom(room);
    });

    s.on('game-started', (room: MultiplayerRoom) => {
      onStartCoopRoom(room, s);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const handleCreateCoopRoom = () => {
    if (!socket) return;
    socket.emit('create-room', {
      type: 'coop',
      dungeonId: selectedDungeon.id,
      difficulty,
      player: {
        uid: character.uid,
        name: character.name,
        className: character.className,
        level: character.level
      }
    });
  };

  const handleJoinRoom = (roomId: string) => {
    if (!socket) return;
    socket.emit('join-room', {
      roomId,
      player: {
        uid: character.uid,
        name: character.name,
        className: character.className,
        level: character.level
      }
    });
  };

  const handleStartGame = () => {
    if (!socket || !activeRoom) return;
    socket.emit('start-room-game', { roomId: activeRoom.id });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Dungeon Expeditions</h2>
              <p className="text-xs text-slate-400">Venture solo or party up with adventurers for co-op battles</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {activeRoom ? (
          <div className="my-6 flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="text-center">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800">
                Co-op Room Lobby ({activeRoom.id})
              </span>
              <h3 className="text-2xl font-bold text-slate-100 mt-2">Waiting for Party Members</h3>
            </div>

            <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase">Party Members ({activeRoom.players.length}/3)</h4>
              {activeRoom.players.map((p, idx) => (
                <div key={p.uid || idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-sm text-slate-100">{p.name}</span>
                    <span className="text-xs text-slate-400">({p.className})</span>
                  </div>
                  <span className="text-xs font-bold text-amber-400">Lvl {p.level}</span>
                </div>
              ))}
            </div>

            {activeRoom.host.uid === character.uid ? (
              <button
                onClick={handleStartGame}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Launch Dungeon Raid
              </button>
            ) : (
              <p className="text-xs text-slate-400 italic">Waiting for room host to launch expedition...</p>
            )}

            <button
              onClick={() => {
                socket?.emit('leave-room', { roomId: activeRoom.id, uid: character.uid });
                setActiveRoom(null);
              }}
              className="text-xs text-red-400 hover:underline cursor-pointer"
            >
              Leave Room
            </button>
          </div>
        ) : (
          <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto pr-1">
            {/* Dungeon List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Dungeon</h3>
              {DUNGEONS.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDungeon(d)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                    selectedDungeon.id === d.id
                      ? 'bg-slate-800 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <h4 className="font-bold text-sm text-slate-100">{d.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{d.description}</p>
                  <div className="mt-3 flex justify-between items-center text-[11px] text-amber-400 font-medium">
                    <span>Rec. Level {d.recommendedLevel}+</span>
                    <span>{d.floors} Floors</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Configuration Panel */}
            <div className="md:col-span-2 bg-slate-950/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">{selectedDungeon.name}</h3>
                <p className="text-xs text-slate-400 mb-6">{selectedDungeon.description}</p>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
                  <div className="text-xs text-slate-400 mb-1 font-semibold uppercase">Boss Guardian</div>
                  <div className="text-base font-bold text-amber-300">{selectedDungeon.bossName}</div>
                  <div className="text-xs text-slate-400 mt-1">Boss HP: {selectedDungeon.bossHp} | Attack: {selectedDungeon.bossAttack}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Game Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setMode('solo')}
                        className={`py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          mode === 'solo'
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        Solo Raid
                      </button>
                      <button
                        onClick={() => setMode('coop')}
                        className={`py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          mode === 'coop'
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        Co-op Party
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Normal">Normal (1.0x Stats)</option>
                      <option value="Hard">Hard (1.4x Stats, +50% XP)</option>
                      <option value="Nightmare">Nightmare (2.0x Stats, +100% XP)</option>
                      <option value="Abyss">Abyss (3.0x Stats, Legendary Loot)</option>
                    </select>
                  </div>
                </div>

                {mode === 'coop' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase">Available Co-op Rooms</h4>
                      <button
                        onClick={handleCreateCoopRoom}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create Room
                      </button>
                    </div>
                    {rooms.filter(r => r.type === 'coop' && r.status === 'waiting').length === 0 ? (
                      <div className="text-xs text-slate-500 text-center py-4">No active rooms found. Click Create Room to start one!</div>
                    ) : (
                      <div className="space-y-2 max-h-36 overflow-y-auto">
                        {rooms.filter(r => r.type === 'coop' && r.status === 'waiting').map((r) => (
                          <div key={r.id} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex justify-between items-center text-xs">
                            <div>
                              <span className="font-semibold text-slate-200">Host: {r.host.name}</span>
                              <span className="text-slate-500 ml-2">({r.players.length} players)</span>
                            </div>
                            <button
                              onClick={() => handleJoinRoom(r.id)}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-md transition-colors cursor-pointer"
                            >
                              Join
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {mode === 'solo' && (
                <button
                  onClick={() => onStartSoloCombat(selectedDungeon, difficulty)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-slate-950" /> Start Solo Expedition
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
