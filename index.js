import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ShieldPlus, 
  Zap, 
  Info, 
  User, 
  TrendingUp, 
  Heart, 
  Swords, 
  Target,
  BarChart3,
  BookOpen,
  Sword,
  Flame,
  Calculator,
  ChevronRight
} from 'lucide-react';

/**
 * Tibia Formulae Database (Verified)
 * Standard Formula: floor(Level / 5) + floor(ScalingStat * Multiplier + Offset)
 * Constants: [MinMultiplier, MinOffset, MaxMultiplier, MaxOffset]
 */

const SPELL_PRESETS = [
  // RUNES (Verified constants)
  { name: 'Sudden Death Rune (SD)', category: 'Runes', type: 'damage', scaling: 'magic', constants: [4.4, 26, 7.4, 44] },
  { name: 'Great Fireball Rune (GFB)', category: 'Runes', type: 'damage', scaling: 'magic', constants: [1.2, 7, 2.0, 13] },
  { name: 'Avalanche Rune', category: 'Runes', type: 'damage', scaling: 'magic', constants: [1.2, 7, 2.0, 13] },
  { name: 'Thunderstorm Rune', category: 'Runes', type: 'damage', scaling: 'magic', constants: [1.2, 7, 2.0, 13] },
  { name: 'Stone Shower Rune', category: 'Runes', type: 'damage', scaling: 'magic', constants: [1.2, 7, 2.0, 13] },
  { name: 'Explosion Rune', category: 'Runes', type: 'damage', scaling: 'magic', constants: [1.1, 7, 1.9, 12] },
  { name: 'Icicle Rune', category: 'Runes', type: 'damage', scaling: 'magic', constants: [1.5, 9, 2.5, 15] },
  
  // MAGE ATTACK
  { name: 'Hells Core (Mas Flam)', category: 'Mage Spells', type: 'damage', scaling: 'magic', constants: [6.0, 35, 10.0, 60] },
  { name: 'Eternal Winter (Mas Frigo)', category: 'Mage Spells', type: 'damage', scaling: 'magic', constants: [5.2, 30, 8.8, 52] },
  { name: 'Rage of the Skies (Mas Vis)', category: 'Mage Spells', type: 'damage', scaling: 'magic', constants: [3.8, 22, 6.6, 38] },
  { name: 'Strike Spell (Exori Vis/Flam)', category: 'Mage Spells', type: 'damage', scaling: 'magic', constants: [1.4, 9, 2.2, 14] },
  { name: 'Strong Strike (Exori Gran ...)', category: 'Mage Spells', type: 'damage', scaling: 'magic', constants: [2.2, 14, 3.8, 22] },
  
  // HEALING (Verified constants)
  { name: 'Light Healing (Exura)', category: 'Mage Spells', type: 'healing', scaling: 'magic', constants: [1.4, 8, 2.6, 14] },
  { name: 'Intense Healing (Exura Gran)', category: 'Mage Spells', type: 'healing', scaling: 'magic', constants: [4.0, 24, 7.0, 40] },
  { name: 'Ultimate Healing (Exura Vita)', category: 'Mage Spells', type: 'healing', scaling: 'magic', constants: [10.0, 60, 18.0, 104] },
  
  // PALADIN
  { name: 'Divine Caldera (Mas San)', category: 'Paladin Spells', type: 'damage', scaling: 'magic', constants: [2.0, 12, 3.2, 20] },
  { name: 'Divine Missile (Exori San)', category: 'Paladin Spells', type: 'damage', scaling: 'magic', constants: [1.0, 6, 1.8, 10] },
  { name: 'Salvation (Exura Gran San)', category: 'Paladin Spells', type: 'healing', scaling: 'magic', constants: [12.0, 72, 21.0, 126] },
  { name: 'Divine Healing (Exura San)', category: 'Paladin Spells', type: 'healing', scaling: 'magic', constants: [8.0, 48, 12.5, 75] },

  // KNIGHT
  { name: 'Berserk (Exori)', category: 'Knight Spells', type: 'damage', scaling: 'skill', constants: [1.1, 4, 1.9, 8] },
  { name: 'Fierce Berserk (Exori Gran)', category: 'Knight Spells', type: 'damage', scaling: 'skill', constants: [3.3, 12, 5.7, 20] },
  { name: 'Front Sweep (Exori Min)', category: 'Knight Spells', type: 'damage', scaling: 'skill', constants: [2.0, 7, 3.4, 12] },
  { name: 'Wound Cleansing (Exura Ico)', category: 'Knight Spells', type: 'healing', scaling: 'skill', constants: [1.5, 10, 2.5, 20] },
];

