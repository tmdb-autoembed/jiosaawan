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
    setAudioEffects({ eqBands: bands.map(b => b.gain), bassBoost, reverb, pitch, speed, echo, enabled: audioEffects?.enabled ?? false });
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

  const barColors = [
    'hsl(25, 100%, 60%)',
    'hsl(340, 85%, 58%)',
    'hsl(55, 95%, 55%)',
    'hsl(170, 80%, 50%)',
    'hsl(220, 90%, 55%)',
    'hsl(280, 70%, 55%)',
  ];

  const effectSliders = [
    { label: 'Reverb', value: reverb, set: setReverb, max: 100, step: 5, icon: Waves, color: 'hsl(280, 70%, 55%)', display: `${reverb}%` },
    { label: 'Pitch', value: pitch * 50, set: (v: number) => setPitch(v / 50), min: 25, max: 100, step: 1, icon: Radio, color: 'hsl(170, 80%, 50%)', display: `${pitch.toFixed(2)}x` },
    { label: 'Speed', value: speed * 50, set: (v: number) => setSpeed(v / 50), min: 25, max: 100, step: 1, icon: Gauge, color: 'hsl(25, 100%, 60%)', display: `${speed.toFixed(2)}x` },
    { label: 'Echo', value: echo, set: setEcho, max: 100, step: 5, icon: Zap, color: 'hsl(340, 85%, 58%)', display: `${echo}%` },
  ];

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab('eq')}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-xs transition-all ${activeTab === 'eq' ? 'bg-primary text-primary-foreground' : 'bg-secondary/30 text-muted-foreground'}`}
        >
          <Music2 className="w-3.5 h-3.5 inline mr-1.5" /> Equalizer
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-xs transition-all ${activeTab === 'effects' ? 'bg-primary text-primary-foreground' : 'bg-secondary/30 text-muted-foreground'}`}
        >
          <Zap className="w-3.5 h-3.5 inline mr-1.5" /> Effects
        </button>
      </div>

      {activeTab === 'eq' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Presets */}
          <div className="mb-5">
            <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider mb-2 font-semibold">Presets</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(PRESETS).map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-semibold capitalize transition-all ${
                    activePreset === preset ? 'bg-primary text-primary-foreground' : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 6-Band EQ - Vertical sliders with color fill */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: 'hsla(250, 18%, 12%, 0.6)' }}>
            <div className="flex justify-between items-end gap-3 h-44">
              {bands.map((band, index) => {
                const fillPct = ((band.gain + 12) / 24) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="h-28 w-5 rounded-full relative overflow-hidden" style={{ background: 'hsla(250, 15%, 20%, 0.6)' }}>
                      {/* Color fill from bottom */}
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-200"
                        style={{
                          height: `${Math.max(5, fillPct)}%`,
                          background: `linear-gradient(to top, ${barColors[index]}, ${barColors[index]}88)`,
                          boxShadow: `0 0 8px ${barColors[index]}66`,
                        }}
                      />
                      <input type="range" min="-12" max="12" step="1" value={band.gain}
                        onChange={(e) => handleBandChange(index, [parseInt(e.target.value)])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                      />
                    </div>
                    <span className="text-[9px] font-bold" style={{ color: barColors[index] }}>
                      {band.gain > 0 ? '+' : ''}{band.gain}
                    </span>
                    <span className="text-[9px] text-muted-foreground/50">{band.frequency}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bass Boost */}
          <div className="rounded-2xl p-4" style={{ background: 'hsla(250, 18%, 12%, 0.6)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary">
                <Volume2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">Bass Boost</p>
                <p className="text-[10px] text-muted-foreground/40">Enhance low frequencies</p>
              </div>
              <span className="text-xs font-semibold text-primary">{bassBoost}%</span>
            </div>
            <Slider value={[bassBoost]} onValueChange={(v) => setBassBoost(v[0])} max={100} step={5} />
          </div>
        </motion.div>
      )}

      {activeTab === 'effects' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {effectSliders.map(({ label, value, set, max = 100, min = 0, step = 5, icon: Icon, color, display }) => (
            <div key={label} className="rounded-2xl p-4" style={{ background: 'hsla(250, 18%, 12%, 0.6)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color }}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                </div>
                <span className="text-xs font-semibold" style={{ color }}>{display}</span>
              </div>
              <Slider value={[value]} onValueChange={(v) => set(v[0])} min={min} max={max} step={step} />
            </div>
          ))}
          <button onClick={resetEffects} className="w-full py-2.5 rounded-xl bg-secondary/25 text-muted-foreground font-semibold text-xs hover:bg-secondary/40 transition-all">
            Reset All Effects
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Equalizer;
