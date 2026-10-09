import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const links = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Work' },
  { href: '#education', label: 'Education' },
  { href: '#contact', label: 'Contact' },
];

export default function Nav({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'backdrop-blur-md bg-ink/70 border-b border-line' : 'bg-transparent'}`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3 group">
          <span className="w-8 h-8 rounded-full bg-acid text-ink font-display italic text-lg flex items-center justify-center group-hover:rotate-12 transition-transform">{initials.toLowerCase()}</span>
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-cream-2 hidden sm:inline">{name}</span>
        </a>
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a key={l.href} href={l.href} className="px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-cream-2/70 hover:text-acid transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#contact" className="hidden md:inline-flex items-center gap-2 border border-acid text-acid px-4 py-2 rounded-full font-mono text-xs uppercase tracking-[0.2em] hover:bg-acid hover:text-ink transition-colors">
          Let's talk <span>→</span>
        </a>
        <button onClick={() => setOpen(!open)} className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5">
          <span className={`w-6 h-px bg-cream transition-transform ${open ? 'rotate-45 translate-y-1' : ''}`} />
          <span className={`w-6 h-px bg-cream transition-transform ${open ? '-rotate-45 -translate-y-0.5' : ''}`} />
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-line bg-ink/95 backdrop-blur-md">
          <div className="px-6 py-4 flex flex-col">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-3 font-mono text-sm uppercase tracking-[0.2em] text-cream-2 border-b border-line last:border-0">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.header>
  );
}
