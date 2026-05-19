import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-6">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-[#BF0A30]/15 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-[#BF0A30]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-white text-2xl font-bold mb-3">Join Ruach Connect</h1>
        <p className="text-[#8B95A8] leading-relaxed mb-6">
          To become a member of Ruach Connect, you first need to attend a{' '}
          <strong className="text-white">Connect Class</strong>. Registration is done in person
          during the class.
        </p>
        <p className="text-[#8B95A8] text-sm mb-8">
          Connect Class is a 6-week journey through our beliefs, values, and community life. It is
          the gateway to membership at Ruach Tabernacle.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/connect" className="btn btn-primary w-full">
            Learn About Connect Class
          </Link>
          <Link href="/auth/login" className="btn btn-ghost w-full">
            Already a member? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
