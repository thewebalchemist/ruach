import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/shared/Layout';
import VideoPlayer from '@/components/streaming/VideoPlayer';
import NavigationTabs from '@/components/streaming/NavigationTabs';
import PastServices from '@/components/streaming/PastServices';
import ScheduleView from '@/components/streaming/ScheduleView';
import NotesEditor from '@/components/streaming/NotesEditor';
import BibleReader from '@/components/streaming/BibleReader';
import { StreamLink, TabType } from '@/types';

export default function LivePage() {
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [streamData, setStreamData] = useState<StreamLink>({
    url: '',
    isLive: false,
    updatedAt: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreamData();
  }, []);

  const fetchStreamData = async () => {
    try {
      const response = await fetch('/api/stream');
      const data = await response.json();
      setStreamData({
        url: data.url,
        isLive: data.isLive,
        updatedAt: data.updatedAt,
        defaultYoutubeUrl: data.defaultYoutubeUrl,
      });
    } catch (error) {
      console.error('Error fetching stream data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'services':
        return <PastServices />;
      case 'schedule':
        return <ScheduleView />;
      case 'notes':
        return <NotesEditor />;
      case 'bible':
        return <BibleReader />;
      default:
        return <PastServices />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#BF0A30] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading live stream...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Live Service | Ruach Online</title>
        <meta name="description" content="Watch Ruach Church live services and join us in worship." />
      </Head>

      <Layout>
        {/* Live Badge Header */}
        {streamData.isLive && (
          <div className="bg-[#BF0A30] text-white py-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span className="font-semibold">We are LIVE! Join us now.</span>
            </div>
          </div>
        )}

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="px-4 py-6 space-y-6">
            {/* Fixed Video Player */}
            <div className="sticky top-20 z-30 bg-gray-50 dark:bg-[#0a0c10] pb-4">
              <VideoPlayer streamUrl={streamData.url} isLive={streamData.isLive} />
            </div>

            {/* Tab Content */}
            <div className="pb-24">{renderContent()}</div>
          </div>

          {/* Fixed Bottom Navigation */}
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Side - Fixed Video */}
              <div className="lg:col-span-2">
                <div className="sticky top-24">
                  <VideoPlayer
                    streamUrl={streamData.url}
                    isLive={streamData.isLive}
                  />
                  
                  {/* Live Info Card */}
                  <div className="mt-6 bg-white dark:bg-[#1a1e28] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {streamData.isLive ? 'Live Now' : 'Not Currently Live'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {streamData.isLive
                        ? 'Join us for worship and the Word. Feel free to take notes and engage with the service.'
                        : 'Check the schedule below for upcoming services. You can watch past services while you wait.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 h-[calc(100vh-7rem)] flex flex-col bg-gray-50 dark:bg-[#0a0c10] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                  {/* Scrollable Content Area */}
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {renderContent()}
                  </div>

                  {/* Menu at Bottom of Sidebar */}
                  <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#12151c]">
                    <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}