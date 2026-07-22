"use client";
function WaveformSkeleton({ bars = 68 }: { bars?: number }) {
  return (
    <div
      className="flex h-full w-full items-center gap-0.5 md:gap-2.5 px-1"
      aria-hidden
    >
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className="flex-1 bg-gray-300/50 animate-pulse"
          style={{
            height: `${25 + ((i * 37 + 11) % 55)}%`,
            animationDelay: `${(i % 8) * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default WaveformSkeleton;
