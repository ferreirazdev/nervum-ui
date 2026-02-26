import { Handle, Position } from 'reactflow';
import {
  Server,
  Database,
  Users,
  Activity,
  DollarSign,
  MapPin,
  Cloud,
  Cpu,
  Globe,
  Lock,
  Zap,
  BarChart3,
  GitBranch,
  Target,
  Network,
} from 'lucide-react';
import { memo } from 'react';

type NodeType =
  | 'central'
  | 'infrastructure'
  | 'services'
  | 'databases'
  | 'teams'
  | 'observability'
  | 'costs'
  | 'roadmap'
  | 'leaf';

type Status = 'healthy' | 'warning' | 'critical';

interface SystemNodeProps {
  data: {
    label: string;
    type: NodeType;
    status?: Status;
    metadata?: string;
    icon?: string;
    onNodeClick?: (nodeId: string, nodeData: any) => void;
  };
  id: string;
}

const iconMap: Record<string, React.ReactNode> = {
  server: <Server className="w-4 h-4" />,
  database: <Database className="w-4 h-4" />,
  users: <Users className="w-4 h-4" />,
  activity: <Activity className="w-4 h-4" />,
  dollar: <DollarSign className="w-4 h-4" />,
  map: <MapPin className="w-4 h-4" />,
  cloud: <Cloud className="w-4 h-4" />,
  cpu: <Cpu className="w-4 h-4" />,
  globe: <Globe className="w-4 h-4" />,
  lock: <Lock className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
  chart: <BarChart3 className="w-4 h-4" />,
  git: <GitBranch className="w-4 h-4" />,
  target: <Target className="w-4 h-4" />,
  network: <Network className="w-4 h-4" />,
};

const statusColors: Record<Status, string> = {
  healthy: 'bg-green-500',
  warning: 'bg-yellow-500',
  critical: 'bg-red-500',
};

function SystemNode({ data, id }: SystemNodeProps) {
  const { label, type, status, metadata, icon, onNodeClick } = data;

  const isCentral = type === 'central';
  const isCategory = [
    'infrastructure',
    'services',
    'databases',
    'teams',
    'observability',
    'costs',
    'roadmap',
  ].includes(type);

  const handleClick = () => {
    if (onNodeClick && (isCentral || isCategory)) {
      onNodeClick(id, { label, type });
    }
  };

  return (
    <div
      className={`
        relative group
        ${
          isCentral
            ? 'w-64 h-64'
            : isCategory
            ? 'w-44 h-44'
            : 'w-36 h-28'
        }
      `}
      onClick={handleClick}
    >
      {/* Handles for connections */}
      {!isCentral && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-2 h-2 !bg-blue-400 !border-2 !border-blue-600"
        />
      )}

      {/* Node Content */}
      <div
        className={`
          w-full h-full
          rounded-2xl border
          backdrop-blur-sm
          transition-all duration-300
          ${(isCentral || isCategory) ? 'cursor-pointer' : ''}
          ${
            isCentral
              ? 'bg-gradient-to-br from-zinc-950/90 to-black border-blue-500/50 shadow-2xl shadow-blue-500/20 hover:border-blue-400 hover:shadow-blue-400/30'
              : isCategory
              ? 'bg-gradient-to-br from-zinc-950/90 to-black border-blue-500/40 shadow-lg shadow-blue-500/10 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/30 hover:bg-gradient-to-br hover:from-blue-950/20 hover:to-black'
              : 'bg-gradient-to-br from-zinc-900/80 to-black border-purple-500/30 shadow-md shadow-purple-500/5 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20'
          }
        `}
      >
        <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center gap-2">
          {/* Icon */}
          <div
            className={`
              rounded-xl flex items-center justify-center
              ${
                isCentral
                  ? 'w-16 h-16 bg-blue-500/20 text-blue-400'
                  : isCategory
                  ? 'w-10 h-10 bg-zinc-900/70 text-zinc-300'
                  : 'w-8 h-8 bg-zinc-800/60 text-zinc-400'
              }
            `}
          >
            {icon && iconMap[icon] ? (
              iconMap[icon]
            ) : (
              <Network className={isCentral ? 'w-8 h-8' : 'w-4 h-4'} />
            )}
          </div>

          {/* Label */}
          <div
            className={`
              text-white
              ${
                isCentral
                  ? 'text-xl font-semibold'
                  : isCategory
                  ? 'text-sm font-medium'
                  : 'text-xs font-medium'
              }
            `}
          >
            {label}
          </div>

          {/* Metadata */}
          {metadata && (
            <div className="text-[10px] text-zinc-500 mt-1">{metadata}</div>
          )}

          {/* Status Indicator */}
          {status && (
            <div className="flex items-center gap-1.5 mt-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${statusColors[status]} ${
                  status === 'healthy' ? 'animate-pulse' : ''
                }`}
              />
              <span className="text-[10px] text-zinc-600 capitalize">
                {status}
              </span>
            </div>
          )}
        </div>

        {/* Glow effect on hover */}
        <div
          className={`
            absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
            ${
              isCentral
                ? 'bg-blue-500/10'
                : isCategory
                ? 'bg-blue-400/10'
                : 'bg-purple-400/10'
            }
          `}
        />
      </div>

      {/* Output Handles */}
      {(isCentral || isCategory) && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2 h-2 !bg-purple-400 !border-2 !border-purple-600"
        />
      )}
    </div>
  );
}

export default memo(SystemNode);