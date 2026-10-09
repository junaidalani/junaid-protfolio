import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Profile } from '../App';
import SectionHeader from './SectionHeader';
import { Send, Mail, Phone, MapPin } from 'lucide-react';

const CALL_API = import.meta.env.VITE_CALL_CENTER_URL as string | undefined;
const FORMBEE = import.meta.env.VITE_FORMBEE_ENDPOINT as string | undefined;

export default function Contact({ profile }: { profile: Profile }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [visitorPhone, setVisitorPhone] = useState('');
  const [callStatus, setCallStatus] = useState<'idle' | 'dialing' | 'done' | 'error'>('idle');

  const requestCall = async () => {
    if (!/^\+?[\d\s()-]{7,}$/.test(visitorPhone.trim())) {
      setCallStatus('error');
      setTimeout(() => setCallStatus('idle'), 4000);
      return;
    }
    setCallStatus('dialing');
    try {
      const res = await fetch(`${CALL_API}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_company: 'Junaid Alani',
          bot_name: 'Assistant',
          phone_number: visitorPhone.trim(),
          task: 'The visitor asked for a call from Junaid Alani portfolio site. Introduce yourself, ask how you can help, answer questions about Junaid background, and offer to take a message.',
        }),
      });
      if (!res.ok) throw new Error('failed');
      setCallStatus('done');
      setVisitorPhone('');
      setTimeout(() => setCallStatus('idle'), 6000);
    } catch {
      setCallStatus('error');
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (!form.email.trim()) e.email = 'Please enter your email';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.message.trim() || form.message.trim().length < 5) e.message = 'Please write a short message';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    try {
      const res = await fetch(FORMBEE ?? '/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="relative py-32 md:py-48 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <SectionHeader number="07" kicker="Get In Touch" title="Let's build." />

        <div className="grid md:grid-cols-5 gap-12">
          {/* Left: message form */}
          <div className="md:col-span-3">
            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted block mb-3">01 · Your Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-b border-line focus:border-acid outline-none py-3 font-display text-3xl md:text-4xl text-cream placeholder:text-line transition-colors"
                  placeholder="Ada Lovelace"
                />
                {errors.name && <p className="mt-2 font-mono text-xs text-rust">! {errors.name}</p>}
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted block mb-3">02 · Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border-b border-line focus:border-acid outline-none py-3 font-display text-3xl md:text-4xl text-cream placeholder:text-line transition-colors"
                  placeholder="you@company.com"
                />
                {errors.email && <p className="mt-2 font-mono text-xs text-rust">! {errors.email}</p>}
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted block mb-3">03 · Your Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  className="w-full bg-transparent border-b border-line focus:border-acid outline-none py-3 font-serif text-xl text-cream placeholder:text-line resize-none transition-colors"
                  placeholder="Tell me about your project or role…"
                />
                {errors.message && <p className="mt-2 font-mono text-xs text-rust">! {errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="group inline-flex items-center gap-3 bg-acid text-ink px-8 py-4 rounded-full font-mono text-sm uppercase tracking-[0.2em] hover:bg-cream disabled:opacity-50 transition-all"
              >
                {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent ✓' : 'Send message'}
                <Send size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {status === 'error' && <p className="font-mono text-xs text-rust">Something went wrong. Please email me directly.</p>}
              {status === 'sent' && <p className="font-mono text-xs text-acid">Thanks, I'll get back to you soon.</p>}
            </motion.form>
          </div>

          {/* Right: direct contact */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="md:col-span-2 md:pl-10 md:border-l md:border-line"
          >
            <p className="font-serif italic text-2xl md:text-3xl text-cream-2 mb-10 leading-snug">
              Prefer the direct route? Reach out any way that suits you.
            </p>
            <div className="space-y-6">
              <a href={`mailto:${profile.email}`} className="group block">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-2 flex items-center gap-2"><Mail size={12} /> Email</div>
                <div className="font-serif text-xl text-cream group-hover:text-acid group-hover:italic transition-all">{profile.email}</div>
              </a>
              <a href={`tel:${profile.phone.replace(/\s+/g, '')}`} className="group block">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-2 flex items-center gap-2"><Phone size={12} /> Phone</div>
                <div className="font-serif text-xl text-cream group-hover:text-acid group-hover:italic transition-all">{profile.phone}</div>
              </a>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-2 flex items-center gap-2"><MapPin size={12} /> Location</div>
                <div className="font-serif text-xl text-cream">{profile.location}</div>
              </div>
              {CALL_API && (
                <div className="pt-6 border-t border-line">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted mb-2 flex items-center gap-2"><Phone size={12} /> AI Assistant</div>
                  <p className="font-serif text-lg text-cream-2 mb-3">Want to talk it through? My AI assistant can call you.</p>
                  <div className="flex gap-3 items-end">
                    <input
                      type="tel"
                      value={visitorPhone}
                      onChange={e => setVisitorPhone(e.target.value)}
                      placeholder="+1 555 000 1234"
                      className="flex-1 bg-transparent border-b border-line focus:border-acid outline-none py-2 font-mono text-sm text-cream placeholder:text-line transition-colors"
                    />
                    <button
                      onClick={requestCall}
                      disabled={callStatus === 'dialing'}
                      className="shrink-0 bg-acid text-ink px-5 py-2 rounded-full font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-cream disabled:opacity-50 transition-all"
                    >
                      {callStatus === 'dialing' ? 'Dialing…' : callStatus === 'done' ? 'Requested ✓' : 'Call me'}
                    </button>
                  </div>
                  {callStatus === 'error' && <p className="font-mono text-xs text-rust mt-2">Enter a valid phone number with country code.</p>}
                  {callStatus === 'done' && <p className="font-mono text-xs text-acid mt-2">The assistant will ring you shortly.</p>}
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
