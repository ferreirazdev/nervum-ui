import { ZoomIn, ZoomOut, Maximize2, Filter } from 'lucide-react';
import { useReactFlow } from 'reactflow';
import { useState } from 'react';

interface ControlsProps {
  showDependencies: boolean;
  showCosts: boolean;
  showOwnership: boolean;
  environment: 'prod' | 'staging' | 'dev';
  onToggleDependencies: () => void;
  onToggleCosts: () => void;
  onToggleOwnership: () => void;
  onEnvironmentChange: (env: 'prod' | 'staging' | 'dev') => void;
}

export function Controls({
  showDependencies,
  showCosts,
  showOwnership,
  environment,
  onToggleDependencies,
  onToggleCosts,
  onToggleOwnership,
  onEnvironmentChange,
}: ControlsProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
        <button
          onClick={() => zoomIn()}
          className="rounded-xl border border-border bg-card/95 p-3 backdrop-blur-md transition-all hover:border-primary/50 hover:bg-muted"
          title="Zoom In"
        >
          <ZoomIn className="text-muted-foreground h-4 w-4" />
        </button>
        <button
          onClick={() => zoomOut()}
          className="rounded-xl border border-border bg-card/95 p-3 backdrop-blur-md transition-all hover:border-primary/50 hover:bg-muted"
          title="Zoom Out"
        >
          <ZoomOut className="text-muted-foreground h-4 w-4" />
        </button>
        <button
          onClick={() => fitView()}
          className="rounded-xl border border-border bg-card/95 p-3 backdrop-blur-md transition-all hover:border-primary/50 hover:bg-muted"
          title="Fit View"
        >
          <Maximize2 className="text-muted-foreground h-4 w-4" />
        </button>
      </div>

      {/* Filter Toggle */}
      <div className="absolute bottom-6 left-6 z-10">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-xl border border-border bg-card/95 p-3 backdrop-blur-md transition-all hover:border-primary/50 hover:bg-muted"
        >
          <Filter className="text-muted-foreground h-4 w-4" />
          <span className="text-muted-foreground text-sm">Filters</span>
        </button>

        {showFilters && (
          <div className="absolute bottom-full left-0 mb-3 w-72 rounded-xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-md">
            <div className="mb-4">
              <label className="text-muted-foreground mb-2 block text-xs">
                Environment
              </label>
              <div className="flex gap-2">
                {(['prod', 'staging', 'dev'] as const).map((env) => (
                  <button
                    key={env}
                    onClick={() => onEnvironmentChange(env)}
                    className={`
                      flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all
                      ${
                        environment === env
                          ? 'border-primary/50 bg-primary/20 text-primary'
                          : 'border-border bg-muted text-muted-foreground hover:border-muted-foreground/30'
                      }
                    `}
                  >
                    {env === 'prod'
                      ? 'Production'
                      : env === 'staging'
                      ? 'Staging'
                      : 'Dev'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-muted-foreground mb-2 block text-xs">
                Display Options
              </label>

              <ToggleOption
                label="Show dependencies"
                checked={showDependencies}
                onChange={onToggleDependencies}
              />
              <ToggleOption
                label="Show costs"
                checked={showCosts}
                onChange={onToggleCosts}
              />
              <ToggleOption
                label="Show team ownership"
                checked={showOwnership}
                onChange={onToggleOwnership}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ToggleOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted"
    >
      <span className="text-muted-foreground text-sm">{label}</span>
      <div
        className={`
          relative h-5 w-9 rounded-full transition-colors
          ${checked ? 'bg-primary' : 'bg-muted'}
        `}
      >
        <div
          className={`
            absolute top-0.5 h-4 w-4 rounded-full bg-primary-foreground transition-transform
            ${checked ? 'translate-x-4' : 'translate-x-0.5'}
          `}
        />
      </div>
    </button>
  );
}