import { motion } from 'framer-motion';
import type { Interest } from '../App';
import SectionHeader from './SectionHeader';

export default function LangHobbies({ items }: { items: Interest[] }) {
  const languages = items.filter(i => i.category === 'Language');
  const hobbies = items.filter(i => i.category === 'Hobby');

  return (
    <section id="languages" className="relative py-32 md:py-48 px-6 md:px-10 bg-ink-2/60 backdrop-blur-sm border-y border-line">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeader number="06" kicker="Beyond Work" title="Off the clock." />

        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-mono text-xs uppercase tracking-[0.3em] text-acid mb-8"
            >
              /// Languages
            </motion.h3>
            <div className="space-y-6">
              {languages.map((l, i) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.15 }}
                  className="flex items-baseline justify-between border-b border-line pb-4"
                >
                  <span className="font-display text-5xl md:text-6xl text-cream">{l.label}</span>
                  <span className="font-serif italic text-cream-2/60">fluent</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-mono text-xs uppercase tracking-[0.3em] text-acid mb-8"
            >
              /// Hobbies
            </motion.h3>
            <div className="flex flex-wrap gap-3">
              {hobbies.map((h, i) => (
                <motion.span
                  key={h.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  className="font-display italic text-4xl md:text-5xl px-6 py-2 border border-line rounded-full hover:border-acid hover:text-acid transition-colors cursor-default"
                >
                  {h.label}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
