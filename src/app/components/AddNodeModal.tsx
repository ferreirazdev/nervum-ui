import { X, Plus } from 'lucide-react';
import { useState } from 'react';

interface NodeOption {
  label: string;
  icon: string;
  metadata?: string;
}

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentNode: {
    id: string;
    label: string;
    type: string;
  } | null;
  onAddNode: (nodeData: {
    label: string;
    icon: string;
    metadata?: string;
    status: 'healthy' | 'warning' | 'critical';
  }) => void;
}

const nodeOptionsByType: Record<string, NodeOption[]> = {
  infrastructure: [
    { label: 'AWS', icon: 'cloud', metadata: 'us-east-1' },
    { label: 'GCP', icon: 'cloud', metadata: 'us-central1' },
    { label: 'Azure', icon: 'cloud', metadata: 'eastus' },
    { label: 'Kubernetes', icon: 'cpu', metadata: 'Cluster' },
    { label: 'Docker', icon: 'cpu', metadata: 'Containers' },
    { label: 'Load Balancer', icon: 'zap', metadata: 'Traffic' },
    { label: 'CDN', icon: 'globe', metadata: 'CloudFlare' },
  ],
  services: [
    { label: 'Auth API', icon: 'lock', metadata: 'REST' },
    { label: 'Payments API', icon: 'dollar', metadata: 'GraphQL' },
    { label: 'User API', icon: 'users', metadata: 'REST' },
    { label: 'Web App', icon: 'globe', metadata: 'React' },
    { label: 'Mobile App', icon: 'globe', metadata: 'React Native' },
    { label: 'Admin Panel', icon: 'server', metadata: 'Next.js' },
    { label: 'Notification Service', icon: 'zap', metadata: 'WebSocket' },
  ],
  databases: [
    { label: 'PostgreSQL', icon: 'database', metadata: 'Primary DB' },
    { label: 'MongoDB', icon: 'database', metadata: 'Documents' },
    { label: 'Redis', icon: 'zap', metadata: 'Cache' },
    { label: 'Elasticsearch', icon: 'database', metadata: 'Search' },
    { label: 'MySQL', icon: 'database', metadata: 'Legacy' },
  ],
  teams: [
    { label: 'Backend Squad', icon: 'users', metadata: 'Engineers' },
    { label: 'Frontend Team', icon: 'users', metadata: 'Engineers' },
    { label: 'Platform Team', icon: 'users', metadata: 'DevOps' },
    { label: 'Mobile Team', icon: 'users', metadata: 'Engineers' },
    { label: 'QA Team', icon: 'users', metadata: 'Quality' },
  ],
  observability: [
    { label: 'Latency Monitor', icon: 'activity', metadata: 'p95' },
    { label: 'Error Tracking', icon: 'chart', metadata: 'Sentry' },
    { label: 'Logs', icon: 'chart', metadata: 'Datadog' },
    { label: 'Metrics', icon: 'activity', metadata: 'Prometheus' },
    { label: 'Alerts', icon: 'zap', metadata: 'PagerDuty' },
  ],
  costs: [
    { label: 'Compute Costs', icon: 'dollar', metadata: '/month' },
    { label: 'Storage Costs', icon: 'dollar', metadata: '/month' },
    { label: 'Network Costs', icon: 'dollar', metadata: '/month' },
    { label: 'License Costs', icon: 'dollar', metadata: '/month' },
  ],
  roadmap: [
    { label: 'Q1 Features', icon: 'target', metadata: 'Planning' },
    { label: 'Q2 Features', icon: 'target', metadata: 'Planning' },
    { label: 'Tech Debt', icon: 'git', metadata: 'Backlog' },
    { label: 'Infrastructure', icon: 'cloud', metadata: 'Planned' },
  ],
};

export function AddNodeModal({
  isOpen,
  onClose,
  parentNode,
  onAddNode,
}: AddNodeModalProps) {
  const [customLabel, setCustomLabel] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  if (!isOpen || !parentNode) return null;

  const options = nodeOptionsByType[parentNode.type] || [];

  const handleAddNode = (option: NodeOption) => {
    onAddNode({
      label: option.label,
      icon: option.icon,
      metadata: option.metadata,
      status: 'healthy',
    });
    onClose();
  };

  const handleAddCustom = () => {
    if (customLabel.trim()) {
      onAddNode({
        label: customLabel,
        icon: 'server',
        status: 'healthy',
      });
      setCustomLabel('');
      setShowCustom(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative mx-4 w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Add to {parentNode.label}
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Select a component or create a custom one
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-muted"
          >
            <X className="text-muted-foreground h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[500px] overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAddNode(option)}
                className="group flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-4 transition-all hover:border-primary/50 hover:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all group-hover:bg-primary/20 group-hover:text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-foreground text-sm font-medium">
                    {option.label}
                  </div>
                  {option.metadata && (
                    <div className="text-muted-foreground mt-0.5 text-xs">
                      {option.metadata}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-4">
            {!showCustom ? (
              <button
                onClick={() => setShowCustom(true)}
                className="text-left w-full rounded-xl border border-dashed border-border bg-muted/50 p-4 transition-all hover:border-primary/50 hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <Plus className="text-muted-foreground h-5 w-5" />
                  <span className="text-muted-foreground text-sm">
                    Create custom component
                  </span>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Enter component name..."
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCustom();
                    if (e.key === 'Escape') {
                      setShowCustom(false);
                      setCustomLabel('');
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCustom}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Add Component
                  </button>
                  <button
                    onClick={() => {
                      setShowCustom(false);
                      setCustomLabel('');
                    }}
                    className="rounded-lg bg-muted px-4 py-2 text-muted-foreground text-sm transition-colors hover:bg-muted/80"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
