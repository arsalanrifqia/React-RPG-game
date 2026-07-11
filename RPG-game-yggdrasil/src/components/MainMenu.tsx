import React, { useState } from "react";
import { Shield, Sword, Sparkles, Zap, Trophy, ShoppingBag, MessageSquare, Flame, Swords, Plus, LogOut, Heart } from "lucide-react";
import { CharacterData, Dungeon, Item, MultiplayerRoom } from "../types";
import { CLASS_DATA } from "../utils/gameData";

interface MainMenuProps {
  currentUser: { uid: string; displayName: string };
  character: CharacterData;
  userCoins: number;
  onOpenDungeon: () => void;
  onOpenPvP: () => void;
  onOpenInventory: () => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onToggleChat: () => void;
  onLogout: () => void;
  onAllocateStat: (stat: string) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ currentUser, character, userCoins, onOpenDungeon, onOpenPvP, onOpenInventory, onOpenShop, onOpenLeaderboard, onToggleChat, onLogout, onAllocateStat }) => {
  const classInfo = CLASS_DATA[character.className];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-amber-400 to-purple-300 bg-clip-text text-transparent">Realm of Legends</h1>
            <p className="text-xs text-slate-400">Online Multiplayer RPG</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Coins:</span>
            <span className="font-bold text-amber-400">{userCoins}</span>
          </div>

          <button onClick={onToggleChat} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-200 transition-colors cursor-pointer relative" title="Open Chat">
            <MessageSquare className="w-4 h-4" />
          </button>

          <button onClick={onLogout} className="p-2.5 bg-slate-800 hover:bg-red-950/50 hover:text-red-400 rounded-xl border border-slate-700 text-slate-200 transition-colors cursor-pointer" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Hub Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 z-10">
        {/* Left Column: Character Card & Stats */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${classInfo.color} flex items-center justify-center text-white shadow-xl`}>
                {character.className === "Warrior" && <Sword className="w-8 h-8" />}
                {character.className === "Mage" && <Sparkles className="w-8 h-8" />}
                {character.className === "Rogue" && <Zap className="w-8 h-8" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">{character.name}</h2>
                <p className="text-xs text-amber-400 font-semibold">
                  {character.className} • Level {character.level}
                </p>
                <div className="text-[11px] text-slate-400 mt-1">
                  EXP: {character.exp} / {character.expToNext}
                </div>
              </div>
            </div>

            {/* EXP Bar */}
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 mb-6">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300" style={{ width: `${Math.min(100, (character.exp / character.expToNext) * 100)}%` }} />
            </div>

            {/* Attributes */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 font-medium">Strength (STR)</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-amber-400">{character.strength}</span>
                  {character.statPoints > 0 && (
                    <button onClick={() => onAllocateStat("strength")} className="w-6 h-6 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer">
                      +
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 font-medium">Intelligence (INT)</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-blue-400">{character.intelligence}</span>
                  {character.statPoints > 0 && (
                    <button onClick={() => onAllocateStat("intelligence")} className="w-6 h-6 bg-blue-500 hover:bg-blue-400 text-slate-950 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer">
                      +
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 font-medium">Agility (AGI)</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-emerald-400">{character.agility}</span>
                  {character.statPoints > 0 && (
                    <button onClick={() => onAllocateStat("agility")} className="w-6 h-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer">
                      +
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 font-medium">Vitality (VIT)</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-rose-400">{character.vitality}</span>
                  {character.statPoints > 0 && (
                    <button onClick={() => onAllocateStat("vitality")} className="w-6 h-6 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer">
                      +
                    </button>
                  )}
                </div>
              </div>
            </div>

            {character.statPoints > 0 && <div className="p-3 bg-amber-950/50 border border-amber-500/50 rounded-xl text-center text-xs text-amber-300 font-semibold animate-pulse">You have {character.statPoints} unspent Stat Point(s)!</div>}
          </div>

          <button onClick={onOpenInventory} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4">
            <Sword className="w-4 h-4 text-purple-400" /> Manage Equipment & Inventory
          </button>
        </div>

        {/* Right 2 Columns: Main Hub Game Modes */}
        {/* lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 content-start">
          {/* Dungeon Raid Card */}
          <div
            onClick={onOpenDungeon}
            className="bg-gradient-to-br from-orange-950/40 via-slate-900 to-slate-900 border border-orange-500/30 hover:border-orange-500/80 rounded-3xl p-6 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-orange-400 transition-colors">Dungeon Expeditions</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Venture into treacherous crypts and fiery citadels. Play solo or party up in co-op mode with real-time room syncing.</p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-orange-400">
              <span>Enter Dungeons</span> →
            </div>
          </div>

          {/* PvP Arena Card */}
          <div
            onClick={onOpenPvP}
            className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 hover:border-purple-500/80 rounded-3xl p-6 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Swords className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-purple-400 transition-colors">Real-time PvP Arena</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Test your combat prowess against rival champions in tactical real-time multiplayer duels.</p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-purple-400">
              <span>Enter Arena</span> →
            </div>
          </div>

          {/* Shop Card */}
          <div onClick={onOpenShop} className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl transition-all cursor-pointer group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors">Merchant Bazaar</h3>
              <p className="text-xs text-slate-400 mt-2">Acquire health potions, elixirs, and rare gear provisions with your earned coins.</p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-400">
              <span>Browse Shop</span> →
            </div>
          </div>

          {/* Leaderboard Card */}
          <div onClick={onOpenLeaderboard} className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl transition-all cursor-pointer group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">Realm Leaderboard</h3>
              <p className="text-xs text-slate-400 mt-2">Check top-ranked heroes and legendary players across the realm.</p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-400">
              <span>View Ranks</span> →
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
