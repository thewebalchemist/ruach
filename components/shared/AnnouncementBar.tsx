import { X } from 'lucide-react';
import { useState } from 'react';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="relative bg-[#BF0A30] text-white text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
        <span className="text-white/90">Join us this Sunday at <span className="text-white font-bold">8AM, 10AM</span> or <span className="text-white font-bold">12:30PM</span> — Northern Bypass, next to Shell Windsor</span>
        <a
          href="https://www.google.com/maps/dir//Ruach+Tabernacle+Assembly+(A+Ministry+of+Ruach+Assemblies)+Rhema+Grounds,+Rhema+Avenue,+Off+Northern+Bypass+Rd+Nairobi+Kenya/@-1.2147391,36.8476721,16z/data=!4m8!4m7!1m0!1m5!1m1!1s0x182f3df45daed397:0xf4b86ad49e78ca05!2m2!1d36.8476721!2d-1.2147391?entry=ttu&g_ep=EgoyMDI1MTAyOC4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full transition-colors border border-white/40"
          style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
        >
          See Directions →
        </a>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
