import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Layout from '@/components/shared/Layout';

const heading = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

const TEAM_MEMBERS: Record<string, {
  name: string;
  title: string;
  subtitle: string;
  img: string;
  bio: string[];
}> = {
  'rev-julian-kyula': {
    name: 'Rev. Julian Kyula',
    title: 'Founder & Overseer',
    subtitle: 'Bishop | Entrepreneur | Visionary',
    img: '/brand/rev-julian.png',
    bio: [
      'Bishop Julian Kyula is the visionary founder and overseer of Ruach Assemblies. He is both a dedicated spiritual leader and a highly successful serial entrepreneur.',
      'He founded the MODE Group, a fintech company that expanded into 26 countries, and currently chairs Beulah City Ltd, a massive housing development initiative.',
      'Originally established as The Purpose Centre Church in 2007, the ministry has grown into a global network of church plants, passionate about transforming lives by empowering individuals to live out their God-given purpose.',
      'Bishop Julian is committed to raising Kingdom Champions — men and women who are intentional about pursuing their divine purpose in every sphere of influence, whether in ministry or the marketplace.',
    ],
  },
  'pst-zino': {
    name: 'Pst. Ekelemu Ewomazino',
    title: 'Senior Pastor — Ruach Tabernacle',
    subtitle: 'Pastor | Teacher | Leader',
    img: '/pastors/pst-zino.jpg',
    bio: [
      'Pst. Ekelemu Ewomazino serves faithfully as Senior Pastor of Ruach Tabernacle, leading with a mandate to Raise Kingdom Champions.',
      'He carries a passion for empowering men and women who are intentional about pursuing their divine purpose in every sphere of influence, whether in ministry or the marketplace.',
      'Under his leadership, Ruach Tabernacle has grown into a thriving congregation with multiple services and a vibrant community life.',
    ],
  },
  'pst-mule': {
    name: 'Pastor Emmanuel Mule',
    title: 'Elder | Worship Leader | Discipleship Mentor',
    subtitle: 'Elder | Worship Leader | Discipleship Mentor',
    img: '/pastors/pst-mule.jpeg',
    bio: [
      'Pastor Emmanuel Mule serves faithfully at Ruach Tabernacle, contributing to both spiritual governance and ministry excellence. As a member of the Elders\' Court, he provides wisdom, counsel, and spiritual oversight in alignment with the vision of the house.',
      'He offers pastoral oversight to key ministry departments including the Worship Team, Discipleship, Ordinance, and Media. With a deep passion for cultivating authentic encounters with God, he ensures that teaching and spiritual formation remain central to the life of the church.',
      'Pastor Emmanuel Mule is the Director of True Worship Movement — a platform dedicated to raising worshippers who minister in spirit and in truth. Through leadership, mentorship, and training, he equips worship teams and believers to serve with excellence, reverence, and spiritual depth.',
      'Pastor Emmanuel Mule is devoted to nurturing a culture of true worship, strong discipleship, and impactful ministry both within the church and beyond.',
    ],
  },
  'pst-kev-owino': {
    name: 'Pastor Kevin Owino',
    title: 'JKG Resident Pastor | Author | Ministerial Trainer',
    subtitle: 'JKG Resident Pastor | Author | Ministerial Trainer',
    img: '/pastors/pst-ivlyn.jpeg',
    bio: [
      'Pastor Kevin Owino serves faithfully at Ruach Tabernacle as the JKG Resident Pastor, providing spiritual leadership, discipleship, and pastoral care within the congregation. With a deep passion for teaching and equipping believers, he is committed to raising mature, grounded, and purpose-driven Christians.',
      'He also provides pastoral oversight to RT Crosspoints, nurturing a vibrant community focused on growth, fellowship, and Kingdom impact. His leadership emphasizes sound doctrine, practical ministry training, and mentorship.',
      'In addition, Pastor Kevin serves as the Workstream Leader for the RT Volunteer Workforce and Interdenominational Church Partnership and Pastoral Collaborations. He plays a strategic role in mobilization, coordination, and training for Rhema Squad, fostering unity among church volunteers and strengthening collaborative ministry efforts.',
      'Beyond pastoral ministry, Pastor Kevin is an established author and ministerial trainer, equipping leaders and ministers with tools for effective service in the body of Christ. Through his teachings, writings, and training platforms, he continues to influence both church and marketplace leaders.',
    ],
  },
  'maureen-wanjiku': {
    name: 'Pastor Maureen Wanjiku',
    title: 'Kingdom Woman Leader | Pastor | Director',
    subtitle: 'Kingdom Woman Leader | Pastor | Director',
    img: '/pastors/pst-maureen.jpg',
    bio: [
      'Pastor Maureen Wanjiku serves faithfully at Ruach Tabernacle as the Kingdom Woman Leader, overseeing a movement of strong, faith-filled women who walk confidently in their God-given purpose and influence.',
      'She thrives in her role within Pastoral Oversight, she oversees Operations ensuring that every ministry expression reflects excellence, order, and the heart of Christ. She also gives attention to to detail at the heart of Connect Department.',
      'Beyond her pastoral role, Reverend Maureen is a trained Counselling Psychotherapist and Mental Health Coach, committed to promoting emotional resilience, and holistic wellbeing. She is also a Natural Wellness Expert, advocating for body care that nurtures the spirit, mind, and body.',
      'Pastor Maureen embodies grace, leadership, and innovation — seamlessly integrating ministry and marketplace influence to advance the Kingdom of God.',
    ],
  },
  'pst-david-kimani': {
    name: 'Pastor David Kimani',
    title: 'R Warriors President | Elder | Pastor | Editor',
    subtitle: 'R Warriors President | Elder | Pastor | Editor',
    img: '/church-photos/IMG_1716.jpg',
    bio: [
      'Pastor David Kimani serves faithfully at Ruach Tabernacle, carrying a strong mandate for leadership, discipleship, and excellence in ministry operations.',
      'As the President of R-Warriors, he provides visionary leadership to the men\'s ministry, inspiring men to walk in spiritual authority, integrity, and purpose. He also serves in the Elders\' Court, contributing to spiritual governance, counsel, and oversight within the ministry.',
      'Pastor David provides pastoral oversight to several key departments including the Interpretations, Hosts, Productions, and Security. Through strategy, leadership and mentorship, he ensures these teams operate with excellence, order, and unity in advancing the mission of the ministry.',
      'Beyond church leadership, he serves as Chief Editor at The Excellent Men Publishers, where he champions strong Christian literature and resources that equip families and strengthen God\'s Kingdom impact in society.',
      'Pastor David Kimani is passionate about raising disciplined, spiritually grounded leaders who reflect Christ both in the church and in society.',
    ],
  },
  'rev-beverly': {
    name: 'Rev Beverly Mwangombe',
    title: 'Care & Counselling Pastor | Psychotherapist | Mental Health Coach',
    subtitle: 'Care & Counselling Pastor | Psychotherapist | Mental Health Coach',
    img: '/church-photos/rev-bev.jpeg',
    bio: [
      'Reverend Beverly Mwangombe serves faithfully at Ruach Tabernacle as the Care and Counselling Pastor, providing compassionate spiritual guidance and emotional support to the congregation and wider community.',
      'She offers pastoral oversight to several key departments within the ministry:',
      'Care and Counselling Department — offering all forms of care support, mentoring, and structured biblical counselling support.',
      'Foodbank Department — coordinating initiatives that advance practical love and support to families in need.',
      'Connect Department — strengthening fellowship, integration, and member engagement within the church community.',
      'Beyond her pastoral role, Reverend Beverly is a trained Counselling Psychotherapist and Mental Health Coach, committed to promoting emotional resilience, and holistic wellbeing. She is also a Natural Wellness Expert, advocating for body care that nurtures the spirit, mind, and body.',
      'Rev Bev is passionate about nurturing hope, strengthening families, and fostering healthy, Christ-centered lives through both ministry and professional expertise.',
    ],
  },
  'elizabeth-akinyi': {
    name: 'Pastor Elizabeth Akinyl',
    title: 'Teacher | Pastor | Musician | Editor',
    subtitle: 'Teacher | Pastor | Musician | Editor',
    img: '/church-photos/pst-liz.jpeg',
    bio: [
      'Pastor Elizabeth Akinyl serves faithfully at Ruach Tabernacle, partnering closely with senior leadership in advancing the vision and mission of the ministry.',
      'She serves at the Julian-Kyula office in the office of teacher. In this capacity, she assists Rev. Julian and Pst. Zino in reaching God\'s Word and helping to nurture a strong, biblically-rooted congregation. She also provides pastoral oversight for Ruach Tabernacle\'s Children\'s Ministry and The Bridge Youth Ministry.',
      'Pastor Elizabeth is a dynamic high-capacity leader who is also a seasoned multi-gifted musician, trainer of teams, and curriculum planner. She embodies selfless commitment, confidence, a drive for wisdom, creativity, discipline, and generational impact in the body of Christ, and the community at large.',
    ],
  },
};

