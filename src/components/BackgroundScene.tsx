import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/**
 * Fixed, scroll-reactive 3D-ish background:
 *   - A deep gradient base
 *   - Four large blurred gradient orbs that parallax, rotate and scale as you scroll
 *   - A subtle grid layer that drifts on the Z axis
 * Sits behind all content (z-0). Content sections should be z-10.
 */
export default function BackgroundScene() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 0.4 });

  // Parallax translations
  const y1 = useTransform(p, [0, 1], ['0%', '-40%']);
  const y2 = useTransform(p, [0, 1], ['0%', '60%']);
  const y3 = useTransform(p, [0, 1], ['0%', '-25%']);
  const y4 = useTransform(p, [0, 1], ['0%', '35%']);

  // Rotations
  const r1 = useTransform(p, [0, 1], [0, 60]);
  const r2 = useTransform(p, [0, 1], [0, -75]);

  // Grid depth (fake Z)
  const gridScale = useTransform(p, [0, 1], [1, 1.6]);
  const gridOpacity = useTransform(p, [0, 0.5, 1], [0.25, 0.15, 0.05]);

  // Hue shift over the journey
  const hue = useTransform(p, [0, 0.5, 1], [0, 20, -15]);
  const filter = useTransform(hue, (h) => `hue-rotate(${h}deg)`);

  // Backdrop image parallax
  const bgY = useTransform(p, [0, 1], ['0%', '-15%']);
  const bgScale = useTransform(p, [0, 1], [1.05, 1.15]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, #1a1810 0%, #0F0E0C 55%), linear-gradient(180deg, #0F0E0C 0%, #0a0908 100%)',
        }}
      />

      {/* Painted backdrop image — fixed, slowly parallaxing */}
      <motion.div
        style={{
          y: bgY,
          scale: bgScale,
          backgroundImage: 'url(/backdrop.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="absolute inset-0 opacity-45 mix-blend-screen"
      />

      {/* Parallax orbs */}
      <motion.div style={{ filter }} className="absolute inset-0">
        <motion.div
          style={{ y: y1, rotate: r1 }}
          className="absolute -top-40 -left-40 w-[70vw] h-[70vw] rounded-full opacity-40 blur-3xl"
        >
          <div className="w-full h-full rounded-full" style={{ background: 'radial-gradient(circle, rgba(207,255,59,0.35) 0%, rgba(207,255,59,0) 60%)' }} />
        </motion.div>

        <motion.div
          style={{ y: y2, rotate: r2 }}
          className="absolute top-[40%] -right-40 w-[80vw] h-[80vw] rounded-full opacity-35 blur-3xl"
        >
          <div className="w-full h-full rounded-full" style={{ background: 'radial-gradient(circle, rgba(232,106,51,0.32) 0%, rgba(232,106,51,0) 60%)' }} />
        </motion.div>

        <motion.div
          style={{ y: y3 }}
          className="absolute top-[70%] left-[10%] w-[60vw] h-[60vw] rounded-full opacity-25 blur-3xl"
        >
          <div className="w-full h-full rounded-full" style={{ background: 'radial-gradient(circle, rgba(154,196,43,0.30) 0%, rgba(154,196,43,0) 60%)' }} />
        </motion.div>

        <motion.div
          style={{ y: y4 }}
          className="absolute top-[20%] left-[35%] w-[50vw] h-[50vw] rounded-full opacity-25 blur-3xl"
        >
          <div className="w-full h-full rounded-full" style={{ background: 'radial-gradient(circle, rgba(80,140,255,0.22) 0%, rgba(80,140,255,0) 60%)' }} />
        </motion.div>
      </motion.div>

      {/* Depth grid — perspective-driven, drifts as you scroll */}
      <motion.div
        style={{
          scale: gridScale,
          opacity: gridOpacity,
          backgroundImage:
            'linear-gradient(rgba(207,255,59,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(207,255,59,0.15) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%)',
          transformOrigin: '50% 40%',
        }}
        className="absolute inset-0"
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(15,14,12,0.85) 100%)',
        }}
      />
    </div>
  );
}
