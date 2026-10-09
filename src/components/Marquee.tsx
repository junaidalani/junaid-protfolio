import { Star } from 'lucide-react';

const items = ['Data Analysis', 'AI Prompts', 'Python', 'Data Visualization', 'Machine Learning', 'Problem Solving', 'Attention to Detail', 'Under Pressure'];

export default function Marquee() {
  const list = [...items, ...items, ...items];
  return (
    <section className="relative py-8 border-y border-line bg-ink-2/70 backdrop-blur-sm overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {list.map((item, i) => (
          <div key={i} className="flex items-center gap-6 px-6">
            <span className="font-display italic text-4xl md:text-5xl text-cream">{item}</span>
            <Star size={20} className="text-acid fill-acid" />
          </div>
        ))}
      </div>
    </section>
  );
}
