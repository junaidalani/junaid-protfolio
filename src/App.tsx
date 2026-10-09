import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Education from './components/Education';
import Volunteer from './components/Volunteer';
import LangHobbies from './components/LangHobbies';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import BackgroundScene from './components/BackgroundScene';
import Chatbot from './components/Chatbot';

export type Profile = {
  full_name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  summary: string;
};

export type Skill = { id: number; category: string; name: string; sort: number };
export type Experience = { id: number; role: string; company: string; period: string; details: string; sort: number };
export type Education = { id: number; qualification: string; institution: string; period: string; details: string; sort: number };
export type Volunteer = { id: number; role: string; org: string; details: string; sort: number };
export type Interest = { id: number; category: string; label: string; sort: number };

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [volunteer, setVolunteer] = useState<Volunteer[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, s, e, ed, v, i] = await Promise.all([
        supabase.from('profile').select('*').limit(1),
        supabase.from('skills').select('*').order('sort'),
        supabase.from('experience').select('*').order('sort'),
        supabase.from('education').select('*').order('sort'),
        supabase.from('volunteer').select('*').order('sort'),
        supabase.from('interests').select('*').order('sort'),
      ]);
      if (p.error) throw p.error;
      setProfile(p.data?.[0] ?? null);
      setSkills(s.data ?? []);
      setExperience(e.data ?? []);
      setEducation(ed.data ?? []);
      setVolunteer(v.data ?? []);
      setInterests(i.data ?? []);
    })().catch(err => console.error(err)).finally(() => setLoading(false));
  }, []);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted animate-pulse">Loading portfolio…</div>
      </div>
    );
  }

  return (
    <div className="grain relative min-h-screen">
      <BackgroundScene />
      <ScrollProgress />
      <Nav name={profile.full_name} />
      <main className="relative z-10">
        <Hero profile={profile} />
        <Marquee />
        <About profile={profile} />
        <Skills skills={skills} />
        <Experience items={experience} />
        <Education items={education} />
        <Volunteer items={volunteer} />
        <LangHobbies items={interests} />
        <Contact profile={profile} />
        <Footer profile={profile} />
      </main>
      <Chatbot name={profile.full_name} />
    </div>
  );
}
