import { motion } from 'framer-motion';

export default function SectionHeader({ number, title, kicker }: { number: string; title: string; kicker: string }) {
  return (
    <div className="mb-16 md:mb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="flex items-baseline gap-6 mb-4"
      >
        <span className="font-mono text-xs text-acid tracking-[0.3em]">{number}</span>
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted">{kicker}</span>
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.9] text-cream"
      >
        {title}
      </motion.h2>
    </div>
  );
}
