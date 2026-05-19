import Layout from '@/components/shared/Layout';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

export default function PrivacyPolicyPage() {
  return (
    <Layout title="Privacy Policy — Ruach Tabernacle" description="Privacy Policy for Ruach Tabernacle Assembly.">

      <section className="relative min-h-[40vh] flex items-end bg-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/church-photos/dark-background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 pb-16 pt-28 w-full">
          <p className="text-[#BF0A30] text-xs font-bold uppercase tracking-widest mb-4" style={H}>Legal</p>
          <h1 className="text-4xl md:text-6xl text-white leading-tight" style={H}>Privacy Policy</h1>
        </div>
      </section>

      <section className="bg-[#F5F0E8] py-20">
        <div className="max-w-3xl mx-auto px-8 lg:px-16">
          <div className="prose prose-lg text-[#374151] max-w-none">
            <p className="text-sm text-[#6B7280] mb-10">Last updated: May 2026</p>

            <h2 className="text-2xl text-[#111827] mb-4" style={H}>1. Information We Collect</h2>
            <p className="mb-6 leading-relaxed">
              Ruach Tabernacle Assembly collects information you voluntarily provide to us — such as your name, email address, and phone number — when you register for events, submit prayer requests, give online, or contact us through our website.
            </p>

            <h2 className="text-2xl text-[#111827] mb-4" style={H}>2. How We Use Your Information</h2>
            <p className="mb-6 leading-relaxed">
              We use the information we collect to communicate with you about services, events, and updates from Ruach Tabernacle; to process online giving; to respond to prayer requests and inquiries; and to improve our website and ministry offerings.
            </p>

            <h2 className="text-2xl text-[#111827] mb-4" style={H}>3. Data Sharing</h2>
            <p className="mb-6 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required to provide services (e.g., payment processors for online giving) or as required by law.
            </p>

            <h2 className="text-2xl text-[#111827] mb-4" style={H}>4. Data Security</h2>
            <p className="mb-6 leading-relaxed">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
            </p>

            <h2 className="text-2xl text-[#111827] mb-4" style={H}>5. Contact Us</h2>
            <p className="mb-6 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:hello@ruachtabernacle.org" className="text-[#BF0A30] hover:underline">
                hello@ruachtabernacle.org
              </a>.
            </p>
          </div>
        </div>
      </section>

    </Layout>
  );
}
