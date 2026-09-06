import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Layout from '@/components/shared/Layout';

const H = { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800 };
const serif = { fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 };

interface TeamMember {
  name: string;
  title: string;
  subtitle: string;
  img: string;
  bio: string[];
}

const TEAM_MEMBERS: Record<string, TeamMember> = {
  'rev-julian-kyula': {
    name: 'Rev. Julian Kyula',
    title: 'Founder & Overseer',
    subtitle: 'Bishop · Entrepreneur · Visionary',
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
    subtitle: 'Pastor · Teacher · Leader',
    img: '/pastors/pst-zino-portrait.jpg',
    bio: [
      'Pst. Ekelemu Ewomazino serves faithfully as Senior Pastor of Ruach Tabernacle, leading with a mandate to Raise Kingdom Champions.',
      'He carries a passion for empowering men and women who are intentional about pursuing their divine purpose in every sphere of influence — whether in ministry or the marketplace.',
      'RUACH is an acronym for Rhema United Assemblies of Christ. Under his leadership, Ruach Tabernacle has grown into a thriving congregation of 3,000+ across three Sunday services.',
    ],
  },
  'pst-mule': {
    name: 'Pst. Emmanuel Mule',
    title: 'Elder · Worship Leader · Discipleship Mentor',
    subtitle: 'Elder · Worship Leader · Discipleship Mentor',
    img: '/pastors/pst-mule.jpeg',
    bio: [
      'Pastor Emmanuel Mule serves faithfully at Ruach Tabernacle, contributing to both spiritual governance and ministry excellence. As a member of the Elders\' Court, he provides wisdom, counsel, and spiritual oversight in alignment with the vision of the house.',
      'He offers pastoral oversight to key ministry departments including the Worship Team, Discipleship, Ordinance, and Media. With a deep passion for cultivating authentic encounters with God, he ensures that worship and spiritual formation remain central to the life of the church.',
      'Pastor Emmanuel also leads the True Worship Movement, serving as Director of True Worship Movement — a platform dedicated to raising worshippers who minister in spirit and in truth. Through leadership, mentorship, and training, he equips worship teams and believers to serve with excellence, reverence, and spiritual depth.',
      'Pastor Emmanuel Mule is devoted to nurturing a culture of true worship, strong discipleship, and impactful ministry both within the church and beyond.',
    ],
  },
  'maureen-wanjiku': {
    name: 'Pastor Maureen Wanjiku',
    title: 'Kingdom Woman Leader · Pastor · Director',
    subtitle: 'Kingdom Woman Leader · Pastor · Director',
    img: '/pastors/pst-maureen.jpg',
    bio: [
      'Pastor Maureen Wanjiku serves faithfully at Ruach Tabernacle, providing dedicated leadership and pastoral oversight across key ministry operations. As the Kingdom Woman Leader, she is passionate about raising strong, faith-filled women who walk confidently in their God-given purpose and influence.',
      'In her role within Pastoral Oversight, she oversees Operations, Protocol, Hospitality, and Beautification, ensuring that every ministry expression reflects excellence, order, and the heart of Christ. Her attention to detail and servant leadership style help create an environment where worship, fellowship, and spiritual growth flourish.',
      'Beyond ministry, Pastor Maureen is an accomplished entrepreneur. She is the Director of Kiheo Designs, where creativity and elegance meet purpose-driven vision. She also serves as Director of Sheii Beauty House, a brand committed to enhancing confidence and beauty with excellence.',
      'Pastor Maureen embodies grace, leadership, and innovation — seamlessly blending ministry and marketplace influence to advance the Kingdom of God.',
    ],
  },
  'pst-david-kimani': {
    name: 'Pastor David Kimani',
    title: 'R Warriors President · Elder · Pastor · Editor',
    subtitle: 'R Warriors President · Elder · Pastor · Editor',
    img: '/church-photos/silhouette.png',
    bio: [
      'Pastor David Kimani serves faithfully at Ruach Tabernacle, carrying a strong mandate for leadership, discipleship, and excellence in ministry operations.',
      'As the President of R Warriors, he provides visionary leadership to the men\'s movement, inspiring men to walk in spiritual authority, integrity, and purpose. He also serves in the Elders\' Court, contributing to spiritual governance, counsel, and oversight within the church.',
      'Pastor David provides pastoral oversight to several key departments, including Trendsetters, Hosts, Production, and Security. Through strategic leadership and mentorship, he ensures these teams operate with excellence, order, and unity in advancing the mission of the ministry.',
      'Beyond church leadership, he serves as Chief Editor at The Excellent Man Publishers, where he champions strong Christian literature and leadership resources that shape men and families for Kingdom impact.',
      'Pastor David Kimani is passionate about raising disciplined, spiritually grounded leaders who reflect Christ both in the church and in society.',
    ],
  },
  'pst-kev-owino': {
    name: 'Pastor Kevin Owino',
    title: 'JKG Resident Pastor · Author · Ministerial Trainer',
    subtitle: 'JKG Resident Pastor · Author · Ministerial Trainer',
    img: '/church-photos/silhouette.png',
    bio: [
      'Pastor Kevin Owino serves faithfully at Ruach Tabernacle as the JKG Resident Pastor, providing spiritual leadership, discipleship, and pastoral care within the congregation. With a deep passion for teaching and equipping believers, he is committed to raising mature, grounded, and purpose-driven Christians.',
      'He also provides pastoral oversight for RT Crosspoints, nurturing a vibrant community focused on growth, fellowship, and Kingdom impact. His leadership emphasizes sound doctrine, practical ministry training, and spiritual formation.',
      'In addition, Pastor Kevin serves as the Workstream Leader for the RT Volunteer Workforce and Interdenominational Church Partnership and Pastoral Collaborations. He plays a strategic role in mobilization, coordination, and training for Rhema Feast, fostering unity among churches and strengthening collaborative ministry efforts.',
      'Beyond pastoral ministry, Pastor Kevin is an accomplished author and ministerial trainer, equipping leaders and ministers with tools for effective service in the body of Christ. Through his teachings, writings, and training platforms, he continues to influence both church and marketplace leaders. For more resources visit PastorKev.org.',
      'Pastor Kevin Owino is passionate about empowering believers to live out their calling with excellence, clarity, and spiritual authority.',
    ],
  },
  'rev-beverly': {
    name: 'Rev Beverly Mwangombe',
    title: 'Care & Counselling Pastor · Psychotherapist · Mental Health Coach',
    subtitle: 'Care & Counselling Pastor · Psychotherapist · Mental Health Coach',
    img: '/church-photos/rev-bev.jpeg',
    bio: [
      'Reverend Beverly Mlale serves faithfully at Ruach Tabernacle as the Care and Counselling Pastor, providing compassionate spiritual guidance and emotional support to the congregation and wider community.',
      'She offers pastoral oversight to several key departments within the ministry: the Care and Counselling Department — offering all forms of care support, mentorship, and structured biblical counselling support; the Foodbank Department — coordinating initiatives that extend practical love and support to families in need; and the Connect Department — strengthening fellowship, integration, and member engagement within the church community.',
      'Beyond her pastoral role, Reverend Beverly is a trained Counselling Psychotherapist and Mental Health Coach, committed to promoting emotional healing, resilience, and holistic wellbeing. She is also a Natural Wellness Expert, advocating for balanced living that nurtures the spirit, soul, and body.',
      'Rev Bev is passionate about restoring hope, strengthening families, and fostering healthy, Christ-centered lives through both ministry and professional expertise.',
    ],
  },
  'elizabeth-akinyi': {
    name: 'Pastor Elizabeth Akinyi',
    title: 'Teacher · Pastor · Musician · Editor',
    subtitle: 'Teacher · Pastor · Musician · Editor',
    img: '/church-photos/pst-liz.jpeg',
    bio: [
      'Pastor Elizabeth Akinyi serves faithfully at Ruach Tabernacle, partnering closely with senior leadership in advancing the vision and mission of the ministry.',
      'She serves in the office of teacher at the Julian Kyula office, assisting Rev. Julian and Pst. Zino in teaching God\'s Word and helping to nurture a strong, Biblically grounded congregation. She also provides pastoral oversight for Ruach Tabernacle\'s Children\'s Ministry and The Bridge Youth Ministry.',
      'Pastor Elizabeth is a dynamic, high-capacity leader and a seasoned, multi-gifted musician, editor, trainer of teams, and curriculum planner. She embodies selfless commitment, consistency, empowerment, wisdom, creativity, discipline, and generational impact in the body of Christ and the community at large.',
    ],
  },
  'pst-ivlyn-mutua': {
    name: 'Pst. Ivlyn Mutua',
    title: 'Pastor · Ministry Leader',
    subtitle: 'Pastor · Ministry Leader',
    img: '/pastors/pst-ivlyn.jpeg',
    bio: [
      'Pst. Ivlyn Mutua serves faithfully at Ruach Tabernacle, contributing to the growth and development of the ministry with dedication and excellence.',
      'Her leadership is marked by a heart for people, a passion for the Word, and a commitment to raising the next generation of Kingdom Champions at Ruach Tabernacle.',
    ],
  },
};

