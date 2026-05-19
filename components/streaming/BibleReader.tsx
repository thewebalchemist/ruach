import { BookOpen, Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Verse {
  verse: number;
  text: string;
}

interface BibleData {
  reference: string;
  verses: Verse[];
  text: string;
  translation_id: string;
  translation_name: string;
}

export default function BibleReader() {
  const [selectedBook, setSelectedBook] = useState('John');
  const [selectedChapter, setSelectedChapter] = useState('3');
  const [selectedVersion, setSelectedVersion] = useState('kjv');
  const [searchQuery, setSearchQuery] = useState('');
  const [bibleContent, setBibleContent] = useState<BibleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const books = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
    'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
    '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation',
  ];

  const versions = [
    { code: 'kjv', name: 'King James Version (KJV)' },
    { code: 'web', name: 'World English Bible (WEB)' },
    { code: 'clementine', name: 'Clementine Vulgate' },
    { code: 'almeida', name: 'João Ferreira de Almeida' },
  ];

  useEffect(() => {
    loadBiblePassage();
  }, [selectedBook, selectedChapter, selectedVersion]);

  const loadBiblePassage = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://bible-api.com/${encodeURIComponent(selectedBook)}+${selectedChapter}?translation=${selectedVersion}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Bible passage');
      }

      const data = await response.json();

      if (data && data.verses) {
        setBibleContent(data);
      } else {
        throw new Error('Invalid response from Bible API');
      }
    } catch (err) {
      console.error('Error loading Bible passage:', err);
      setError('Unable to load Bible passage. Please try again.');
      setBibleContent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://bible-api.com/${encodeURIComponent(searchQuery)}?translation=${selectedVersion}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();

      if (data && data.verses) {
        setBibleContent(data);
      } else {
        throw new Error('No results found');
      }
    } catch (err) {
      console.error('Error searching Bible:', err);
      setError('No results found. Try searching like "John 3:16" or "Psalms 23"');
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousChapter = () => {
    const chapter = parseInt(selectedChapter);
    if (chapter > 1) {
      setSelectedChapter((chapter - 1).toString());
    }
  };

  const goToNextChapter = () => {
    setSelectedChapter((parseInt(selectedChapter) + 1).toString());
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-4 shadow-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder='Search Bible (e.g., "John 3:16")'
            className="flex-1 bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-400"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-[#BF0A30] hover:bg-[#9a0826] text-white rounded-[2rem] text-sm font-medium transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-lg border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Book
            </label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
            >
              {books.map((book) => (
                <option key={book} value={book}>
                  {book}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chapter
            </label>
            <input
              type="number"
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              min="1"
              className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Version
            </label>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
            >
              {versions.map((version) => (
                <option key={version.code} value={version.code}>
                  {version.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bible Content */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-lg border border-gray-200 dark:border-gray-800 min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#BF0A30] animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading passage...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={loadBiblePassage}
                className="px-6 py-3 bg-[#BF0A30] hover:bg-[#9a0826] text-white rounded-[2rem] font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : bibleContent ? (
          <>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center space-x-3 mb-4">
                <BookOpen className="w-6 h-6 text-[#BF0A30]" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bibleContent.reference}
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {bibleContent.translation_name}
              </p>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
              {bibleContent.verses.map((verse) => (
                <div key={verse.verse} className="flex space-x-4 group">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-sm font-bold text-[#BF0A30] bg-[#BF0A30] bg-opacity-10 rounded-[1rem]">
                    {verse.verse}
                  </span>
                  <p className="flex-1 text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
                    {verse.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={goToPreviousChapter}
                disabled={parseInt(selectedChapter) <= 1}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-[2rem] font-medium text-gray-900 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>←</span>
                <span>Previous</span>
              </button>
              <button
                onClick={goToNextChapter}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-[2rem] font-medium text-gray-900 dark:text-white transition-colors"
              >
                <span>Next</span>
                <span>→</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600 dark:text-gray-400">
              Select a book and chapter to begin reading
            </p>
          </div>
        )}
      </div>
    </div>
  );
}