export type ClassType = 'Warrior' | 'Mage' | 'Rogue';

export type StatType = 'strength' | 'intelligence' | 'agility' | 'vitality';

export type StatusEffectType = 'burn' | 'poison' | 'sleep' | 'stun' | 'freeze' | 'bleed';

export interface StatusEffect {
  type: StatusEffectType;
  duration: number; // turns remaining
  potency: number; // damage or skip chance
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  cooldown: number; // turns
  currentCooldown?: number;
  type: 'attack' | 'heal' | 'buff' | 'debuff';
  element?: string;
  statusEffect?: StatusEffectType;
  statusChance?: number;
  multiplier: number;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'potion';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  stats: {
    strength?: number;
    intelligence?: number;
    agility?: number;
    vitality?: number;
    defense?: number;
    hp?: number;
    mana?: number;
  };
  value: number;
  description: string;
  icon?: string;
}

export interface CharacterData {
  uid: string;
  name: string;
  className: ClassType;
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  strength: number;
  intelligence: number;
  agility: number;
  vitality: number;
  statPoints: number;
  equipment: {
    weapon: Item | null;
    armor: Item | null;
    accessory: Item | null;
  };
  inventory: Item[];
}

export interface Dungeon {
  id: string;
  name: string;
  description: string;
  recommendedLevel: number;
  floors: number;
  bossName: string;
  bossHp: number;
  bossAttack: number;
  bgImage?: string;
}

export interface MultiplayerRoom {
  id: string;
  type: 'coop' | 'pvp';
  dungeonId?: string;
  difficulty?: string;
  host: { uid: string; name: string; className: ClassType; level: number };
  players: { uid: string; name: string; className: ClassType; level: number }[];
  status: 'waiting' | 'in-game' | 'finished';
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderUid: string;
  text: string;
  timestamp: any;
  room?: string;
}
