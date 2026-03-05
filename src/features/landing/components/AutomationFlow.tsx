import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface Step {
  label: string;
  icon: string;
  color: string;
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
      className="p-6 rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm"
    >
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-6">{description}</p>

      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3 flex-shrink-0">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: delay + idx * 0.15 }}
              className="px-4 py-2 rounded-lg border border-white/10 bg-gradient-to-br from-black to-gray-900 min-w-[140px] text-center"
              style={{
                boxShadow: `0 0 20px ${step.color}30`,
              }}
            >
              <div className="text-2xl mb-1">{step.icon}</div>
              <div className="text-sm text-white">{step.label}</div>
            </motion.div>

            {idx < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: delay + idx * 0.15 + 0.15 }}
              >
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
