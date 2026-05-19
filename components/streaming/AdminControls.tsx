import { Lock, Save, Unlock } from 'lucide-react';
import { useState } from 'react';

interface AdminControlsProps {
  onStreamUrlUpdate: (url: string, isLive: boolean) => void;
  currentUrl: string | null;
  currentIsLive: boolean;
}

export default function AdminControls({
  onStreamUrlUpdate,
  currentUrl,
  currentIsLive,
}: AdminControlsProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [streamUrl, setStreamUrl] = useState(currentUrl || '');
  const [isLive, setIsLive] = useState(currentIsLive);
  const [password, setPassword] = useState('');

  const handleUnlock = () => {
    // Simple password check (in production, use proper authentication)
    if (password === 'admin123') {
      setIsUnlocked(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleSave = () => {
    onStreamUrlUpdate(streamUrl, isLive);
    alert('Stream settings updated successfully!');
  };

  if (!isUnlocked) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <Lock className="w-5 h-5 text-ruach-red" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Admin Controls
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Enter password to manage live stream settings
        </p>
        <div className="flex space-x-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ruach-red"
            onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
          />
          <button
            onClick={handleUnlock}
            className="px-6 py-3 bg-ruach-red hover:bg-ruach-red-dark text-white rounded-2xl font-medium transition-colors flex items-center space-x-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Unlock className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stream Settings
          </h3>
        </div>
        <button
          onClick={() => setIsUnlocked(false)}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-ruach-red"
        >
          Lock
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stream URL
          </label>
          <input
            type="url"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ruach-red"
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isLive"
            checked={isLive}
            onChange={(e) => setIsLive(e.target.checked)}
            className="w-5 h-5 text-ruach-red border-gray-300 rounded focus:ring-ruach-red"
          />
          <label
            htmlFor="isLive"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Service is currently live
          </label>
        </div>

        <button
          onClick={handleSave}
          className="w-full px-6 py-3 bg-ruach-red hover:bg-ruach-red-dark text-white rounded-2xl font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}