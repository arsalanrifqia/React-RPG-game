import React, { useState } from "react";
import { Sword, Sparkles, Zap, Shield, Heart, Flame } from "lucide-react";
import { ClassType, CharacterData } from "../types";
import { CLASS_DATA } from "../utils/gameData";

interface CharacterCreatorProps {
  uid: string;
  defaultName: string;
  onCharacterCreated: (character: CharacterData) => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ uid, defaultName, onCharacterCreated }) => {
  const [name, setName] = useState(defaultName || "Hero");
  const [selectedClass, setSelectedClass] = useState<ClassType>("Warrior");
  const [loading, setLoading] = useState(false);

  const activeClassData = CLASS_DATA[selectedClass];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const newChar: CharacterData = {
      uid,
      name: name.trim(),
      className: selectedClass,
      level: 1,
      exp: 0,
      expToNext: 100,
      hp: activeClassData.baseStats.hp,
      maxHp: activeClassData.baseStats.hp,
      mana: activeClassData.baseStats.mana,
      maxMana: activeClassData.baseStats.mana,
      strength: activeClassData.baseStats.strength,
      intelligence: activeClassData.baseStats.intelligence,
      agility: activeClassData.baseStats.agility,
      vitality: activeClassData.baseStats.vitality,
      statPoints: 0,
      equipment: {
        weapon: null,
        armor: null,
        accessory: null,
      },
      inventory: [
        { id: "starter_sword", name: "Rusty Blade", type: "weapon", rarity: "Common", stats: { strength: 3, attack: 10 }, value: 15, description: "A rusted starter weapon." },
        { id: "starter_pot", name: "Health Potion", type: "potion", rarity: "Common", stats: { hp: 100 }, value: 30, description: "Restores 100 HP." },
      ],
    };

    try {
      const res = await fetch("/api/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newChar),
      });
      const data = await res.json();
      onCharacterCreated(data);
    } catch (err) {
      onCharacterCreated(newChar);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Forge Your Hero</h1>
          <p className="text-slate-400 text-sm mt-1">Select your class and enter the legendary realm.</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Character Name</label>
            <input
              type="text"
              required
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg text-slate-100 focus:outline-none focus:border-amber-500"
              placeholder="Enter hero name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Choose Class</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["Warrior", "Mage", "Rogue"] as ClassType[]).map((cls) => {
                const info = CLASS_DATA[cls];
                const isSelected = selectedClass === cls;
                return (
                  <div
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden ${
                      isSelected ? "bg-slate-800/90 border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/50" : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${info.color} flex items-center justify-center text-white shadow-md`}>
                        {cls === "Warrior" && <Sword className="w-6 h-6" />}
                        {cls === "Mage" && <Sparkles className="w-6 h-6" />}
                        {cls === "Rogue" && <Zap className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-100">{cls}</h3>
                        <p className="text-xs text-amber-400 font-medium">Specialized Class</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">{info.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500">HP:</span> {info.baseStats.hp}
                      </div>
                      <div>
                        <span className="text-slate-500">Mana:</span> {info.baseStats.mana}
                      </div>
                      <div>
                        <span className="text-slate-500">STR:</span> {info.baseStats.strength}
                      </div>
                      <div>
                        <span className="text-slate-500">INT:</span> {info.baseStats.intelligence}
                      </div>
                      <div>
                        <span className="text-slate-500">AGI:</span> {info.baseStats.agility}
                      </div>
                      <div>
                        <span className="text-slate-500">VIT:</span> {info.baseStats.vitality}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unique Skills Preview */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4" /> Class Signature Skills ({selectedClass})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeClassData.skills.map((skill) => (
                <div key={skill.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-slate-200">{skill.name}</span>
                    <span className="text-xs text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-800">{skill.manaCost} MP</span>
                  </div>
                  <p className="text-xs text-slate-400">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-2xl shadow-xl shadow-amber-500/20 transition-all text-lg cursor-pointer"
          >
            {loading ? "Creating Legend..." : "Begin Adventure"}
          </button>
        </form>
      </div>
    </div>
  );
};
