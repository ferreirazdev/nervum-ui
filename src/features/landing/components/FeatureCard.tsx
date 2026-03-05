import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-300 blur-xl" />

      <div className="relative p-6 rounded-xl border border-border bg-card backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 text-blue-400 group-hover:from-blue-600/30 group-hover:to-purple-600/30 transition-all duration-300">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
