import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';

interface ComparisonItem {
  text: string;
}

interface BeforeAfterProps {
  before: ComparisonItem[];
  after: ComparisonItem[];
}

export function BeforeAfter({ before, after }: BeforeAfterProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Before */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="p-8 rounded-xl border border-red-900/30 bg-gradient-to-br from-red-950/20 to-black"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-red-900/30">
            <X className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Without Nervum</h3>
        </div>
        <ul className="space-y-4">
          {before.map((item, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex items-start gap-3 text-gray-300"
            >
              <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm leading-relaxed">{item.text}</span>
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
        className="p-8 rounded-xl border border-green-900/30 bg-gradient-to-br from-green-950/20 to-black"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-green-900/30">
            <Check className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">With Nervum</h3>
        </div>
        <ul className="space-y-4">
          {after.map((item, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex items-start gap-3 text-gray-300"
            >
              <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm leading-relaxed">{item.text}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
