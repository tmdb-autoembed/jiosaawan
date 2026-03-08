const WaveBars = () => (
  <div className="flex items-end gap-[2px] h-5">
    {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
      <div
        key={i}
        className="w-[3px] rounded-full"
        style={{
          height: [8, 14, 20, 14, 8][i],
          background: `linear-gradient(180deg, hsl(${160 + i * 35}, 100%, 55%), hsl(${180 + i * 35}, 100%, 45%))`,
          animation: `wave-anim 1s infinite ease-in-out`,
          animationDelay: `${delay}s`,
        }}
      />
    ))}
  </div>
);

export default WaveBars;
