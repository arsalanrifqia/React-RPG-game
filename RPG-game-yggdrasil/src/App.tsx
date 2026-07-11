/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { CharacterCreator } from './components/CharacterCreator';
import { MainMenu } from './components/MainMenu';
import { DungeonSelect } from './components/DungeonSelect';
import { PvPArena } from './components/PvPArena';
import { CombatScreen } from './components/CombatScreen';
import { InventoryModal } from './components/InventoryModal';
import { ShopModal } from './components/ShopModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ChatDrawer } from './components/ChatDrawer';
import { CharacterData, Dungeon, Item, MultiplayerRoom } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string; displayName: string } | null>(null);
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [userCoins, setUserCoins] = useState(500);
  const [loading, setLoading] = useState(false);

  // Modals & Screen states
  const [activeModal, setActiveModal] = useState<'none' | 'dungeon' | 'pvp' | 'inventory' | 'shop' | 'leaderboard'>('none');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeCombat, setActiveCombat] = useState<{
    type: 'dungeon' | 'pvp';
    dungeon?: Dungeon;
    difficulty?: string;
    room?: MultiplayerRoom;
    socket?: any;
  } | null>(null);

  // When user logs in, fetch character data
  const handleLoginSuccess = async (user: { uid: string; email: string; displayName: string }) => {
    setCurrentUser(user);
    setLoading(true);
    try {
      const resUser = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const userData = await resUser.json();
      setUserCoins(userData.coins || 500);

      const resChar = await fetch(`/api/character/${user.uid}`);
      const charData = await resChar.json();
      if (charData) {
        setCharacter(charData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateStat = async (stat: string) => {
    if (!character || character.statPoints <= 0) return;
    const updated = {
      ...character,
      [stat]: (character as any)[stat] + 1,
      statPoints: character.statPoints - 1
    };
    setCharacter(updated);
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

  const handleFinishCombat = async (rewards?: { exp: number; coins: number; item?: Item }, won?: boolean) => {
    if (won && rewards && character) {
      let newExp = character.exp + rewards.exp;
      let newLevel = character.level;
      let newExpToNext = character.expToNext;
      let newStatPoints = character.statPoints;
      let newInv = [...character.inventory];

      if (rewards.item) {
        newInv.push(rewards.item);
      }

      if (newExp >= newExpToNext) {
        newLevel += 1;
        newExp -= newExpToNext;
        newExpToNext = Math.round(newExpToNext * 1.5);
        newStatPoints += 3; // 3 stat points per level
      }

      const updated: CharacterData = {
        ...character,
        level: newLevel,
        exp: newExp,
        expToNext: newExpToNext,
        statPoints: newStatPoints,
        inventory: newInv,
        hp: character.maxHp,
        mana: character.maxMana
      };

      setCharacter(updated);
      setUserCoins(c => c + rewards.coins);

      try {
        await fetch('/api/character', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      } catch (e) {
        console.error(e);
      }
    }
    setActiveCombat(null);
  };

  const handleBuyItem = async (item: Item, cost: number) => {
    if (userCoins < cost || !character) return;
    setUserCoins(c => c - cost);
    const updated = {
      ...character,
      inventory: [...character.inventory, item]
    };
    setCharacter(updated);
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

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading character realm...
      </div>
    );
  }

  if (!character) {
    return (
      <CharacterCreator
        uid={currentUser.uid}
        defaultName={currentUser.displayName}
        onCharacterCreated={(char) => setCharacter(char)}
      />
    );
  }

  if (activeCombat) {
    return (
      <CombatScreen
        character={character}
        dungeon={activeCombat.dungeon}
        difficulty={activeCombat.difficulty || 'Normal'}
        onFinishCombat={handleFinishCombat}
      />
    );
  }

  return (
    <>
      <MainMenu
        currentUser={currentUser}
        character={character}
        userCoins={userCoins}
        onOpenDungeon={() => setActiveModal('dungeon')}
        onOpenPvP={() => setActiveModal('pvp')}
        onOpenInventory={() => setActiveModal('inventory')}
        onOpenShop={() => setActiveModal('shop')}
        onOpenLeaderboard={() => setActiveModal('leaderboard')}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onLogout={() => {
          setCurrentUser(null);
          setCharacter(null);
        }}
        onAllocateStat={handleAllocateStat}
      />

      {activeModal === 'dungeon' && (
        <DungeonSelect
          character={character}
          onClose={() => setActiveModal('none')}
          onStartSoloCombat={(dungeon, difficulty) => {
            setActiveModal('none');
            setActiveCombat({ type: 'dungeon', dungeon, difficulty });
          }}
          onStartCoopRoom={(room, socket) => {
            setActiveModal('none');
            setActiveCombat({ type: 'dungeon', room, socket, difficulty: 'Normal' });
          }}
        />
      )}

      {activeModal === 'pvp' && (
        <PvPArena
          character={character}
          onClose={() => setActiveModal('none')}
          onStartPvPCombat={(room, socket) => {
            setActiveModal('none');
            setActiveCombat({ type: 'pvp', room, socket, difficulty: 'Duel' });
          }}
        />
      )}

      {activeModal === 'inventory' && (
        <InventoryModal
          character={character}
          onClose={() => setActiveModal('none')}
          onUpdateCharacter={(updated) => setCharacter(updated)}
        />
      )}

      {activeModal === 'shop' && (
        <ShopModal
          character={character}
          userCoins={userCoins}
          onClose={() => setActiveModal('none')}
          onBuyItem={handleBuyItem}
        />
      )}

      {activeModal === 'leaderboard' && (
        <LeaderboardModal onClose={() => setActiveModal('none')} />
      )}

      <ChatDrawer
        currentUser={currentUser}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}

