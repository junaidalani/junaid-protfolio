import { motion } from 'framer-motion';
import type { Skill } from '../App';
import SectionHeader from './SectionHeader';

export default function Skills({ skills }: { skills: Skill[] }) {
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  const order = ['Technical', 'Interpersonal'];
  const cats = order.filter(c => grouped[c]);

  return (
    <section id="skills" className="relative py-32 md:py-48 px-6 md:px-10 bg-ink-2/60 backdrop-blur-sm border-y border-line">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeader number="02" kicker="Capabilities" title="What I bring." />

        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          {cats.map((cat, ci) => (
            <div key={cat}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-baseline gap-4 mb-8 border-b border-line pb-4"
              >
                <span className="font-mono text-xs text-acid">0{ci + 1}</span>
                <h3 className="font-display italic text-3xl text-cream">{cat}</h3>
              </motion.div>
              <ul className="space-y-1">
                {grouped[cat].map((s, i) => (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="group flex items-center justify-between py-4 border-b border-line/60 cursor-default"
                  >
                    <span className="font-serif text-xl md:text-2xl text-cream group-hover:text-acid group-hover:italic transition-all">
                      {s.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted tracking-widest group-hover:text-acid transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
