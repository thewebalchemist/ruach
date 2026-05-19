import Link from 'next/link';
import Layout from '@/components/shared/Layout';

export default function NotFoundPage() {
  return (
    <Layout title="Page Not Found">
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="text-[#BF0A30] text-8xl font-extrabold mb-4">404</p>
        <h1 className="text-white text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-[#8B95A8] mb-8 max-w-sm">
          The page you are looking for does not exist or has moved.
        </p>
        <Link href="/" className="btn btn-primary">Go Home</Link>
      </div>
    </Layout>
  );
}