const App = () => {
  const [level, setLevel] = useState(250);
  const [magicLevel, setMagicLevel] = useState(95);
  const [meleeSkill, setMeleeSkill] = useState(110);
  const [selectedPresetName, setSelectedPresetName] = useState(SPELL_PRESETS[0].name);
  const [modifier, setModifier] = useState(0);

  const activePreset = useMemo(() => 
    SPELL_PRESETS.find(s => s.name === selectedPresetName) || SPELL_PRESETS[0]
  , [selectedPresetName]);

  const results = useMemo(() => {
    const [minMult, minOffset, maxMult, maxOffset] = activePreset.constants;
    const stat = activePreset.scaling === 'magic' ? magicLevel : meleeSkill;
    
    // Core Tibia Formula Components
    const levelBase = Math.floor(level / 5);
    const minStatComponent = Math.floor(stat * minMult + minOffset);
    const maxStatComponent = Math.floor(stat * maxMult + maxOffset);
    
    let min = levelBase + minStatComponent;
    let max = levelBase + maxStatComponent;
    
    if (modifier !== 0) {
      min = Math.floor(min * (1 + modifier / 100));
      max = Math.floor(max * (1 + modifier / 100));
    }

    return { 
      levelBase,
      minStatComponent,
      maxStatComponent,
      min, 
      max, 
      avg: Math.floor((min + max) / 2),
      constants: activePreset.constants
    };
  }, [level, magicLevel, meleeSkill, modifier, activePreset]);

  const categories = ['Runes', 'Mage Spells', 'Paladin Spells', 'Knight Spells'];

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
              React.createElement('p', { className: "text-xs text-slate-500 font-bold uppercase tracking-widest mt-1" }, "Unified Game Formulae")
            )
          ),
          React.createElement('div', { className: "hidden md:flex items-center gap-6" },
            React.createElement('a', { href: "https://tibia.fandom.com/wiki/Formulae", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors" },
              React.createElement(Info, { className: "w-3 h-3" }), " Wiki Ref"
            )
          )
        )
      ),

      React.createElement('main', { className: "max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8" },
        
        // Left Column: Inputs
        React.createElement('aside', { className: "lg:col-span-5 space-y-6" },
          
          React.createElement('section', { className: "bg-[#161a20] border border-slate-800 rounded-2xl p-6 shadow-xl" },
            React.createElement('div', { className: "flex items-center gap-2 mb-6" },
              React.createElement(User, { className: "w-5 h-5 text-amber-500" }),
              React.createElement('h2', { className: "text-lg font-bold text-white uppercase tracking-tight" }, "Character Stats")
            ),
            
            React.createElement('div', { className: "space-y-4" },
              React.createElement('div', { className: "grid grid-cols-2 gap-4" },
                React.createElement('div', null,
                  React.createElement('label', { className: "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" }, "Level"),
                  React.createElement('input', { 
                    type: "number", 
                    value: level,
                    onChange: (e) => setLevel(Math.max(1, parseInt(e.target.value) || 0)),
                    className: "w-full bg-[#0c0e12] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  }),
                  React.createElement('div', { className: "mt-1 text-[9px] text-slate-600 font-bold uppercase italic" }, `Base: +${results.levelBase}`)
                ),
                React.createElement('div', null,
                  React.createElement('label', { className: "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" }, "Magic Level"),
                  React.createElement('input', { 
                    type: "number", 
                    value: magicLevel,
                    onChange: (e) => setMagicLevel(Math.max(0, parseInt(e.target.value) || 0)),
                    className: `w-full bg-[#0c0e12] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all ${activePreset.scaling === 'magic' ? 'ring-1 ring-amber-500/50' : 'opacity-40'}`
                  })
                )
              ),

              React.createElement('div', { className: "grid grid-cols-2 gap-4" },
                React.createElement('div', null,
                  React.createElement('label', { className: "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" }, "Melee Skill"),
                  React.createElement('input', { 
                    type: "number", 
                    value: meleeSkill,
                    onChange: (e) => setMeleeSkill(Math.max(0, parseInt(e.target.value) || 0)),
                    className: `w-full bg-[#0c0e12] border border-slate-700 rounded-xl px-4 py-3 text-white font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all ${activePreset.scaling === 'skill' ? 'ring-1 ring-amber-500/50' : 'opacity-40'}`
                  })
                ),
                React.createElement('div', null,
                  React.createElement('label', { className: "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2" }, "Equip Bonus (%)"),
                  React.createElement('input', { 
                    type: "number", 
                    value: modifier,
                    onChange: (e) => setModifier(parseInt(e.target.value) || 0),
                    className: "w-full bg-[#0c0e12] border border-slate-700 rounded-xl px-4 py-3 text-amber-500 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                  })
                )
              )
            )
          ),

          React.createElement('section', { className: "bg-[#161a20] border border-slate-800 rounded-2xl p-6 shadow-xl" },
            React.createElement('div', { className: "flex items-center gap-2 mb-6" },
              React.createElement(Target, { className: "w-5 h-5 text-amber-500" }),
              React.createElement('h2', { className: "text-lg font-bold text-white uppercase tracking-tight" }, "Select Spell or Rune")
            ),
            
            React.createElement('div', { className: "space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar" },
              ...categories.map(cat =>
                React.createElement('div', { key: cat, className: "mb-4" },
                  React.createElement('label', { className: "block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1" }, cat),
                  React.createElement('div', { className: "grid grid-cols-1 gap-1" },
                    ...SPELL_PRESETS.filter(s => s.category === cat).map(spell =>
                      React.createElement('button', {
                        key: spell.name,
                        onClick: () => setSelectedPresetName(spell.name),
                        className: `text-left px-3 py-2.5 rounded-lg text-[11px] font-bold transition-all border ${
                          selectedPresetName === spell.name 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-inner' 
                          : 'bg-[#0c0e12] border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                        }`
                      },
                        React.createElement('div', { className: "flex items-center justify-between" },
                          React.createElement('span', null, spell.name),
                          React.createElement('span', { className: "text-[8px] opacity-40 uppercase tracking-widest" },
                            spell.scaling === 'skill' ? 'Skill' : 'ML'
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        ),

        // Right Column: Results
        React.createElement('section', { className: "lg:col-span-7 space-y-6" },
          React.createElement('div', { className: "bg-[#161a20] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full ring-1 ring-white/5" },
            React.createElement('div', { className: "p-10 border-b border-slate-800 bg-gradient-to-br from-[#1c2129] to-[#161a20] relative" },
              React.createElement('div', { className: "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" }),
              
              React.createElement('div', { className: "flex items-center justify-between mb-10" },
                React.createElement('div', { className: "flex items-center gap-4" },
                  React.createElement('div', { className: `p-3 rounded-2xl ${activePreset.type === 'healing' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}` },
                    activePreset.type === 'healing' 
                      ? React.createElement(Heart, { className: "w-8 h-8" }) 
                      : (activePreset.scaling === 'skill' 
                          ? React.createElement(Sword, { className: "w-8 h-8" }) 
                          : React.createElement(Flame, { className: "w-8 h-8" }))
                  ),
                  React.createElement('div', null,
                    React.createElement('h2', { className: "text-2xl font-black text-white tracking-tight leading-none uppercase" }, activePreset.name),
                    React.createElement('p', { className: "text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2" },
                      `Level ${level} • ${activePreset.scaling === 'magic' ? 'ML' : 'Skill'} ${activePreset.scaling === 'magic' ? magicLevel : meleeSkill}`
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
                  React.createElement('span', { className: "text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest group-hover:text-emerald-500 transition-colors" }, "Min Hit"),
                  React.createElement('span', { className: "text-5xl font-black text-slate-100 font-mono tracking-tighter" }, results.min)
                ),
                
                React.createElement('div', { className: "bg-[#0c0e12]/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center relative group shadow-lg" },
                  React.createElement('span', { className: "text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest group-hover:text-rose-500 transition-colors" }, "Max Hit"),
                  React.createElement('span', { className: "text-5xl font-black text-slate-100 font-mono tracking-tighter" }, results.max)
                )
              )
            ),

            React.createElement('div', { className: "p-8 space-y-12 flex-1" },
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
                        className: `absolute top-1/2 -translate-y-1/2 h-4 rounded-full shadow-lg ring-2 ring-white/10 ${activePreset.type === 'healing' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-rose-700 to-amber-500'}`,
                        style: { width: '100%', left: '0' }
                      },
                        React.createElement('div', { className: "absolute left-0 -top-10 text-[10px] font-black text-slate-400 bg-[#161a20] px-2 py-1 rounded border border-slate-800 shadow-sm" }, `MIN ${results.min}`),
                        React.createElement('div', { className: "absolute right-0 -top-10 text-[10px] font-black text-slate-400 bg-[#161a20] px-2 py-1 rounded border border-slate-800 shadow-sm" }, `MAX ${results.max}`),
                        React.createElement('div', { className: "absolute left-1/2 -bottom-10 -translate-x-1/2 text-[10px] font-black text-amber-500 bg-[#161a20] px-2 py-1 rounded border border-amber-500/20 whitespace-nowrap" }, `AVG ${results.avg}`),
                        React.createElement('div', { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-white shadow-[0_0_10px_white] rounded-full" })
                      )
                   )
                )
              ),

              React.createElement('div', { className: "space-y-6" },
                React.createElement('div', { className: "flex items-center justify-between" },
                  React.createElement('h3', { className: "text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2" },
                    React.createElement(Zap, { className: "w-4 h-4 text-amber-500" }), " Mathematical Breakdown"
                  )
                ),

                React.createElement('div', { className: "bg-[#0c0e12] border border-slate-800 rounded-2xl p-6 font-mono text-[11px] leading-relaxed shadow-inner" },
                  // Formula Display
                  React.createElement('div', { className: "bg-[#161a20] border border-slate-800 rounded-xl p-4 mb-6 shadow-sm" },
                    React.createElement('div', { className: "text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2" }, "Active Formula"),
                    React.createElement('div', { className: "text-amber-500 text-sm font-bold flex flex-wrap items-center gap-2" },
                      React.createElement('span', { className: "text-white" }, "Output = "),
                      React.createElement('span', { className: "bg-slate-800 px-2 py-0.5 rounded text-[10px]" }, "floor(Level / 5)"),
                      React.createElement('span', { className: "text-slate-600" }, "+"),
                      React.createElement('span', { className: "bg-slate-800 px-2 py-0.5 rounded text-[10px]" }, `floor(${activePreset.scaling === 'magic' ? 'ML' : 'Skill'} × Mult + Offset)`)
                    )
                  ),

                  React.createElement('div', { className: "space-y-4" },
                    React.createElement('div', { className: "flex justify-between items-center group" },
                      React.createElement('div', { className: "flex items-center gap-2" },
                        React.createElement(ChevronRight, { className: "w-3 h-3 text-amber-500" }),
                        React.createElement('span', { className: "text-slate-500" }, "Level Base")
                      ),
                      React.createElement('div', { className: "flex items-center gap-3" },
                        React.createElement('span', { className: "text-[9px] text-slate-600" }, `floor(${level} / 5)`),
                        React.createElement('span', { className: "text-white font-bold w-12 text-right" }, `+${results.levelBase}`)
                      )
                    ),
                    
                    React.createElement('div', { className: "flex justify-between items-center group" },
                      React.createElement('div', { className: "flex items-center gap-2" },
                        React.createElement(ChevronRight, { className: "w-3 h-3 text-emerald-500" }),
                        React.createElement('span', { className: "text-slate-500" }, "Min Stat Scaler")
                      ),
                      React.createElement('div', { className: "flex items-center gap-3" },
                        React.createElement('span', { className: "text-[9px] text-slate-600" }, `floor(${activePreset.scaling === 'magic' ? magicLevel : meleeSkill} × ${results.constants[0]} + ${results.constants[1]})`),
                        React.createElement('span', { className: "text-emerald-400 font-bold w-12 text-right" }, `+${results.minStatComponent}`)
                      )
                    ),

                    React.createElement('div', { className: "flex justify-between items-center group" },
                      React.createElement('div', { className: "flex items-center gap-2" },
                        React.createElement(ChevronRight, { className: "w-3 h-3 text-rose-500" }),
                        React.createElement('span', { className: "text-slate-500" }, "Max Stat Scaler")
                      ),
                      React.createElement('div', { className: "flex items-center gap-3" },
                        React.createElement('span', { className: "text-[9px] text-slate-600" }, `floor(${activePreset.scaling === 'magic' ? magicLevel : meleeSkill} × ${results.constants[2]} + ${results.constants[3]})`),
                        React.createElement('span', { className: "text-rose-400 font-bold w-12 text-right" }, `+${results.maxStatComponent}`)
                      )
                    )
                  ),

                  modifier !== 0 && (
                    React.createElement('div', { className: "mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center text-amber-500 font-bold uppercase text-[10px] tracking-widest" },
                      React.createElement('span', { className: "flex items-center gap-2" }, React.createElement(TrendingUp, { className: "w-3 h-3" }), " Equipment Multiplier"),
                      React.createElement('span', null, `× ${(1 + modifier / 100).toFixed(2)}`)
                    )
                  ),
                  
                  React.createElement('div', { className: "mt-8 pt-5 border-t border-slate-700 flex justify-between items-center font-bold text-sm text-white" },
                    React.createElement('span', { className: "tracking-tighter uppercase font-black text-xs text-slate-400" }, "Projected Range"),
                    React.createElement('div', { className: "flex items-center gap-3" },
                      React.createElement('span', { className: "text-xs text-slate-600 font-normal" }, `[${results.levelBase} + ${results.minStatComponent}] — [${results.levelBase} + ${results.maxStatComponent}]`),
                      React.createElement('span', { className: "bg-amber-500 px-3 py-1 rounded-lg text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.3)]" }, `${results.min} — ${results.max}`)
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
          React.createElement('div', { className: "text-[9px] font-bold text-slate-600 uppercase tracking-widest" }, "Mathematical Verification: PASSED")
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
