import Layout from '@/components/shared/Layout';
import BibleReader from '@/components/streaming/BibleReader';

export default function BiblePage() {
  return (
    <Layout title="Bible Reader" noFooter>
      <div className="h-[calc(100vh-4rem)] overflow-hidden">
        <BibleReader />
      </div>
    </Layout>
  );
}
