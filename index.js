import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ShieldPlus,
  User,
  Heart,
  Swords,
  BarChart3,
  Flame,
  Calculator,
  Sparkles,
  Zap
} from 'lucide-react';

/**
 * Tibia Damage Calculator
 * 
 * Formula derived from in-game "Base Power" values (from Spell Archive):
 * - Magic/Healing: Uses Base Power to derive multipliers
 * 
 * Includes high-level diminishing returns scaling for level bonus:
 * - 1-500: +1 per 5 levels
 * - 501-1100: +1 per 6 levels
 * - 1101-1800: +1 per 7 levels
 * - ... and so on (+100 range and +1 divisor each step)
 */

const CALC_MODES = [
  { id: 'magic', label: 'Attack Spells', icon: Flame, description: 'Spells & Runes that scale with Magic Level' },
  { id: 'healing', label: 'Healing Spells', icon: Heart, description: 'Healing spells that scale with Magic Level' },
];

const App = () => {
  // Character stats
  const [level, setLevel] = useState(250);
  const [magicLevel, setMagicLevel] = useState(95);

  // Spell parameters
  const [basePower, setBasePower] = useState(140); // From in-game Spell Archive
  const [calcMode, setCalcMode] = useState('magic');

  // Modifiers
  const [equipBonus, setEquipBonus] = useState(0);
  const [targetResistance, setTargetResistance] = useState(100);

  /**
   * Calculates the level damage/healing bonus with diminishing returns
   * Logic:
   * 1-500: +1 per 5 levels (Max +100)
   * 501-1100: +1 per 6 levels (Max +100)
   * 1101-1800: +1 per 7 levels (Max +100)
   * etc...
   */
  const calculateLevelBonus = (lvl) => {
    let bonus = 0;
    let remainingLvl = lvl;
    let currentRange = 500;
    let currentDivisor = 5;

    while (remainingLvl > 0) {
      const levelsInSegment = Math.min(remainingLvl, currentRange);
      bonus += Math.floor(levelsInSegment / currentDivisor);

      remainingLvl -= levelsInSegment;
      currentDivisor += 1;
      currentRange += 100;
    }

    return bonus;
  };

  const results = useMemo(() => {
    const levelBase = calculateLevelBonus(level);

    let min, max, minMult, maxMult, minOffset, maxOffset;

    const sqrtBP = Math.sqrt(basePower);
    maxMult = sqrtBP * 0.59;
    minMult = maxMult * 0.55;
    maxOffset = Math.floor(basePower * 0.25);
    minOffset = Math.floor(maxOffset * 0.6);

    const minStatComponent = Math.floor(magicLevel * minMult + minOffset);
    const maxStatComponent = Math.floor(magicLevel * maxMult + maxOffset);

    min = levelBase + minStatComponent;
    max = levelBase + maxStatComponent;

    // Apply Equipment Bonus
    if (equipBonus !== 0) {
      min = Math.floor(min * (1 + equipBonus / 100));
      max = Math.floor(max * (1 + equipBonus / 100));
    }

    // Apply Creature Resistance/Weakness (only for attack spells)
    if (calcMode === 'magic' && targetResistance !== 100) {
      min = Math.floor(min * (targetResistance / 100));
      max = Math.floor(max * (targetResistance / 100));
    }

    return {
      levelBase,
      minStatComponent,
      maxStatComponent,
      min,
      max,
      avg: Math.floor((min + max) / 2),
      minMult: minMult.toFixed(3),
      maxMult: maxMult.toFixed(3),
      minOffset,
      maxOffset,
      scalingStat: magicLevel,
      statLabel: 'ML'
    };
  }, [level, magicLevel, basePower, equipBonus, targetResistance, calcMode]);

  const activeMode = CALC_MODES.find(m => m.id === calcMode) || CALC_MODES[0];
  const ModeIcon = activeMode.icon;

  return (
    React.createElement('div', { className: "min-h-screen bg-[#0f1115] text-slate-300 font-sans selection:bg-amber-500/30" },
      React.createElement('header', { className: "bg-[#161a20] border-b border-slate-800 py-6 px-4 md:px-8 sticky top-0 z-20 shadow-lg" },
        React.createElement('div', { className: "max-w-7xl mx-auto flex items-center justify-between" },
          React.createElement('div', { className: "flex items-center gap-3" },
            React.createElement('div', { className: "p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl" },
              React.createElement(Calculator, { className: "w-8 h-8 text-amber-500" })
            ),
            React.createElement('div', null,
              React.createElement('h1', { className: "text-2xl font-black text-white tracking-tight leading-none" }, "TibiaCalc"),
              React.createElement('p', { className: "text-xs text-slate-500 font-bold uppercase tracking-widest mt-1" }, "Base Power Formula")
            )
          )
        )
      ),

      React.createElement('main', { className: "max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8" },

        // Left Column: Inputs
        React.createElement('aside', { className: "lg:col-span-5 space-y-6" },

          // Mode Selection
          React.createElement('section', { className: "bg-[#161a20] border border-slate-800 rounded-2xl p-6 shadow-xl" },
            React.createElement('div', { className: "flex items-center gap-2 mb-4" },
              React.createElement(Swords, { className: "w-5 h-5 text-amber-500" }),
              React.createElement('h2', { className: "text-lg font-bold text-white uppercase tracking-tight" }, "Calculation Type")
            ),
            React.createElement('div', { className: "grid grid-cols-2 gap-4" },
              ...CALC_MODES.map(mode =>
                React.createElement('button', {
                  key: mode.id,
                  onClick: () => setCalcMode(mode.id),
                  className: `p-4 rounded-xl border text-center transition-all ${calcMode === mode.id
                      ? "bg-amber-500/10 border-amber-500 text-amber-500"
                      : "bg-[#0c0e12] border-slate-800 text-slate-500 hover:border-slate-600"
                    }`
                },
                  React.createElement(mode.icon, { className: "w-6 h-6 mx-auto mb-2" }),
                  React.createElement('div', { className: "text-[11px] font-bold uppercase tracking-tight" }, mode.label)
                )
              )
            )
          ),

          // Character Stats
          React.createElement('section', { className: "bg-[#161a20] border border-slate-800 rounded-2xl p-6 shadow-xl" },
            React.createElement('div', { className: "flex items-center gap-2 mb-6" },
              React.createElement(User, { className: "w-5 h-5 text-amber-500" }),
              React.createElement('h2', { className: "text-lg font-bold text-white uppercase tracking-tight" }, "Character Stats")
            ),

            React.createElement('div', { className: "space-y-6" },
              React.createElement('div', null,
                React.createElement('label', { className: "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" }, "Level"),
                React.createElement('input', {
                  type: "number",
                  value: level,
                  onChange: (e) => setLevel(Math.max(1, parseInt(e.target.value) || 0)),
                  className: "w-full bg-[#0c0e12] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                }),
                React.createElement('div', { className: "mt-1 text-[9px] text-slate-600 font-bold uppercase italic" }, `Damage/Healing: +${results.levelBase}`)
              ),

              React.createElement('div', { className: "grid grid-cols-2 gap-4" },
                React.createElement('div', null,
                  React.createElement('label', { className: "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" }, "Magic Level"),
                  React.createElement('input', {
                    type: "number",
                    value: magicLevel,
                    onChange: (e) => setMagicLevel(Math.max(0, parseInt(e.target.value) || 0)),
                    className: "w-full bg-[#0c0e12] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all ring-1 ring-amber-500/50"
                  })
                ),
                React.createElement('div', null,
                  React.createElement('label', { className: "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" }, "Equip Bonus (%)"),
                  React.createElement('input', {
                    type: "number",
                    value: equipBonus,
                    onChange: (e) => setEquipBonus(parseInt(e.target.value) || 0),
                    className: "w-full bg-[#0c0e12] border border-slate-700 rounded-xl px-4 py-3 text-amber-500 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  })
                )
              )
            )
          ),

          // Spell Parameters
          React.createElement('section', { className: "bg-[#161a20] border border-slate-800 rounded-2xl p-6 shadow-xl" },
            React.createElement('div', { className: "flex items-center gap-2 mb-6" },
              React.createElement(Zap, { className: "w-5 h-5 text-amber-500" }),
              React.createElement('h2', { className: "text-lg font-bold text-white uppercase tracking-tight" }, "Spell Stats")
            ),

            React.createElement('div', null,
              React.createElement('label', { className: "block text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2" }, "⚡ Base Power (from Cyclopedia)"),
              React.createElement('input', {
                type: "number",
                value: basePower,
                onChange: (e) => setBasePower(Math.max(1, parseInt(e.target.value) || 0)),
                className: "w-full bg-[#0c0e12] border border-amber-500/50 rounded-xl px-4 py-3 text-amber-400 font-bold text-xl focus:ring-2 focus:ring-amber-500 outline-none ring-1 ring-amber-500/30"
              }),
              React.createElement('div', { className: "mt-2 text-[9px] text-slate-500" }, "Open Cyclopedia → Spell Archive → Select spell → Combat Stats → Base Power")
            )
          ),

          // Target Modifiers
          calcMode === 'magic' && (
            React.createElement('section', { className: "bg-[#161a20] border border-slate-800 rounded-2xl p-6 shadow-xl" },
              React.createElement('div', { className: "flex items-center gap-2 mb-6" },
                React.createElement(ShieldPlus, { className: "w-5 h-5 text-amber-500" }),
                React.createElement('h2', { className: "text-lg font-bold text-white uppercase tracking-tight" }, "Target Modifiers")
              ),
              React.createElement('div', null,
                React.createElement('label', { className: "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" }, "Target Resistance/Weakness (%)"),
                React.createElement('input', {
                  type: "number",
                  value: targetResistance,
                  onChange: (e) => setTargetResistance(parseInt(e.target.value) || 100),
                  className: "w-full bg-[#0c0e12] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                }),
                React.createElement('div', { className: "mt-2 text-[9px] text-slate-500" }, "100% is neutral. Above 100% = Weakness, Below 100% = Resistance")
              )
            )
          )
        ),

        // Right Column: Results
        React.createElement('section', { className: "lg:col-span-7 space-y-6" },
          React.createElement('div', { className: "bg-[#161a20] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full ring-1 ring-white/5" },
            React.createElement('div', { className: "p-10 border-b border-slate-800 bg-gradient-to-br from-[#1c2129] to-[#161a20] relative" },
              React.createElement('div', { className: `absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${calcMode === 'healing' ? 'via-emerald-500' : 'via-amber-500'} to-transparent` }),

              React.createElement('div', { className: "flex items-center justify-between mb-10" },
                React.createElement('div', { className: "flex items-center gap-4" },
                  React.createElement('div', { className: `p-3 rounded-2xl ${calcMode === 'healing' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}` },
                    React.createElement(ModeIcon, { className: "w-8 h-8" })
                  ),
                  React.createElement('div', null,
                    React.createElement('h2', { className: "text-2xl font-black text-white tracking-tight leading-none uppercase" }, `Base Power ${basePower}`),
                    React.createElement('p', { className: "text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2" },
                      `Level ${level} • ML ${results.scalingStat}`
                    )
                  )
                ),
                React.createElement('div', { className: "bg-[#0c0e12] px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2 shadow-inner" },
                  React.createElement('span', { className: "text-[10px] font-black text-slate-500 uppercase" }, "Avg"),
                  React.createElement('span', { className: "text-xl font-black text-white font-mono" }, results.avg)
                )
              ),

              React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                React.createElement('div', { className: "bg-[#0c0e12]/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center relative group shadow-lg" },
                  React.createElement('span', { className: "text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest group-hover:text-emerald-500 transition-colors" }, calcMode === 'healing' ? "Min Heal" : "Min Hit"),
                  React.createElement('span', { className: "text-5xl font-black text-slate-100 font-mono tracking-tighter" }, results.min)
                ),

                React.createElement('div', { className: "bg-[#0c0e12]/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center relative group shadow-lg" },
                  React.createElement('span', { className: "text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest group-hover:text-rose-500 transition-colors" }, calcMode === 'healing' ? "Max Heal" : "Max Hit"),
                  React.createElement('span', { className: "text-5xl font-black text-slate-100 font-mono tracking-tighter" }, results.max)
                )
              )
            ),

            React.createElement('div', { className: "p-8 space-y-12 flex-1 relative" },
              React.createElement('div', null,
                React.createElement('div', { className: "flex justify-between items-end mb-6 px-1" },
                  React.createElement('h3', { className: "text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2" },
                    React.createElement(BarChart3, { className: "w-4 h-4" }), " Range Projection"
                  ),
                  React.createElement('div', { className: "text-[10px] font-bold font-mono text-amber-500" }, `Δ ${results.max - results.min} RANGE`)
                ),

                React.createElement('div', { className: "relative h-16 bg-[#0c0e12] rounded-2xl border border-slate-800 shadow-inner group flex items-center px-12" },
                  React.createElement('div', { className: "w-full h-1 bg-slate-800 rounded-full relative" },
                    React.createElement('div', {
                      className: `absolute top-1/2 -translate-y-1/2 h-4 rounded-full shadow-lg ring-2 ring-white/10 ${calcMode === 'healing' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-rose-700 to-amber-500'}`,
                      style: { width: '100%', left: '0' }
                    },
                      React.createElement('div', { className: "absolute left-0 -top-10 text-[10px] font-black text-slate-400 bg-[#161a20] px-2 py-1 rounded border border-slate-800 shadow-sm whitespace-nowrap" }, `MIN ${results.min}`),
                      React.createElement('div', { className: "absolute right-0 -top-10 text-[10px] font-black text-slate-400 bg-[#161a20] px-2 py-1 rounded border border-slate-800 shadow-sm whitespace-nowrap" }, `MAX ${results.max}`),
                      React.createElement('div', { className: "absolute left-1/2 -bottom-10 -translate-x-1/2 text-[10px] font-black text-amber-500 bg-[#161a20] px-2 py-1 rounded border border-amber-500/20 whitespace-nowrap" }, `AVG ${results.avg}`),
                      React.createElement('div', { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-white shadow-[0_0_10px_white] rounded-full" })
                    )
                  )
                )
              )
            )
          )
        )
      ),

      React.createElement('footer', { className: "max-w-7xl mx-auto p-12 text-center mt-12 border-t border-slate-900/50" },
        React.createElement('div', { className: "flex flex-col items-center justify-center gap-4 opacity-30" },
          React.createElement('div', { className: "flex items-center gap-2" },
            React.createElement(ShieldPlus, { className: "w-4 h-4 text-amber-500" }),
            React.createElement('span', { className: "text-[10px] font-black text-white uppercase tracking-[0.4em]" }, "Combat Analysis Unit")
          ),
          React.createElement('div', { className: "text-[9px] font-bold text-slate-600 uppercase tracking-widest" }, "Uses High-Level Scaling Bonus Formula")
        )
      )
    )
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(App));
}
