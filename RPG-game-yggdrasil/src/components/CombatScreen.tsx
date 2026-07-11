import React, { useState, useEffect } from "react";
import { Shield, Sword, Heart, Zap, Sparkles, Flame, Skull, RefreshCw, ArrowLeft, Swords, Award, AlertCircle } from "lucide-react";
import { CharacterData, Dungeon, Item, StatusEffect } from "../types";
import { CLASS_DATA, generateRandomLoot } from "../utils/gameData";
import confetti from "canvas-confetti";

interface CombatScreenProps {
  character: CharacterData;
  dungeon?: Dungeon;
  difficulty: string;
  isPvP?: boolean;
  opponent?: { name: string; className: string; level: number; hp: number; maxHp: number };
  socket?: any;
  room?: any;
  onFinishCombat: (rewards?: { exp: number; coins: number; item?: Item }, won?: boolean) => void;
}

interface FloatingText {
  id: number;
  text: string;
  type: "damage" | "heal" | "status";
  target: "player" | "enemy";
}

export const CombatScreen: React.FC<CombatScreenProps> = ({ character, dungeon, difficulty, isPvP, opponent, socket, room, onFinishCombat }) => {
  const diffMultiplier = difficulty === "Abyss" ? 3.0 : difficulty === "Nightmare" ? 2.0 : difficulty === "Hard" ? 1.4 : 1.0;

  // Dungeon Floors: 5 Normal enemy tiers + 1 Boss fight on Floor 6
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const totalFloors = dungeon ? 6 : 1;

  const getFloorEnemy = (floor: number) => {
    if (!dungeon) {
      return {
        name: opponent?.name || "Shadow Rival",
        hp: opponent?.maxHp || 200,
        maxHp: opponent?.maxHp || 200,
        attack: 25,
        isBoss: true,
      };
    }

    const dId = dungeon.id;

    if (floor === 6) {
      const bHp = Math.round(dungeon.bossHp * diffMultiplier);
      return { name: dungeon.bossName, hp: bHp, maxHp: bHp, attack: Math.round(dungeon.bossAttack * diffMultiplier), isBoss: true };
    }

    const mobData: Record<string, { name: string; hpBase: number; atkBase: number }[]> = {
      d1: [
        // Desa yang Sudah Dijjarah (Plundered Village)
        { name: "Bandit Scout", hpBase: 80, atkBase: 14 },
        { name: "Looting Thug", hpBase: 110, atkBase: 20 },
        { name: "Arsonist Marauder", hpBase: 145, atkBase: 26 },
        { name: "Berserk Ravager", hpBase: 185, atkBase: 33 },
        { name: "Elite Marauder Captain", hpBase: 235, atkBase: 40 },
      ],
      d2: [
        // Pesisir Pantai (Coastal Shore)
        { name: "Saltwater Crab", hpBase: 100, atkBase: 18 },
        { name: "Tidecaller Siren", hpBase: 135, atkBase: 25 },
        { name: "Coral Golem", hpBase: 175, atkBase: 32 },
        { name: "Abyssal Serpent", hpBase: 225, atkBase: 40 },
        { name: "Drowned Pirate Captain", hpBase: 290, atkBase: 48 },
      ],
      d3: [
        // Padang Pasir (Desert Wasteland)
        { name: "Desert Scuttler", hpBase: 130, atkBase: 22 },
        { name: "Nomadic Raider", hpBase: 175, atkBase: 31 },
        { name: "Dune Stalker", hpBase: 220, atkBase: 40 },
        { name: "Mummified Guardian", hpBase: 280, atkBase: 49 },
        { name: "Djinn Windcaller", hpBase: 350, atkBase: 58 },
      ],
      d4: [
        // Reruntuhan Lama (Ancient Ruins)
        { name: "Broken Stone Automaton", hpBase: 170, atkBase: 28 },
        { name: "Crypt Gargoyle", hpBase: 225, atkBase: 39 },
        { name: "Relic Wraith", hpBase: 290, atkBase: 50 },
        { name: "Runed Guardian Golem", hpBase: 360, atkBase: 61 },
        { name: "Temple Sentinel Beast", hpBase: 450, atkBase: 72 },
      ],
      d5: [
        // Tempat Elegan Para Dewa (Celestial Pantheon)
        { name: "Astral Sprite", hpBase: 230, atkBase: 35 },
        { name: "Seraphic Sentinel", hpBase: 310, atkBase: 50 },
        { name: "Divine Templar Knight", hpBase: 400, atkBase: 65 },
        { name: "Celestial Archon", hpBase: 520, atkBase: 82 },
        { name: "Guardian of the Heavens", hpBase: 650, atkBase: 95 },
      ],
    };

    const list = mobData[dId] || mobData["d1"];
    const mob = list[floor - 1] || list[0];
    const h = Math.round(mob.hpBase * diffMultiplier);
    return {
      name: mob.name,
      hp: h,
      maxHp: h,
      attack: Math.round(mob.atkBase * diffMultiplier),
      isBoss: false,
    };
  };

  const getDungeonThemeBg = () => {
    if (!dungeon) return "from-slate-950 via-slate-900 to-slate-950 border-slate-800";
    switch (dungeon.id) {
      case "d1":
        return "from-amber-950/40 via-slate-950 to-stone-950 border-amber-900/40";
      case "d2":
        return "from-cyan-950/40 via-slate-950 to-blue-950 border-cyan-900/40";
      case "d3":
        return "from-yellow-950/40 via-slate-950 to-amber-950 border-yellow-900/40";
      case "d4":
        return "from-purple-950/40 via-slate-950 to-zinc-950 border-purple-900/40";
      case "d5":
        return "from-indigo-950/50 via-slate-950 to-amber-950/40 border-amber-500/40";
      default:
        return "from-slate-950 via-slate-900 to-slate-950 border-slate-800";
    }
  };

  const initialEnemy = getFloorEnemy(1);

  const [playerHp, setPlayerHp] = useState(character.hp);
  const [playerMana, setPlayerMana] = useState(character.mana);
  const [playerStatuses, setPlayerStatuses] = useState<StatusEffect[]>([]);
  const [isDefending, setIsDefending] = useState(false);

  const [enemyHp, setEnemyHp] = useState(initialEnemy.hp);
  const [enemyMaxHp, setEnemyMaxHp] = useState(initialEnemy.maxHp);
  const [enemyName, setEnemyName] = useState(initialEnemy.name);
  const [enemyAttack, setEnemyAttack] = useState(initialEnemy.attack);
  const [isBossFloor, setIsBossFloor] = useState(initialEnemy.isBoss);
  const [enemyStatuses, setEnemyStatuses] = useState<StatusEffect[]>([]);

  const [combatLog, setCombatLog] = useState<string[]>([`Entering ${dungeon ? dungeon.name : "Arena"} - Floor 1/6. Battle started against ${initialEnemy.name}!`]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleOver, setBattleOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [earnedLoot, setEarnedLoot] = useState<Item | null>(null);

  // Animation states
  const [playerAnim, setPlayerAnim] = useState<"idle" | "attack" | "hit">("idle");
  const [enemyAnim, setEnemyAnim] = useState<"idle" | "attack" | "hit">("idle");
  const [activeSkillEffect, setActiveSkillEffect] = useState<string | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const classInfo = CLASS_DATA[character.className];
  const skills = classInfo.skills;

  const addLog = (msg: string) => {
    setCombatLog((prev) => [msg, ...prev.slice(0, 15)]);
  };

  const addFloatingText = (text: string, type: "damage" | "heal" | "status", target: "player" | "enemy") => {
    const id = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev, { id, text, type, target }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((f) => f.id !== id));
    }, 1200);
  };

  const handleBasicAttack = () => {
    if (!isPlayerTurn || battleOver) return;
    if (playerStatuses.some((s) => s.type === "stun" || s.type === "sleep")) {
      addLog(`You are incapacitated by status effect and miss your turn!`);
      setPlayerStatuses((prev) => prev.map((s) => ({ ...s, duration: s.duration - 1 })).filter((s) => s.duration > 0));
      setIsPlayerTurn(false);
      setTimeout(enemyTurn, 1000);
      return;
    }

    setPlayerAnim("attack");
    setTimeout(() => setPlayerAnim("idle"), 600);

    const weaponAtk = character.equipment.weapon?.stats?.attack || 12;
    const dmg = Math.max(12, Math.round(character.strength * 1.4 + weaponAtk));

    setEnemyAnim("hit");
    setTimeout(() => setEnemyAnim("idle"), 600);

    setEnemyHp((prevHp) => {
      const newHp = Math.max(0, prevHp - dmg);

      if (newHp <= 0) {
        setTimeout(() => handleFloorClear(), 0);
      }

      return newHp;
    });
    addFloatingText(`-${dmg}`, "damage", "enemy");
    addLog(`You perform a Basic Weapon Attack on ${enemyName} for ${dmg} physical damage!`);

    setIsPlayerTurn(false);
    setTimeout(enemyTurn, 1200);
  };

  const handleDefend = () => {
    if (!isPlayerTurn || battleOver) return;
    if (playerStatuses.some((s) => s.type === "stun" || s.type === "sleep")) {
      addLog(`You are incapacitated by status effect and miss your turn!`);
      setPlayerStatuses((prev) => prev.map((s) => ({ ...s, duration: s.duration - 1 })).filter((s) => s.duration > 0));
      setIsPlayerTurn(false);
      setTimeout(enemyTurn, 1000);
      return;
    }

    setIsDefending(true);
    addFloatingText("DEFEND", "status", "player");
    addLog(`You adopt a defensive guard stance, reducing incoming damage by 50% for the next enemy attack!`);
    setIsPlayerTurn(false);
    setTimeout(enemyTurn, 1000);
  };

  const handleMeditate = () => {
    if (!isPlayerTurn || battleOver) return;
    if (playerStatuses.some((s) => s.type === "stun" || s.type === "sleep")) {
      addLog(`You are incapacitated by status effect and miss your turn!`);
      setPlayerStatuses((prev) => prev.map((s) => ({ ...s, duration: s.duration - 1 })).filter((s) => s.duration > 0));
      setIsPlayerTurn(false);
      setTimeout(enemyTurn, 1000);
      return;
    }

    const mpGain = Math.round(character.maxMana * 0.1);
    setPlayerMana((m) => Math.min(character.maxMana, m + mpGain));
    addFloatingText(`+${mpGain} MP`, "heal", "player");
    addLog(`You sit in deep meditation (bertapa), channeling spiritual energy to recharge ${mpGain} MP (10%)!`);
    setIsPlayerTurn(false);
    setTimeout(enemyTurn, 1000);
  };

  const handleUseSkill = (skill: any) => {
    if (!isPlayerTurn || battleOver) return;
    if (playerMana < skill.manaCost) {
      addLog(`Not enough Mana for ${skill.name}!`);
      return;
    }

    if (playerStatuses.some((s) => s.type === "stun" || s.type === "sleep")) {
      addLog(`You are incapacitated by status effect and miss your turn!`);
      setPlayerStatuses((prev) => prev.map((s) => ({ ...s, duration: s.duration - 1 })).filter((s) => s.duration > 0));
      setIsPlayerTurn(false);
      setTimeout(enemyTurn, 1000);
      return;
    }

    setPlayerMana((m) => Math.max(0, m - skill.manaCost));
    setActiveSkillEffect(skill.name);
    setTimeout(() => setActiveSkillEffect(null), 1000);

    setPlayerAnim("attack");
    setTimeout(() => setPlayerAnim("idle"), 600);

    let dmg = Math.round((character.strength * 1.2 + character.intelligence * 0.8) * skill.multiplier);

    if (skill.type === "heal") {
      const healAmount = 60;
      setPlayerHp((h) => Math.min(character.maxHp, h + healAmount));
      addFloatingText(`+${healAmount} HP`, "heal", "player");
      addLog(`You used ${skill.name} and restored ${healAmount} HP!`);
      setIsPlayerTurn(false);
      setTimeout(enemyTurn, 1000);
      return;
    }

    if (skill.type === "buff") {
      addFloatingText("BUFFED!", "status", "player");
      addLog(`You used ${skill.name}! Your combat spirit surges.`);
      setIsPlayerTurn(false);
      setTimeout(enemyTurn, 1000);
      return;
    }

    // Apply damage to enemy
    setEnemyAnim("hit");
    setTimeout(() => setEnemyAnim("idle"), 600);

    const newEnemyHp = Math.max(0, enemyHp - dmg);
    setEnemyHp(newEnemyHp);
    addFloatingText(`-${dmg}`, "damage", "enemy");
    addLog(`You used ${skill.name} on ${enemyName} for ${dmg} damage!`);

    if (skill.statusEffect && Math.random() < (skill.statusChance || 0.8)) {
      setEnemyStatuses((prev) => [...prev.filter((s) => s.type !== skill.statusEffect), { type: skill.statusEffect!, duration: 3, potency: 15 }]);
      addFloatingText(skill.statusEffect.toUpperCase(), "status", "enemy");
      addLog(`${enemyName} was afflicted with ${skill.statusEffect.toUpperCase()}!`);
    }

    if (newEnemyHp <= 0) {
      handleFloorClear();
      return;
    }

    setIsPlayerTurn(false);
    setTimeout(enemyTurn, 1200);
  };

  const handleFloorClear = () => {
    if (!dungeon || currentFloor >= totalFloors) {
      endBattle(true);
      return;
    }

    // Floor cleared! Advance to next floor
    const nextF = currentFloor + 1;
    setCurrentFloor(nextF);
    const nextEn = getFloorEnemy(nextF);
    setEnemyName(nextEn.name);
    setEnemyHp(nextEn.hp);
    setEnemyMaxHp(nextEn.maxHp);
    setEnemyAttack(nextEn.attack);
    setIsBossFloor(nextEn.isBoss);
    setEnemyStatuses([]);

    // Heal player slightly for surviving floor
    const healBonus = Math.round(character.maxHp * 0.25);
    setPlayerHp((hp) => Math.min(character.maxHp, hp + healBonus));
    addFloatingText(`+${healBonus} HP (Floor Clear)`, "heal", "player");

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    addLog(`🎉 Floor ${currentFloor} Cleared! Advancing to Floor ${nextF}/6: ${nextEn.name}. You recovered ${healBonus} HP.`);
    setIsPlayerTurn(true);
  };

  const enemyTurn = () => {
    if (battleOver) return;

    // Process enemy statuses
    setEnemyHp((prevHp) => {
      let hp = prevHp;

      enemyStatuses.forEach((st) => {
        if (st.type === "burn" || st.type === "poison" || st.type === "bleed") {
          hp = Math.max(0, hp - st.potency);

          addFloatingText(`-${st.potency}`, "damage", "enemy");
          addLog(`${enemyName} takes ${st.potency} damage from ${st.type}!`);
        }
      });

      if (hp <= 0) {
        setTimeout(() => handleFloorClear(), 0);
      }

      return hp;
    });

    setEnemyStatuses((prev) => prev.map((s) => ({ ...s, duration: s.duration - 1 })).filter((s) => s.duration > 0));

    // Process player statuses
    let currentStatuses = [...playerStatuses];
    currentStatuses.forEach((st) => {
      if (st.type === "burn" || st.type === "poison" || st.type === "bleed") {
        setPlayerHp((h) => Math.max(0, h - st.potency));
        addFloatingText(`-${st.potency}`, "damage", "player");
        addLog(`You take ${st.potency} damage from ${st.type}!`);
      }
    });
    setPlayerStatuses(currentStatuses.map((s) => ({ ...s, duration: s.duration - 1 })).filter((s) => s.duration > 0));

    // Enemy attack
    setEnemyAnim("attack");
    setTimeout(() => setEnemyAnim("idle"), 600);

    setPlayerAnim("hit");
    setTimeout(() => setPlayerAnim("idle"), 600);

    const actualDmg = Math.max(5, enemyAttack - Math.round(character.vitality * 0.4));
    setPlayerHp((h) => {
      const nextH = Math.max(0, h - actualDmg);
      if (nextH <= 0) {
        endBattle(false);
      }
      return nextH;
    });

    addFloatingText(`-${actualDmg}`, "damage", "player");
    addLog(`${enemyName} attacks you for ${actualDmg} damage!`);
    setIsPlayerTurn(true);
  };

  const endBattle = (won: boolean) => {
    setBattleOver(true);
    setVictory(won);
    if (won) {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      const loot = dungeon ? generateRandomLoot(dungeon.floors) : undefined;
      setEarnedLoot(loot || null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">{dungeon ? dungeon.name : "PvP Combat Arena"}</h2>
                {dungeon && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isBossFloor ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse" : "bg-amber-500/20 text-amber-400 border border-amber-500/40"}`}>
                    Floor {currentFloor}/6 {isBossFloor ? "• BOSS FIGHT" : "• Mob Battle"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">Difficulty: {difficulty}</p>
            </div>
          </div>
          {battleOver && (
            <button
              onClick={() => onFinishCombat({ exp: dungeon ? 250 : 120, coins: dungeon ? 150 : 80, item: earnedLoot || undefined }, victory)}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Return to Hub
            </button>
          )}
        </div>

        {/* Visual Combat Arena Stage */}
        <div className={`relative my-4 flex-1 bg-gradient-to-b ${getDungeonThemeBg()} rounded-2xl p-6 flex flex-col justify-between overflow-hidden shadow-inner`}>
          {/* Ambient background glow / effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none" />

          {/* Active Skill Visual Banner */}
          {activeSkillEffect && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500/20 border border-amber-500/50 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold animate-bounce z-20 shadow-lg">
              ✨ CASTING: {activeSkillEffect.toUpperCase()} ✨
            </div>
          )}

          {/* Arena Combatants Layout */}
          <div className="grid grid-cols-2 gap-8 my-auto items-center relative z-10">
            {/* Player Side */}
            <div className={`flex flex-col items-center transition-transform duration-300 ${playerAnim === "attack" ? "translate-x-12 scale-105" : playerAnim === "hit" ? "-translate-x-4 rotate-[-3deg]" : ""}`}>
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border-2 border-indigo-500/50 flex items-center justify-center text-indigo-300 shadow-xl shadow-indigo-500/10">
                  <Shield className="w-10 h-10" />
                </div>
                {/* Floating numbers on player */}
                {floatingTexts
                  .filter((f) => f.target === "player")
                  .map((f) => (
                    <span
                      key={f.id}
                      className={`absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-black animate-fade-up pointer-events-none ${f.type === "heal" ? "text-emerald-400" : f.type === "status" ? "text-amber-400" : "text-red-500"}`}
                    >
                      {f.text}
                    </span>
                  ))}
              </div>
              <div className="mt-3 text-center">
                <h4 className="font-bold text-slate-100 text-sm">{character.name}</h4>
                <span className="text-[11px] text-purple-400 font-medium">
                  {character.className} (Lvl {character.level})
                </span>
              </div>
            </div>

            {/* VS Divider */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-700 font-black text-2xl opacity-20 pointer-events-none">VS</div>

            {/* Enemy Side */}
            <div className={`flex flex-col items-center transition-transform duration-300 ${enemyAnim === "attack" ? "-translate-x-12 scale-105" : enemyAnim === "hit" ? "translate-x-4 rotate-[3deg]" : ""}`}>
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center shadow-xl ${isBossFloor ? "bg-gradient-to-br from-red-600/30 to-rose-700/30 border-red-500/60 text-red-400 animate-pulse" : "bg-gradient-to-br from-orange-600/30 to-amber-700/30 border-orange-500/50 text-orange-400"}`}
                >
                  {isBossFloor ? <Skull className="w-12 h-12" /> : <Flame className="w-10 h-10" />}
                </div>
                {/* Floating numbers on enemy */}
                {floatingTexts
                  .filter((f) => f.target === "enemy")
                  .map((f) => (
                    <span key={f.id} className={`absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-black animate-fade-up pointer-events-none ${f.type === "status" ? "text-amber-400" : "text-red-500"}`}>
                      {f.text}
                    </span>
                  ))}
              </div>
              <div className="mt-3 text-center">
                <h4 className={`font-bold text-sm ${isBossFloor ? "text-red-400" : "text-orange-400"}`}>{enemyName}</h4>
                <span className="text-[11px] text-slate-400 font-medium">{isBossFloor ? "Dungeon Boss" : `Floor ${currentFloor} Mob`}</span>
              </div>
            </div>
          </div>

          {/* Status Indicators bar */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/80">
            {/* Player Stats & Statuses */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-bold">
                  HP: {playerHp} / {character.maxHp}
                </span>
                <span className="text-indigo-300 font-bold">
                  MP: {playerMana} / {character.maxMana}
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 mb-2">
                <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${Math.max(0, (playerHp / character.maxHp) * 100)}%` }} />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {playerStatuses.map((st, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-red-950/80 text-red-300 rounded border border-red-800">
                    {st.type} ({st.duration})
                  </span>
                ))}
              </div>
            </div>

            {/* Enemy Stats & Statuses */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-red-400 font-bold truncate max-w-[150px]">{enemyName}</span>
                <span className="text-slate-200 font-bold">
                  {enemyHp} / {enemyMaxHp} HP
                </span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 mb-2">
                <div className="bg-red-600 h-full transition-all duration-300" style={{ width: `${Math.max(0, (enemyHp / enemyMaxHp) * 100)}%` }} />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {enemyStatuses.map((st, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-orange-950/80 text-orange-300 rounded border border-orange-800">
                    {st.type} ({st.duration})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Combat Log & Action Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 h-32 overflow-y-auto space-y-1.5 md:col-span-1 shadow-inner">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Combat Log</div>
            {combatLog.map((log, idx) => (
              <div key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-amber-500/60">▪</span> {log}
              </div>
            ))}
          </div>

          <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                {battleOver ? (victory ? "Victory! Dungeon Conquered" : "Defeat...") : isPlayerTurn ? "Your Turn - Choose Combat Skill" : "Enemy Counter-attacking..."}
              </span>
            </div>

            {!battleOver && (
              <div className="space-y-2">
                {/* Core Combat Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleBasicAttack}
                    disabled={!isPlayerTurn}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold text-xs ${
                      isPlayerTurn ? "bg-rose-950/60 hover:bg-rose-900/60 border-rose-800/80 text-rose-200 shadow-md" : "bg-slate-950/50 border-slate-900 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <Sword className="w-3.5 h-3.5 text-rose-400" />
                    <span>Basic Attack</span>
                  </button>

                  <button
                    onClick={handleDefend}
                    disabled={!isPlayerTurn}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold text-xs ${
                      isPlayerTurn ? "bg-cyan-950/60 hover:bg-cyan-900/60 border-cyan-800/80 text-cyan-200 shadow-md" : "bg-slate-950/50 border-slate-900 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Defend</span>
                  </button>

                  <button
                    onClick={handleMeditate}
                    disabled={!isPlayerTurn}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold text-xs ${
                      isPlayerTurn ? "bg-purple-950/60 hover:bg-purple-900/60 border-purple-800/80 text-purple-200 shadow-md" : "bg-slate-950/50 border-slate-900 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span>Bertapa (+10% MP)</span>
                  </button>
                </div>

                {/* Class Skills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {skills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => handleUseSkill(skill)}
                      disabled={!isPlayerTurn || playerMana < skill.manaCost}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isPlayerTurn && playerMana >= skill.manaCost
                          ? "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-100 shadow-md hover:border-amber-500/50"
                          : "bg-slate-950/50 border-slate-900 text-slate-600 cursor-not-allowed"
                      }`}
                    >
                      <span className="font-semibold text-xs text-center mb-0.5">{skill.name}</span>
                      <span className="text-[10px] text-indigo-400">{skill.manaCost} MP</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {battleOver && victory && earnedLoot && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase">Epic Loot Discovered</span>
                  <div className="text-sm font-bold text-slate-100">
                    {earnedLoot.name} ({earnedLoot.rarity})
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">+ Added to Inventory</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
