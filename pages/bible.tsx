import Layout from '@/components/shared/Layout';
import BibleReader from '@/components/streaming/BibleReader';

export default function BiblePage() {
  return (
    <Layout title="Bible Reader" description="Read the Bible online with Ruach Tabernacle. Choose a book and chapter and start reading." noFooter>
      <div className="h-[calc(100vh-4rem)] overflow-hidden">
        <BibleReader />
      </div>
    </Layout>
  );
}
