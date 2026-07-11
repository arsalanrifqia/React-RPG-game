import { ClassType, Skill, Item, Dungeon, StatusEffect } from "../types";

export const CLASS_DATA: Record<ClassType, {
  name: ClassType;
  description: string;
  icon: string;
  color: string;
  baseStats: { strength: number; intelligence: number; agility: number; vitality: number; hp: number; mana: number };
  skills: Skill[];
}> = {
  Warrior: {
    name: 'Warrior',
    description: 'A stalwart melee champion with massive defense and bone-crushing physical strikes.',
    icon: 'Sword',
    color: 'from-amber-600 to-red-700',
    baseStats: { strength: 18, intelligence: 8, agility: 10, vitality: 20, hp: 180, mana: 80 },
    skills: [
      { id: 'w1', name: 'Heavy Strike', description: 'A devastating physical blow dealing 150% damage.', manaCost: 15, cooldown: 0, type: 'attack', multiplier: 1.5 },
      { id: 'w2', name: 'Shield Bash', description: 'Bash the enemy with your shield, dealing damage and stunning them for 1 turn.', manaCost: 20, cooldown: 2, type: 'attack', statusEffect: 'stun', statusChance: 0.8, multiplier: 1.2 },
      { id: 'w3', name: 'Rending Cleave', description: 'Slash deeply, causing severe bleeding damage over 3 turns.', manaCost: 25, cooldown: 3, type: 'attack', statusEffect: 'bleed', statusChance: 1.0, multiplier: 1.4 },
      { id: 'w4', name: 'Battle Cry', description: 'Bolster your spirit, increasing strength and restoring HP.', manaCost: 30, cooldown: 4, type: 'buff', multiplier: 0 }
    ]
  },
  Mage: {
    name: 'Mage',
    description: 'A master of arcane elements, unleashing devastating spellbursts and burning enemies.',
    icon: 'Sparkles',
    color: 'from-blue-600 to-indigo-800',
    baseStats: { strength: 6, intelligence: 22, agility: 12, vitality: 10, hp: 120, mana: 180 },
    skills: [
      { id: 'm1', name: 'Arcane Bolt', description: 'Fire a concentrated bolt of pure arcane magic.', manaCost: 15, cooldown: 0, type: 'attack', multiplier: 1.6 },
      { id: 'm2', name: 'Fireball', description: 'Hurl a blazing orb that burns the target over 3 turns.', manaCost: 30, cooldown: 2, type: 'attack', statusEffect: 'burn', statusChance: 0.9, multiplier: 2.0 },
      { id: 'm3', name: 'Frost Nova', description: 'Freeze the enemy in ice, potentially freezing them for 1 turn.', manaCost: 35, cooldown: 3, type: 'attack', statusEffect: 'freeze', statusChance: 0.7, multiplier: 1.5 },
      { id: 'm4', name: 'Mana Shield', description: 'Absorb incoming damage using magical reserves.', manaCost: 40, cooldown: 4, type: 'buff', multiplier: 0 }
    ]
  },
  Rogue: {
    name: 'Rogue',
    description: 'A nimble shadow assassin relying on lightning-fast reflexes, crits, and lethal poisons.',
    icon: 'Zap',
    color: 'from-emerald-600 to-teal-800',
    baseStats: { strength: 12, intelligence: 10, agility: 22, vitality: 12, hp: 140, mana: 100 },
    skills: [
      { id: 'r1', name: 'Quick Slash', description: 'A swift strike with high critical strike chance.', manaCost: 15, cooldown: 0, type: 'attack', multiplier: 1.4 },
      { id: 'r2', name: 'Venom Dagger', description: 'Poison the enemy’s bloodstream, dealing recurring damage.', manaCost: 20, cooldown: 2, type: 'attack', statusEffect: 'poison', statusChance: 0.9, multiplier: 1.3 },
      { id: 'r3', name: 'Shadow Step', description: 'Vanish into shadows, dodging the next attack and striking viciously.', manaCost: 30, cooldown: 3, type: 'attack', statusEffect: 'sleep', statusChance: 0.5, multiplier: 1.8 },
      { id: 'r4', name: 'Lethal Ambush', description: 'A surprise assault from the blind spot.', manaCost: 35, cooldown: 4, type: 'attack', multiplier: 2.2 }
    ]
  }
};

