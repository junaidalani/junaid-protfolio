import { motion } from 'framer-motion';
import type { Education } from '../App';
import SectionHeader from './SectionHeader';
import { GraduationCap } from 'lucide-react';

export default function EducationSection({ items }: { items: Education[] }) {
  return (
    <section id="education" className="relative py-32 md:py-48 px-6 md:px-10 bg-ink-2/60 backdrop-blur-sm border-y border-line">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeader number="04" kicker="Education" title="What I studied." />

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative border border-line rounded-2xl p-8 hover:border-acid hover:bg-ink transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-full border border-line group-hover:border-acid group-hover:bg-acid group-hover:text-ink flex items-center justify-center transition-all">
                  <GraduationCap size={20} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">{item.period}</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl text-cream leading-tight mb-2 group-hover:italic transition-all">
                {item.qualification}
              </h3>
              <div className="font-serif italic text-cream-2/80 mb-4">{item.institution}</div>
              {item.details && <p className="font-sans text-sm text-muted leading-relaxed">{item.details}</p>}
              <div className="absolute top-4 right-4 font-mono text-[10px] text-line group-hover:text-acid transition-colors">
                0{i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
