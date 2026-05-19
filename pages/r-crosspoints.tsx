import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };
const serif = { fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic' as const };

export default function RCrosspointsPage() {
  return (
    <Layout title="R-Crosspoints — Small Groups" description="R-Crosspoints are Ruach Tabernacle's small groups — where real community, discipleship, and life happen beyond Sunday.">

      <section className="relative min-h-[70vh] flex items-end bg-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/church-photos/dark-background-2.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <img src="/church-photos/ruach2.jpg" alt="R-Crosspoints" className="absolute inset-0 w-full h-full object-cover opacity-40"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/worship1.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        <div className="spirit-orb spirit-breathe absolute w-[500px] h-[500px] bg-[#BF0A30]"
          style={{ top: '10%', right: '5%', filter: 'blur(120px)', opacity: 0.10, ['--spirit-dur' as string]: '10s' }} />
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-20 pt-32 w-full">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={H}>Small Groups</p>
          <h1 className="text-5xl md:text-7xl text-white leading-tight mb-4" style={H}>R-Crosspoints</h1>
          <p className="text-white/60 text-lg max-w-lg" style={serif}>
            Where Sunday becomes every day.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-5" style={H}>What Are Crosspoints?</p>
              <h2 className="text-4xl md:text-5xl text-[#111827] mb-6 leading-tight" style={H}>
                Community<br />
                <span style={serif}>beyond Sunday.</span>
              </h2>
              <p className="text-[#374151] leading-relaxed mb-4">
                R-Crosspoints are Ruach Tabernacle&apos;s small groups — intimate gatherings of 10–20 people meeting weekly in homes, offices, and community spaces across Nairobi.
              </p>
              <p className="text-[#374151] leading-relaxed mb-8">
                This is where real relationships are built, where the Word comes alive in everyday life, and where you are known — not just as a face in a crowd, but as a person with a name, a story, and a purpose.
              </p>
              <Link href="/r-connect" className="inline-flex items-center gap-2 bg-[#BF0A30] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-2xl hover:bg-[#9A0826] transition-colors shadow-lg shadow-[rgba(191,10,48,0.3)]" style={H}>
                Find a Crosspoint <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Bible Study', desc: 'Deep dive into the Word together — questions welcome, growth guaranteed.' },
                { label: 'Prayer', desc: 'Real prayer for real needs. Crosspoints carry each other before the throne.' },
                { label: 'Fellowship', desc: 'Life together — meals, laughter, and showing up for one another.' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl p-6 border border-[#E5E0D5] bg-white">
                  <h3 className="text-lg text-[#111827] mb-2" style={H}>{item.label}</h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
}
