import { motion } from 'motion/react';

interface Step {
  label: string;
  icon?: string;
  color?: string;
}

interface AutomationFlowProps {
  title: string;
  description: string;
  steps: Step[];
  delay?: number;
}

export function AutomationFlow({ title, description, steps, delay = 0 }: AutomationFlowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-lg border border-border bg-card"
    >
      <div className="w-full md:w-1/3">
        <h4 className="text-lg font-bold text-foreground mb-2">{title}</h4>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <div className="flex-1 flex flex-wrap items-center justify-center gap-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-4 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: delay + idx * 0.08 }}
              className={
                idx === steps.length - 1
                  ? 'px-3 py-2 border border-primary bg-primary/10 text-primary font-mono text-xs uppercase'
                  : 'px-3 py-2 border border-border text-foreground font-mono text-xs uppercase'
              }
            >
              {step.label}
            </motion.div>
            {idx < steps.length - 1 && (
              <div
                className="w-8 h-px bg-border flex-shrink-0"
                aria-hidden
              />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