interface Props { member: TeamMember | null; }

export default function TeamMemberPage({ member }: Props) {
  if (!member) {
    return (
      <Layout title="Not Found">
        <div className="min-h-[60vh] flex items-center justify-center bg-[#0A0C10]">
          <div className="text-center px-6">
            <h1 className="text-4xl text-white mb-6" style={H}>Not Found</h1>
            <Link href="/our-team" className="inline-flex items-center gap-2 text-[#BF0A30] font-bold text-sm uppercase tracking-wider" style={H}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Team
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={member.name} description={`${member.name} — ${member.title} at Ruach Tabernacle`}>

      {/* ══════════════════════════════════════════════
          HERO — typographic only, no background image
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0A0C10]" style={{ paddingTop: '8rem', paddingBottom: '6rem' }}>
        {/* Subtle texture */}
        <div className="absolute inset-0">
          <img
            src="/church-photos/dark-background-3.png"
            alt=""
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-[#0A0C10]/85" />
        </div>
        {/* Red orb */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#BF0A30] rounded-full pointer-events-none"
          style={{ filter: 'blur(140px)', opacity: 0.07 }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <Link
            href="/our-team"
            className="inline-flex items-center gap-2 text-[#8B95A8] hover:text-white text-xs font-bold uppercase tracking-widest mb-12 transition-colors"
            style={H}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Our Team
          </Link>
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-4" style={H}>
            {member.title}
          </p>
          <h1
            className="text-5xl md:text-6xl lg:text-[80px] text-white tracking-tight leading-[1.0] mb-6"
            style={H}
          >
            {member.name.split(' ').slice(0, -1).join(' ')}<br />
            <span style={serif}>{member.name.split(' ').slice(-1)[0]}</span>
          </h1>
          <p className="text-[#8B95A8] text-base" style={serif}>
            {member.subtitle}
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BIO — text left, portrait + card right
      ══════════════════════════════════════════════ */}
      <section className="bg-[#F5F0E8] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">

            {/* Main bio */}
            <div className="lg:col-span-2">
              <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-6" style={H}>
                About
              </p>
              <div className="space-y-5">
                {member.bio.map((para, i) => (
                  <p key={i} className="text-[#374151] leading-loose text-base">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Portrait */}
              <div className="rounded-3xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/church-photos/silhouette.png'; }}
                />
              </div>

              {/* Quick info */}
              <div className="rounded-2xl bg-[#000] p-6">
                <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-2" style={H}>
                  Role at Ruach
                </p>
                <p className="text-white text-sm leading-relaxed" style={H}>{member.title}</p>
                <div className="mt-5 pt-5 border-t border-white/10 flex flex-col gap-3">
                  <Link
                    href="/our-team"
                    className="inline-flex items-center gap-1.5 text-[#8B95A8] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                    style={H}
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to Team
                  </Link>
                  <Link
                    href="/new-here"
                    className="flex items-center justify-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
                    style={H}
                  >
                    Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════ */}
      <section className="bg-[#BF0A30] py-14 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-3xl md:text-4xl text-white mb-4" style={H}>
            See you on<br /><span style={serif}>Sunday.</span>
          </h2>
          <p className="text-red-100 mb-8">
            We&apos;d love to have you join us at Ruach Tabernacle this Sunday.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/new-here"
              className="inline-flex items-center gap-2 bg-white text-[#BF0A30] hover:bg-red-50 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
              style={H}
            >
              Plan a Visit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/our-team"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all"
              style={H}
            >
              Meet the Team <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
