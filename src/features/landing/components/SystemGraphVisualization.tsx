import { MapPageDemo } from '@/features/map/components/MapPageDemo';

export function SystemGraphVisualization() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="relative w-full h-[500px] rounded-xl border border-white/10 bg-gradient-to-br from-black via-gray-950 to-black overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Map demo */}
      <div className="relative w-full h-full" style={{ zIndex: 2 }}>
        <MapPageDemo />
      </div>
      </div>
    </div>
  );
}