export const DUNGEONS: Dungeon[] = [
  {
    id: 'd1',
    name: 'Desa yang Sudah Dijjarah (Plundered Village)',
    description: 'A once-peaceful village left in smoldering ruins by savage raiders and arsonists.',
    recommendedLevel: 1,
    floors: 6,
    bossName: 'Warlord Gulgrak, Ravager Chief',
    bossHp: 300,
    bossAttack: 25
  },
  {
    id: 'd2',
    name: 'Pesisir Pantai (Coastal Shore)',
    description: 'A treacherous tide-swept shoreline haunted by saltwater beasts and deep-sea sirens.',
    recommendedLevel: 4,
    floors: 6,
    bossName: 'Leviathan, The Deep Terror',
    bossHp: 500,
    bossAttack: 38
  },
  {
    id: 'd3',
    name: 'Padang Pasir (Desert Wasteland)',
    description: 'Endless scorching dunes hiding venomous scorpions, nomads, and cursed pharaoh tombs.',
    recommendedLevel: 8,
    floors: 6,
    bossName: 'Pharaoh Sethis, the Cursed King',
    bossHp: 850,
    bossAttack: 55
  },
  {
    id: 'd4',
    name: 'Reruntuhan Lama (Ancient Ruins)',
    description: 'Crumbled stone archways and overgrown sanctuaries protected by stone automata and relic wraiths.',
    recommendedLevel: 12,
    floors: 6,
    bossName: 'Titan Colossus, Ancient Sentinel',
    bossHp: 1200,
    bossAttack: 75
  },
  {
    id: 'd5',
    name: 'Tempat Elegan Para Dewa (Celestial Pantheon)',
    description: 'A breathtakingly pristine golden sanctuary above the clouds, guarded by divine seraphim and celestial archons.',
    recommendedLevel: 16,
    floors: 6,
    bossName: 'Sovereign Astraea, God of Eternal Light',
    bossHp: 1800,
    bossAttack: 95
  }
];

export const LOOT_POOL: Item[] = [
  { id: 'item_1', name: 'Iron Broadsword', type: 'weapon', rarity: 'Common', stats: { strength: 5 }, value: 50, description: 'A standard military blade.' },
  { id: 'item_2', name: 'Steel Greatsword', type: 'weapon', rarity: 'Uncommon', stats: { strength: 12, agility: 3 }, value: 150, description: 'Heavy and sharp steel.' },
  { id: 'item_3', name: 'Flame Tongue Blade', type: 'weapon', rarity: 'Rare', stats: { strength: 22, intelligence: 10 }, value: 400, description: 'Radiates with magical embers.' },
  { id: 'item_4', name: 'Apprentice Wand', type: 'weapon', rarity: 'Common', stats: { intelligence: 6 }, value: 50, description: 'Channels minor magical sparks.' },
  { id: 'item_5', name: 'Archmage Staff', type: 'weapon', rarity: 'Epic', stats: { intelligence: 35, mana: 50 }, value: 850, description: 'Imbued with ancient celestial energies.' },
  { id: 'item_6', name: 'Shadow Dagger', type: 'weapon', rarity: 'Uncommon', stats: { agility: 10, strength: 4 }, value: 140, description: 'Silent and deadly.' },
  { id: 'item_7', name: 'Assassin Stiletto', type: 'weapon', rarity: 'Rare', stats: { agility: 25 }, value: 420, description: 'Swift executioner weapon.' },
  { id: 'item_8', name: 'Leather Tunic', type: 'armor', rarity: 'Common', stats: { defense: 8, hp: 20 }, value: 60, description: 'Basic protective leather.' },
  { id: 'item_9', name: 'Knight Iron Plate', type: 'armor', rarity: 'Uncommon', stats: { defense: 22, vitality: 10, hp: 50 }, value: 220, description: 'Sturdy plated armor.' },
  { id: 'item_10', name: 'Dragonscale Armor', type: 'armor', rarity: 'Legendary', stats: { defense: 50, vitality: 25, hp: 150 }, value: 2000, description: 'Forged from ancient dragon scales.' },
  { id: 'item_11', name: 'Health Potion', type: 'potion', rarity: 'Common', stats: { hp: 100 }, value: 30, description: 'Restores 100 HP instantly.' },
  { id: 'item_12', name: 'Mana Potion', type: 'potion', rarity: 'Common', stats: { mana: 80 }, value: 30, description: 'Restores 80 Mana instantly.' }
];

export function generateRandomLoot(floor: number): Item {
  const rarities: ('Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary')[] = 
    floor >= 4 ? ['Uncommon', 'Rare', 'Epic', 'Legendary'] :
    floor >= 2 ? ['Common', 'Uncommon', 'Rare', 'Epic'] :
    ['Common', 'Uncommon', 'Rare'];
  
  const chosenRarity = rarities[Math.floor(Math.random() * rarities.length)];
  const matchingItems = LOOT_POOL.filter(i => i.rarity === chosenRarity && i.type !== 'potion');
  const baseItem = matchingItems[Math.floor(Math.random() * matchingItems.length)] || LOOT_POOL[0];
  
  // Clone and scale slightly with floor
  const scaling = 1 + (floor - 1) * 0.25;
  const scaledStats: any = {};
  for (const [k, v] of Object.entries(baseItem.stats)) {
    scaledStats[k] = Math.round(Number(v) * scaling);
  }

  return {
    ...baseItem,
    id: `loot_${Date.now()}_${Math.random().toString(36).substring(2,6)}`,
    stats: scaledStats,
    value: Math.round(baseItem.value * scaling)
  };
}
