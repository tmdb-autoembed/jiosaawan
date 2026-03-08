import { useState, useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { Music2, Zap, Volume2, Waves, Radio, Gauge } from 'lucide-react';

interface EqualizerBand {
  frequency: string;
  gain: number;
}

const DEFAULT_BANDS: EqualizerBand[] = [
  { frequency: '60Hz', gain: 0 },
  { frequency: '230Hz', gain: 0 },
  { frequency: '910Hz', gain: 0 },
  { frequency: '3.6kHz', gain: 0 },
  { frequency: '14kHz', gain: 0 },
  { frequency: '16kHz', gain: 0 },
];

const PRESETS = {
  flat: [0, 0, 0, 0, 0, 0],
  bass: [6, 5, 2, 0, -1, -2],
  pop: [2, 4, 5, 3, 1, 0],
  rock: [5, 3, 0, 2, 4, 5],
  jazz: [3, 2, 1, 2, 3, 4],
  classical: [4, 3, 0, 0, 2, 4],
  electronic: [5, 4, 0, 3, 4, 5],
  vocal: [0, 2, 5, 5, 3, 1],
};

const Equalizer = () => {
  const { audioEffects, setAudioEffects } = usePlayer();
  const [bands, setBands] = useState<EqualizerBand[]>(
    audioEffects?.eqBands?.map((gain, i) => ({ ...DEFAULT_BANDS[i], gain })) || DEFAULT_BANDS
  );
  const [activePreset, setActivePreset] = useState<string>('flat');
  const [activeTab, setActiveTab] = useState<'eq' | 'effects'>('eq');
  const [bassBoost, setBassBoost] = useState(audioEffects?.bassBoost || 0);
  const [reverb, setReverb] = useState(audioEffects?.reverb || 0);
  const [pitch, setPitch] = useState(audioEffects?.pitch || 1);
  const [speed, setSpeed] = useState(audioEffects?.speed || 1);
  const [echo, setEcho] = useState(audioEffects?.echo || 0);

  useEffect(() => {
    setAudioEffects({ eqBands: bands.map(b => b.gain), bassBoost, reverb, pitch, speed, echo });
  }, [bands, bassBoost, reverb, pitch, speed, echo]);

  const handleBandChange = (index: number, value: number[]) => {
    const newBands = [...bands];
    newBands[index] = { ...newBands[index], gain: value[0] };
    setBands(newBands);
    setActivePreset('custom');
  };

  const applyPreset = (presetName: string) => {
    const preset = PRESETS[presetName as keyof typeof PRESETS];
    if (preset) {
      setBands(bands.map((band, i) => ({ ...band, gain: preset[i] })));
      setActivePreset(presetName);
    }
  };

  const resetEffects = () => {
    setBassBoost(0); setReverb(0); setPitch(1); setSpeed(1); setEcho(0);
    applyPreset('flat');
  };

  const barGradients = [
    'from-rose-500 to-pink-400',
    'from-orange-500 to-amber-400',
    'from-yellow-400 to-lime-400',
    'from-emerald-400 to-teal-400',
    'from-cyan-400 to-blue-400',
    'from-violet-500 to-purple-400',
  ];

  const effectSliders = [
    { label: 'Reverb', value: reverb, set: setReverb, max: 100, step: 5, icon: Waves, gradient: 'from-violet-500 to-purple-500', display: `${reverb}%` },
    { label: 'Pitch', value: pitch * 50, set: (v: number) => setPitch(v / 50), min: 25, max: 100, step: 1, icon: Radio, gradient: 'from-cyan-500 to-blue-500', display: `${pitch.toFixed(2)}x` },
    { label: 'Speed', value: speed * 50, set: (v: number) => setSpeed(v / 50), min: 25, max: 100, step: 1, icon: Gauge, gradient: 'from-emerald-500 to-teal-500', display: `${speed.toFixed(2)}x` },
    { label: 'Echo', value: echo, set: setEcho, max: 100, step: 5, icon: Zap, gradient: 'from-pink-500 to-rose-500', display: `${echo}%` },
  ];

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab('eq')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === 'eq' ? 'bg-gradient-primary text-primary-foreground shadow-lg glow-primary' : 'bg-secondary/40 text-muted-foreground'}`}
        >
          <Music2 className="w-3.5 h-3.5 inline mr-1.5" /> Equalizer
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === 'effects' ? 'bg-gradient-ocean text-white shadow-lg glow-blue' : 'bg-secondary/40 text-muted-foreground'}`}
        >
          <Zap className="w-3.5 h-3.5 inline mr-1.5" /> Effects
        </button>
      </div>

      {activeTab === 'eq' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Presets */}
          <div className="mb-5">
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-2 font-bold">Presets</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(PRESETS).map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold capitalize transition-all ${
                    activePreset === preset ? 'bg-gradient-primary text-primary-foreground shadow-md' : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 6-Band EQ */}
          <div className="card-surface rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-end gap-2.5 h-44">
              {bands.map((band, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="h-28 flex flex-col items-center justify-end relative">
                    <div className={`w-3 rounded-full bg-gradient-to-t ${barGradients[index]} shadow-lg transition-all`}
                      style={{ height: `${Math.max(10, ((band.gain + 12) / 24) * 100)}%` }}
                    />
                    <input type="range" min="-12" max="12" step="1" value={band.gain}
                      onChange={(e) => handleBandChange(index, [parseInt(e.target.value)])}
                      className="absolute h-28 w-6 opacity-0 cursor-pointer"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    />
                  </div>
                  <span className={`text-[9px] font-bold bg-gradient-to-r ${barGradients[index]} bg-clip-text text-transparent`}>
                    {band.gain > 0 ? '+' : ''}{band.gain}
                  </span>
                  <span className="text-[9px] text-muted-foreground/50">{band.frequency}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bass Boost */}
          <div className="card-surface rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                <Volume2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-foreground">Bass Boost</p>
                <p className="text-[10px] text-muted-foreground/50">Enhance low frequencies</p>
              </div>
              <span className="text-xs font-bold text-orange-400">{bassBoost}%</span>
            </div>
            <Slider value={[bassBoost]} onValueChange={(v) => setBassBoost(v[0])} max={100} step={5}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-orange-500 [&_[role=slider]]:to-red-500 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-orange-500 [&_.bg-primary]:to-red-500"
            />
          </div>
        </motion.div>
      )}

      {activeTab === 'effects' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {effectSliders.map(({ label, value, set, max = 100, min = 0, step = 5, icon: Icon, gradient, display }) => (
            <div key={label} className="card-surface rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">{label}</p>
                </div>
                <span className={`text-xs font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{display}</span>
              </div>
              <Slider value={[value]} onValueChange={(v) => set(v[0])} min={min} max={max} step={step}
                className={`[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:${gradient} [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:${gradient}`}
              />
            </div>
          ))}
          <button onClick={resetEffects} className="w-full py-2.5 rounded-xl bg-secondary/40 text-muted-foreground font-bold text-xs hover:bg-secondary/60 transition-all">
            Reset All Effects
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Equalizer;
