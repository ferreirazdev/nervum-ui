import { motion } from 'motion/react';

export interface ComparisonItem {
  text: string;
  title?: string;
}

interface BeforeAfterProps {
  before: ComparisonItem[];
  after: ComparisonItem[];
}

function formatNum(n: number) {
  return String(n).padStart(2, '0');
}

export function BeforeAfter({ before, after }: BeforeAfterProps) {
  return (
    <div className="grid md:grid-cols-2 gap-12">
      {/* Before */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="p-8 rounded-lg border border-border bg-card"
      >
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <h3 className="text-destructive font-mono-landing text-sm uppercase tracking-widest">
            Without Nervum
          </h3>
        </div>
        <ul className="space-y-6">
          {before.map((item, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex items-start gap-4"
            >
              <span className="text-destructive/50 font-mono-landing mt-1 text-sm">
                {formatNum(idx + 1)}
              </span>
              <div>
                {item.title != null && (
                  <p className="font-bold text-foreground">{item.title}</p>
                )}
                <p className={`text-muted-foreground text-sm leading-relaxed ${item.title != null ? 'mt-0.5' : ''}`}>
                  {item.text}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* After */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="p-8 rounded-lg border border-primary/30 bg-card relative overflow-hidden"
      >
        <div className="absolute inset-0 landing-pixel-dots opacity-10 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <h3 className="text-primary font-mono-landing text-sm uppercase tracking-widest">
              With Nervum
            </h3>
          </div>
          <ul className="space-y-6">
            {after.map((item, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="flex items-start gap-4"
              >
                <span className="text-primary font-mono-landing mt-1 text-sm">
                  {formatNum(idx + 1)}
                </span>
                <div>
                  {item.title != null && (
                    <p className="font-bold text-foreground">{item.title}</p>
                  )}
                  <p className={`text-muted-foreground text-sm leading-relaxed ${item.title != null ? 'mt-0.5' : ''}`}>
                    {item.text}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
