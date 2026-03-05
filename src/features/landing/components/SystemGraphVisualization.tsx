import { motion } from 'motion/react';
import { Database, Server, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface Node {
  id: string;
  label: string;
  type: 'environment' | 'service' | 'database';
  status: 'healthy' | 'warning' | 'critical';
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
}

const nodes: Node[] = [
  // Production environment
  { id: 'prod', label: 'Production', type: 'environment', status: 'healthy', x: 50, y: 20 },
  { id: 'api-prod', label: 'API Service', type: 'service', status: 'healthy', x: 30, y: 45 },
  { id: 'web-prod', label: 'Web App', type: 'service', status: 'warning', x: 70, y: 45 },
  { id: 'db-prod', label: 'PostgreSQL', type: 'database', status: 'healthy', x: 50, y: 70 },

  // Staging environment
  { id: 'staging', label: 'Staging', type: 'environment', status: 'healthy', x: 150, y: 20 },
  { id: 'api-staging', label: 'API Service', type: 'service', status: 'healthy', x: 130, y: 45 },
  { id: 'web-staging', label: 'Web App', type: 'service', status: 'healthy', x: 170, y: 45 },
  { id: 'db-staging', label: 'PostgreSQL', type: 'database', status: 'healthy', x: 150, y: 70 },
];

const connections: Connection[] = [
  { from: 'prod', to: 'api-prod' },
  { from: 'prod', to: 'web-prod' },
  { from: 'api-prod', to: 'db-prod' },
  { from: 'web-prod', to: 'db-prod' },
  { from: 'staging', to: 'api-staging' },
  { from: 'staging', to: 'web-staging' },
  { from: 'api-staging', to: 'db-staging' },
  { from: 'web-staging', to: 'db-staging' },
];

export function SystemGraphVisualization() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'critical':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'environment':
        return '#3b82f6';
      case 'service':
        return '#8b5cf6';
      case 'database':
        return '#a78bfa';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-3 h-3" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3" />;
      case 'critical':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'service':
        return <Server className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
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

      {/* SVG for connections */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {connections.map((conn, idx) => {
          const fromNode = nodes.find((n) => n.id === conn.from);
          const toNode = nodes.find((n) => n.id === conn.to);
          if (!fromNode || !toNode) return null;

          const isHighlighted = hoveredNode === conn.from || hoveredNode === conn.to;

          return (
            <motion.line
              key={idx}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke="url(#lineGradient)"
              strokeWidth={isHighlighted ? '2' : '1'}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: isHighlighted ? 0.8 : 0.4 }}
              transition={{ duration: 1, delay: idx * 0.1 }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      <div className="relative w-full h-full" style={{ zIndex: 2 }}>
        {nodes.map((node, idx) => (
          <motion.div
            key={node.id}
            className="absolute"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <motion.div
              className="relative cursor-pointer"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-lg blur-xl opacity-50"
                style={{
                  backgroundColor: getNodeColor(node.type),
                  transform: 'scale(1.2)',
                }}
              />

              {/* Node card */}
              <div
                className="relative px-4 py-3 rounded-lg border backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  borderColor: getNodeColor(node.type),
                  boxShadow: `0 0 20px ${getNodeColor(node.type)}40`,
                }}
              >
                <div className="flex items-center gap-2 min-w-[120px]">
                  {/* Node icon */}
                  <div
                    className="p-1.5 rounded"
                    style={{
                      backgroundColor: `${getNodeColor(node.type)}20`,
                      color: getNodeColor(node.type),
                    }}
                  >
                    {getNodeIcon(node.type)}
                  </div>

                  {/* Label */}
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{node.label}</div>
                  </div>

                  {/* Status indicator */}
                  <div
                    className="flex items-center justify-center p-1 rounded"
                    style={{
                      backgroundColor: `${getStatusColor(node.status)}20`,
                      color: getStatusColor(node.status),
                    }}
                  >
                    {getStatusIcon(node.status)}
                  </div>
                </div>
              </div>

              {/* Pulse animation for warning/critical */}
              {node.status !== 'healthy' && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    border: `2px solid ${getStatusColor(node.status)}`,
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-4 right-4 flex gap-4 text-xs text-gray-400"
        style={{ zIndex: 3 }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
          <span>Environment</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
          <span>Service</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#a78bfa' }} />
          <span>Database</span>
        </div>
      </div>
    </div>
  );
}