const FAQS = [
  { q: 'What are your services like?', a: 'We provide an inviting atmosphere where everyone is welcome. Our services are a little over an hour long — filled with powerful worship, practical teachings that will help grow your faith in God, and a community of people that want to do life with you.' },
  { q: 'What should I wear?', a: 'We welcome you to come as you are. Whether you prefer to dress up or dress down, we encourage you to wear modestly and decently. Come comfortable.' },
  { q: 'How is it like visiting for the first time?', a: "We are committed to making sure that your first visit is enjoyable and stress-free. We won't single you out, make you stand up, or pressure you for money. Explore at your own pace." },
  { q: 'What about my kids?', a: "We know that your children are a big priority. We aim to create a safe, fun, and engaging environment through RT Kids — with games, interactive Bible lessons, and creative crafts. All volunteers are thoroughly vetted." },
  { q: 'How can I get connected?', a: 'Getting connected is easy! Attend our Connect Class to learn everything about Ruach, or join a Crosspoint (home church) where you can connect with people in your zone and grow in your faith.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors" onClick={() => setOpen(!open)}>
        <span className="font-bold text-[#111827] text-sm" style={heading}>{q}</span>
        <ChevronDown className={`w-4 h-4 text-[#BF0A30] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 pt-1 text-[#6B7280] text-sm leading-relaxed bg-white">{a}</div>}
    </div>
  );
}

interface Props { member: typeof TEAM_MEMBERS[string] | null; }

export default function TeamMemberPage({ member }: Props) {
  if (!member) {
    return (
      <Layout title="Team Member Not Found">
        <div className="min-h-[60vh] flex items-center justify-center bg-[#0A0C10]">
          <div className="text-center px-6">
            <h1 className="text-4xl text-white mb-4" style={heading}>Not Found</h1>
            <Link href="/our-team" className="inline-flex items-center gap-2 text-[#BF0A30] font-bold text-sm uppercase tracking-wider" style={heading}>
              ← Back to Team
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={member.name} description={`${member.name} — ${member.title} at Ruach Tabernacle`}>

      {/* HERO */}
      <section className="relative min-h-[65vh] flex items-end bg-[#0A0C10] overflow-hidden">
        <div className="absolute inset-0">
          <img src={member.img} alt={member.name} className="w-full h-full object-cover object-top opacity-50"
            onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/IMG_1716.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/60 to-[#0A0C10]/10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pb-20 pt-24 w-full">
          <h1 className="text-5xl md:text-6xl text-[#BF0A30] leading-tight mb-3" style={heading}>{member.name}</h1>
          <p className="text-white/80 text-lg font-medium">{member.subtitle}</p>
        </div>
      </section>

      {/* BIO */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl text-[#111827] mb-8" style={heading}>About {member.name.split(' ').slice(-1)[0]}</h2>
              <div className="space-y-5">
                {member.bio.map((para, i) => (
                  <p key={i} className="text-[#374151] leading-relaxed">{para}</p>
                ))}
              </div>
            </div>
            <div>
              <div className="bg-[#F5F0E8] rounded-2xl p-7 sticky top-24">
                <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={heading}>Role at Ruach</p>
                <p className="text-[#111827] font-bold leading-relaxed text-sm" style={heading}>{member.title}</p>
                <div className="mt-6 border-t border-[#E8E0D0] pt-5">
                  <Link href="/our-team" className="inline-flex items-center gap-2 text-[#BF0A30] text-xs font-bold uppercase tracking-wider" style={heading}>
                    ← Back to Team
                  </Link>
                </div>
                <div className="mt-4">
                  <Link href="/new-here" className="w-full flex items-center justify-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-lg transition-all" style={heading}>
                    Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#0A0C10] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            <div>
              <h2 className="text-3xl text-white mb-3" style={heading}>FAQs</h2>
              <p className="text-[#8B95A8] text-sm">These are frequently asked questions about Ruach Tabernacle.</p>
            </div>
            <div className="lg:col-span-2 space-y-3">
              {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: Object.keys(TEAM_MEMBERS).map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const member = TEAM_MEMBERS[slug] ?? null;
  return { props: { member } };
};
