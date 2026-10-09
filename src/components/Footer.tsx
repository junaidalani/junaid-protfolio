import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import type { Profile } from '../App';

export default function Footer({ profile }: { profile: Profile }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1.05]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.3, 1]);

  return (
    <footer ref={ref} className="relative overflow-hidden bg-ink/80 backdrop-blur-md border-t border-line pt-24 pb-6 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <motion.div style={{ scale, opacity }} className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-acid mb-6">The End</p>
          <h2 className="font-display leading-[0.85] text-cream text-[20vw] md:text-[14vw]">
            <span className="outline-text">Thanks for</span><br />
            <span className="italic text-acid">Visiting.</span>
          </h2>
        </motion.div>

        <div className="mt-16 pt-8 border-t border-line grid md:grid-cols-3 gap-6 items-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
          <div>© {new Date().getFullYear()} {profile.full_name}</div>
          <div className="text-center">Built with React / Framer Motion / Tailwind</div>
          <div className="md:text-right">
            <a href="#top" className="hover:text-acid transition-colors">↑ Back to top</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
