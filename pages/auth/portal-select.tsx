import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Tv2, LayoutDashboard } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 } as const;

export default function PortalSelect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { router.push('/auth/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single();
      if (!profile || !['admin', 'pastor'].includes(profile.role)) {
        router.push('/');
        return;
      }
      setLoading(false);
    }
    check();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#BF0A30] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <img src="/brand/ruach-logo.png" alt="Ruach" className="h-10 mx-auto mb-6" />
        <h1 className="text-white text-2xl sm:text-3xl font-black" style={H}>Where to?</h1>
        <p className="text-[#8B95A8] text-sm mt-2">Choose your dashboard</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 w-full max-w-lg">
        <Link href="/control-panel"
          className="group p-8 rounded-2xl bg-[#12151C] border border-white/[0.06] hover:border-[#BF0A30]/40 transition-all text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#BF0A30]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#BF0A30]/20 transition-colors">
            <Tv2 className="w-8 h-8 text-[#BF0A30]" />
          </div>
          <h2 className="text-white font-black text-base mb-2" style={H}>Control Panel</h2>
          <p className="text-[#8B95A8] text-xs leading-relaxed">Sermons, streaming, events, church info, media management</p>
        </Link>
        <Link href="/admin"
          className="group p-8 rounded-2xl bg-[#12151C] border border-white/[0.06] hover:border-[#BF0A30]/40 transition-all text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#BF0A30]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#BF0A30]/20 transition-colors">
            <LayoutDashboard className="w-8 h-8 text-[#BF0A30]" />
          </div>
          <h2 className="text-white font-black text-base mb-2" style={H}>Admin Dashboard</h2>
          <p className="text-[#8B95A8] text-xs leading-relaxed">Members, Connect Class, Crosspoints, departments, reports</p>
        </Link>
      </div>
      <p className="text-[#8B95A8]/50 text-xs mt-8">Ruach Tabernacle Assembly</p>
    </div>
  );
}
