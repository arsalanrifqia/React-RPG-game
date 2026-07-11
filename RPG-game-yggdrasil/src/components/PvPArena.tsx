import React, { useState, useEffect } from 'react';
import { X, Zap, Swords, Play, Plus, Shield } from 'lucide-react';
import { CharacterData, MultiplayerRoom } from '../types';
import { io, Socket } from 'socket.io-client';

interface PvPArenaProps {
  character: CharacterData;
  onClose: () => void;
  onStartPvPCombat: (room: MultiplayerRoom, socket: Socket) => void;
}

export const PvPArena: React.FC<PvPArenaProps> = ({ character, onClose, onStartPvPCombat }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<MultiplayerRoom[]>([]);
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
      onStartPvPCombat(room, s);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const handleCreatePvPRoom = () => {
    if (!socket) return;
    socket.emit('create-room', {
      type: 'pvp',
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
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Real-time PvP Arena</h2>
              <p className="text-xs text-slate-400">Challenge rival players in tactical turn-based duels</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {activeRoom ? (
          <div className="my-8 flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="text-center">
              <span className="text-xs uppercase tracking-widest text-purple-400 font-bold bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800">
                PvP Duel Arena ({activeRoom.id})
              </span>
              <h3 className="text-2xl font-bold text-slate-100 mt-2">Waiting for Opponent</h3>
            </div>

            <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase">Arena Challengers ({activeRoom.players.length}/2)</h4>
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
                disabled={activeRoom.players.length < 2}
                className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all cursor-pointer ${
                  activeRoom.players.length >= 2
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {activeRoom.players.length < 2 ? 'Waiting for Opponent to Join...' : 'Begin Duel'}
              </button>
            ) : (
              <p className="text-xs text-slate-400 italic">Waiting for room host to start the duel...</p>
            )}

            <button
              onClick={() => {
                socket?.emit('leave-room', { roomId: activeRoom.id, uid: character.uid });
                setActiveRoom(null);
              }}
              className="text-xs text-red-400 hover:underline cursor-pointer"
            >
              Leave Arena
            </button>
          </div>
        ) : (
          <div className="my-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Duels</h3>
              <button
                onClick={handleCreatePvPRoom}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
              >
                <Plus className="w-4 h-4" /> Create Arena Room
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {rooms.filter(r => r.type === 'pvp' && r.status === 'waiting').length === 0 ? (
                <div className="text-center text-slate-500 py-16 text-xs">
                  No active PvP rooms. Create a room and invite a rival!
                </div>
              ) : (
                rooms.filter(r => r.type === 'pvp' && r.status === 'waiting').map((r) => (
                  <div key={r.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">Challenger: {r.host.name}</h4>
                      <p className="text-xs text-slate-400">{r.host.className} (Level {r.host.level})</p>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(r.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Enter Duel
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
