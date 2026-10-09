import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import type { Profile } from '../App';
import { MapPin, Mail, Phone, ArrowDown } from 'lucide-react';

export default function Hero({ profile }: { profile: Profile }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const words = profile.full_name.split(' ');

  return (
    <section id="top" ref={ref} className="relative min-h-screen flex flex-col justify-between pt-24 pb-10 px-6 md:px-10 overflow-hidden">
      {/* Top-line meta */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="max-w-[1400px] w-full mx-auto flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted"
      >
        <span>Portfolio / 2026</span>
        <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse" /> Available for opportunities</span>
        <span>Manchester, UK · {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' })}</span>
      </motion.div>

      {/* Name headline */}
      <motion.div style={{ y, opacity }} className="max-w-[1400px] w-full mx-auto flex-1 flex items-center">
        <div className="w-full">
          <div className="grid md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-8">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-acid mb-6">Data / AI / Problem Solving</p>
              <h1 className="font-display leading-[0.85] tracking-tight text-cream">
                {words.map((w, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: 120, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="block text-[18vw] md:text-[13vw] lg:text-[11vw]"
                  >
                    {i === words.length - 1 ? <em className="italic text-acid">{w}</em> : w}
                  </motion.span>
                ))}
              </h1>
            </div>
            <div className="md:col-span-4 md:pb-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.9 }}
                className="space-y-5"
              >
                <p className="font-serif italic text-xl md:text-2xl text-cream-2 leading-snug">
                  {profile.title}
                </p>
                <div className="space-y-2 font-mono text-xs text-cream-2/80">
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-3 hover:text-acid transition-colors"><Mail size={14} /> {profile.email}</a>
                  <a href={`tel:${profile.phone.replace(/\s+/g, '')}`} className="flex items-center gap-3 hover:text-acid transition-colors"><Phone size={14} /> {profile.phone}</a>
                  <div className="flex items-center gap-3"><MapPin size={14} /> {profile.location}</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="max-w-[1400px] w-full mx-auto flex items-end justify-between gap-6"
      >
        <a href="#about" className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cream-2/70 hover:text-acid transition-colors group">
          <span className="w-10 h-10 rounded-full border border-cream-2/30 flex items-center justify-center group-hover:border-acid group-hover:bg-acid group-hover:text-ink transition-all">
            <ArrowDown size={14} />
          </span>
          Scroll to explore
        </a>
        <div className="hidden sm:flex items-center gap-2 relative">
          <div className="w-24 h-24 rounded-full border border-acid/40 flex items-center justify-center relative animate-slowspin">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <defs>
                <path id="circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
              </defs>
              <text className="fill-acid font-mono text-[9px] uppercase tracking-[0.25em]">
                <textPath href="#circle">Portfolio / 2026 / Junaid Alani /</textPath>
              </text>
            </svg>
            <span className="font-display italic text-2xl text-acid">Ja</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
