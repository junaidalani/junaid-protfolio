import { motion } from 'framer-motion';
import type { Volunteer } from '../App';
import SectionHeader from './SectionHeader';
import { Heart } from 'lucide-react';

export default function VolunteerSection({ items }: { items: Volunteer[] }) {
  return (
    <section id="volunteer" className="relative py-32 md:py-48 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeader number="05" kicker="Community" title="Giving back." />

        <div className="grid md:grid-cols-2 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="group relative overflow-hidden bg-gradient-to-br from-ink-2 to-ink border border-line hover:border-rust rounded-3xl p-8 md:p-10 transition-all"
            >
              <Heart className="absolute -top-6 -right-6 w-32 h-32 text-rust/10 group-hover:text-rust/30 transition-colors" strokeWidth={0.5} />
              <div className="relative">
                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-rust mb-4">
                  <span className="w-8 h-px bg-rust" /> Volunteer
                </div>
                <h3 className="font-display text-3xl md:text-4xl text-cream leading-tight mb-2">{item.role}</h3>
                <div className="font-serif italic text-cream-2/80 mb-6">{item.org}</div>
                <p className="font-sans text-cream-2/85 leading-relaxed">{item.details}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
