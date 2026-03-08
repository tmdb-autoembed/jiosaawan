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

  // Effects state
  const [bassBoost, setBassBoost] = useState(audioEffects?.bassBoost || 0);
  const [reverb, setReverb] = useState(audioEffects?.reverb || 0);
  const [pitch, setPitch] = useState(audioEffects?.pitch || 1);
  const [speed, setSpeed] = useState(audioEffects?.speed || 1);
  const [echo, setEcho] = useState(audioEffects?.echo || 0);

  useEffect(() => {
    setAudioEffects({
      eqBands: bands.map(b => b.gain),
      bassBoost,
      reverb,
      pitch,
      speed,
      echo,
    });
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
    setBassBoost(0);
    setReverb(0);
    setPitch(1);
    setSpeed(1);
    setEcho(0);
    applyPreset('flat');
  };

  const gradientColors = [
    'from-pink-500 to-rose-500',
    'from-orange-500 to-amber-500',
    'from-yellow-500 to-lime-500',
    'from-green-500 to-emerald-500',
    'from-cyan-500 to-blue-500',
    'from-violet-500 to-purple-500',
  ];

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('eq')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'eq'
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30'
              : 'bg-secondary/50 text-muted-foreground'
          }`}
        >
          <Music2 className="w-4 h-4 inline mr-2" />
          Equalizer
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'effects'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
              : 'bg-secondary/50 text-muted-foreground'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Effects
        </button>
      </div>

      {activeTab === 'eq' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Presets */}
          <div className="mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Presets</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(PRESETS).map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                    activePreset === preset
                      ? 'bg-gradient-to-r from-primary to-emerald-400 text-white shadow-lg shadow-primary/30'
                      : 'bg-secondary/70 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 6-Band EQ Sliders */}
          <div className="bg-gradient-to-b from-secondary/30 to-background rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-end gap-3 h-48">
              {bands.map((band, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  {/* Vertical Slider */}
                  <div className="h-32 flex flex-col items-center justify-end relative">
                    <div className={`w-3 rounded-full bg-gradient-to-t ${gradientColors[index]} shadow-lg`}
                      style={{ height: `${Math.max(10, ((band.gain + 12) / 24) * 100)}%` }}
                    />
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={band.gain}
                      onChange={(e) => handleBandChange(index, [parseInt(e.target.value)])}
                      className="absolute h-32 w-6 opacity-0 cursor-pointer"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold bg-gradient-to-r ${gradientColors[index]} bg-clip-text text-transparent`}>
                    {band.gain > 0 ? '+' : ''}{band.gain}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{band.frequency}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bass Boost */}
          <div className="bg-secondary/30 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">Bass Boost</p>
                <p className="text-xs text-muted-foreground">Enhance low frequencies</p>
              </div>
              <span className="text-sm font-bold text-orange-400">{bassBoost}%</span>
            </div>
            <Slider
              value={[bassBoost]}
              onValueChange={(v) => setBassBoost(v[0])}
              max={100}
              step={5}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-orange-500 [&_[role=slider]]:to-red-500 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-orange-500 [&_.bg-primary]:to-red-500"
            />
          </div>
        </motion.div>
      )}

      {activeTab === 'effects' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Reverb */}
          <div className="bg-secondary/30 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">Reverb</p>
                <p className="text-xs text-muted-foreground">Add spatial depth</p>
              </div>
              <span className="text-sm font-bold text-violet-400">{reverb}%</span>
            </div>
            <Slider
              value={[reverb]}
              onValueChange={(v) => setReverb(v[0])}
              max={100}
              step={5}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-violet-500 [&_[role=slider]]:to-purple-600 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-violet-500 [&_.bg-primary]:to-purple-600"
            />
          </div>

          {/* Pitch */}
          <div className="bg-secondary/30 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">Pitch</p>
                <p className="text-xs text-muted-foreground">Shift audio pitch</p>
              </div>
              <span className="text-sm font-bold text-cyan-400">{pitch.toFixed(2)}x</span>
            </div>
            <Slider
              value={[pitch * 50]}
              onValueChange={(v) => setPitch(v[0] / 50)}
              min={25}
              max={100}
              step={1}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-cyan-500 [&_[role=slider]]:to-blue-600 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-cyan-500 [&_.bg-primary]:to-blue-600"
            />
          </div>

          {/* Speed */}
          <div className="bg-secondary/30 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Gauge className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">Speed</p>
                <p className="text-xs text-muted-foreground">Playback rate</p>
              </div>
              <span className="text-sm font-bold text-green-400">{speed.toFixed(2)}x</span>
            </div>
            <Slider
              value={[speed * 50]}
              onValueChange={(v) => setSpeed(v[0] / 50)}
              min={25}
              max={100}
              step={1}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-green-500 [&_[role=slider]]:to-emerald-600 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-green-500 [&_.bg-primary]:to-emerald-600"
            />
          </div>

          {/* Echo */}
          <div className="bg-secondary/30 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">Echo</p>
                <p className="text-xs text-muted-foreground">Repeat delay effect</p>
              </div>
              <span className="text-sm font-bold text-pink-400">{echo}%</span>
            </div>
            <Slider
              value={[echo]}
              onValueChange={(v) => setEcho(v[0])}
              max={100}
              step={5}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-pink-500 [&_[role=slider]]:to-rose-600 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-pink-500 [&_.bg-primary]:to-rose-600"
            />
          </div>

          {/* Reset */}
          <button
            onClick={resetEffects}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold text-sm hover:from-gray-500 hover:to-gray-600 transition-all"
          >
            Reset All Effects
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Equalizer;
