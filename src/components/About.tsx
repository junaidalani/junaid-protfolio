import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';
import type { Profile } from '../App';
import SectionHeader from './SectionHeader';

function Word({ progress, range, children }: { progress: MotionValue<number>; range: [number, number]; children: string }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return <motion.span style={{ opacity }} className="inline-block mr-3">{children}</motion.span>;
}

export default function About({ profile }: { profile: Profile }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const words = profile.summary.split(' ');

  return (
    <section id="about" className="relative py-32 md:py-48 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeader number="01" kicker="About" title="Who I am." />

        <div ref={ref} className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-2 hidden md:block">
            <div className="sticky top-32 font-mono text-xs uppercase tracking-[0.3em] text-muted">
              [ profile ]
            </div>
          </div>

          <div className="md:col-span-8">
            <p className="font-serif text-3xl md:text-5xl lg:text-6xl leading-[1.15] text-cream tracking-tight">
              {words.map((word, i) => {
                const start = (i / words.length) * 0.6 + 0.15;
                const end = ((i + 3) / words.length) * 0.6 + 0.15;
                return <Word key={i} progress={scrollYProgress} range={[start, end]}>{word}</Word>;
              })}
            </p>
          </div>

          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="border-l border-acid pl-4 md:sticky md:top-32"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-2">Currently</div>
              <div className="font-serif italic text-lg text-cream leading-snug">{profile.title}</div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mt-24 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-10 border-t border-line pt-12"
        >
          {[
            { n: 'BSc', l: 'Computer Science (AI)' },
            { n: '2', l: 'Languages fluent' },
            { n: '4+', l: 'Work experiences' },
            { n: '∞', l: 'Curiosity level' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="font-display text-6xl md:text-7xl text-acid leading-none">{s.n}</div>
              <div className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">{s.l}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
