import { motion } from 'framer-motion';
import type { Experience } from '../App';
import SectionHeader from './SectionHeader';

export default function ExperienceSection({ items }: { items: Experience[] }) {
  return (
    <section id="experience" className="relative py-32 md:py-48 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeader number="03" kicker="Work History" title="Where I've been." />

        <div className="relative">
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-line hidden md:block" />
          <div className="space-y-2 md:space-y-0">
            {items.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="group grid md:grid-cols-2 gap-6 md:gap-16 py-10 md:py-16 border-b border-line hover:bg-ink-2 -mx-4 md:mx-0 px-4 md:px-0 rounded-lg transition-colors"
              >
                <div className={i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:order-2 md:pl-16'}>
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-acid mb-3">{item.period}</div>
                  <h3 className="font-display text-4xl md:text-5xl text-cream leading-tight group-hover:italic transition-all">{item.role}</h3>
                  <div className="font-serif italic text-lg text-muted mt-2">{item.company}</div>
                </div>
                <div className={i % 2 === 0 ? '' : 'md:order-1 md:text-right md:pr-16'}>
                  <p className="font-sans text-base md:text-lg text-cream-2/85 leading-relaxed">{item.details}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
