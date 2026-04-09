import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  category?: string;
  delay?: number;
  /** When true, card is a Nexus-style standalone card */
  gridCell?: boolean;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  category,
  delay = 0,
  gridCell = false,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={gridCell ? 'landing-card-nexus p-8' : 'relative group'}
    >
      {!gridCell && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-primary/10 transition-all duration-300 blur-xl" />
      )}
      <div
        className={
          gridCell
            ? 'relative'
            : 'relative p-6 rounded-xl border border-border bg-card backdrop-blur-sm hover:border-primary/30 transition-all duration-300'
        }
      >
        {gridCell ? (
          <>
            {category != null && (
              <p className="text-primary font-mono-landing text-xs uppercase tracking-tighter mb-4">
                {category}
              </p>
            )}
            <div className="landing-icon-box mb-6">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-[22px] font-bold text-foreground mb-3">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
          </>
        ) : (
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/20 text-primary group-hover:bg-primary/30 transition-all duration-300 flex-shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              {category != null && (
                <p className="text-primary font-mono-landing text-xs uppercase tracking-tighter mb-2">
                  {category}
                </p>
              )}
              <h3 className="text-xl font-bold text-foreground mb-4">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
