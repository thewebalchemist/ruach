import Link from 'next/link';
import Layout from '@/components/shared/Layout';

export default function GivePage() {
  return (
    <Layout title="Give">
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-24">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-[#BF0A30] text-sm font-bold uppercase tracking-widest mb-3">
            Generosity
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5">
            Give to the Work of God
          </h1>
          <blockquote className="text-[#8B95A8] text-lg italic max-w-2xl mx-auto leading-relaxed">
            &ldquo;Each of you should give what you have decided in your heart to give, not
            reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
            <br />
            <cite className="not-italic text-sm text-[#4A5568] mt-2 block">2 Corinthians 9:7</cite>
          </blockquote>
        </div>

        {/* Giving methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* M-Pesa */}
          <div className="glass-card p-7">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-white text-lg font-bold mb-2">M-Pesa</h3>
            <p className="text-[#8B95A8] text-sm leading-relaxed mb-4">
              Give directly via M-Pesa. Details will be announced during Sunday service.
            </p>
            <span className="badge badge-success">Available</span>
          </div>

          {/* Bank Transfer */}
          <div className="glass-card p-7">
            <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/15 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-white text-lg font-bold mb-2">Bank Transfer</h3>
            <p className="text-[#8B95A8] text-sm leading-relaxed mb-4">
              Bank details are available at the church office. Contact us for more information.
            </p>
            <span className="badge badge-info">Contact Office</span>
          </div>

          {/* In-Person */}
          <div className="glass-card p-7">
            <div className="w-12 h-12 rounded-xl bg-[#BF0A30]/15 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#BF0A30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-white text-lg font-bold mb-2">In Person</h3>
            <p className="text-[#8B95A8] text-sm leading-relaxed mb-4">
              Give during Sunday service. Offering baskets are passed during the service.
            </p>
            <span className="badge badge-primary">Every Sunday</span>
          </div>
        </div>

        {/* Why We Give */}
        <div className="glass-brand p-8 rounded-2xl mb-12">
          <h2 className="text-white text-2xl font-bold mb-4">Why We Give</h2>
          <p className="text-[#8B95A8] leading-relaxed mb-4">
            Giving at Ruach Tabernacle is an act of worship and partnership in the mission of God.
            Your generosity directly supports Sunday services, community care programs, pastoral
            ministry, Crosspoints, R-Kids, and the operational needs of the church.
          </p>
          <p className="text-[#8B95A8] leading-relaxed">
            We are committed to transparency in how funds are used. Financial reports are available
            to members upon request through the church office.
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-white text-2xl font-bold mb-6">Common Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Is giving mandatory to attend Ruach?',
                a: 'No. Giving is a personal act of worship and is entirely voluntary. You are welcome at Ruach regardless of whether or how much you give.',
              },
              {
                q: 'How are funds used?',
                a: 'Funds support pastoral ministry, Sunday operations, community programs, Crosspoints (home churches), R-Kids, and outreach initiatives.',
              },
              {
                q: 'Can I give to a specific ministry?',
                a: 'Yes. You can designate your gift to a specific fund (e.g., R-Kids, missions, food bank). Please indicate this when giving or contact the office.',
              },
            ].map((faq) => (
              <div key={faq.q} className="glass-card p-6">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-[#8B95A8] text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-[#8B95A8] mb-4">
            Questions about giving or stewarding finances?
          </p>
          <Link href="/contact" className="btn btn-secondary">
            Contact the Office
          </Link>
        </div>
      </div>
    </Layout>
  );
}
