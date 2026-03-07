const WaveBars = () => (
  <div className="flex items-end gap-[2px] h-5">
    {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
      <div
        key={i}
        className="w-[3px] rounded-sm bg-primary"
        style={{
          height: [8, 14, 20, 14, 8][i],
          animation: `wave-anim 1s infinite ease-in-out`,
          animationDelay: `${delay}s`,
        }}
      />
    ))}
  </div>
);

export default WaveBars;
