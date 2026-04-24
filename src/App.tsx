import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, ExternalLink, AlertCircle, Newspaper, X, Globe, MapPin, Loader2, ChevronLeft, RefreshCw, Languages, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ==========================================
// 🔑 API CONFIGURATION
// USING NEWSAPI.ORG
// ==========================================
const NEWS_API_KEY = "6af246a0593b4a0194c13a3a2f4a8dac";

// ==========================================
// TYPES & MOCK DATA
// ==========================================
interface Article {
  title: string;
  description: string;
  url: string;
  image?: string;
  urlToImage?: string; // NewsAPI uses this instead of image
  publishedAt: string;
  source: {
    name: string;
    url?: string;
  };
  category?: string; // Used for our mock filter
}

const CATEGORIES = ['General', 'Technology', 'Business', 'Sports', 'Entertainment', 'Health', 'Science'];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    'General': 'General', 'Technology': 'Technology', 'Business': 'Business', 'Sports': 'Sports',
    'Entertainment': 'Entertainment', 'Health': 'Health', 'Science': 'Science',
    'Search news...': 'Search news...', 'No news found': 'No news found', 'Clear Search': 'Clear Search',
    'Read Full Article': 'Read Full Article', 'Top Headlines in': 'Top Headlines in', 'Search results for': 'Search results for',
    'Back': 'Back', 'Source': 'Source'
  },
  bn: {
    'General': 'সাধারণ', 'Technology': 'প্রযুক্তি', 'Business': 'ব্যবসা', 'Sports': 'খেলাধুলা',
    'Entertainment': 'বিনোদন', 'Health': 'স্বাস্থ্য', 'Science': 'বিজ্ঞান',
    'Search news...': 'খবর খুঁজুন...', 'No news found': 'কোন খবর পাওয়া যায়নি', 'Clear Search': 'অনুসন্ধান মুছুন',
    'Read Full Article': 'সম্পূর্ণ খবর পড়ুন', 'Top Headlines in': 'প্রধান খবর:', 'Search results for': 'অনুসন্ধানের ফলাফল:',
    'Back': 'ফিরে যান', 'Source': 'উৎস'
  },
  hi: {
    'General': 'सामान्य', 'Technology': 'प्रौद्योगिकी', 'Business': 'व्यापार', 'Sports': 'खेल',
    'Entertainment': 'मनोरंजन', 'Health': 'स्वास्थ्य', 'Science': 'विज्ञान',
    'Search news...': 'समाचार खोजें...', 'No news found': 'कोई समाचार नहीं मिला', 'Clear Search': 'खोज मिटाएं',
    'Read Full Article': 'पूरा लेख पढ़ें', 'Top Headlines in': 'मुख्य समाचार:', 'Search results for': 'खोज परिणाम:',
    'Back': 'वापस', 'Source': 'स्रोत'
  }
};

const MOCK_DATA: Article[] = [
  {
    title: "The Future of AI: How New Models are Reshaping Industries",
    description: "Artificial intelligence continues its rapid evolution, with the latest generation of models demonstrating unprecedented capabilities in reasoning and creative problem-solving across multiple sectors.",
    url: "#",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { name: "Tech Daily", url: "#" },
    category: "Technology"
  },
  {
    title: "Global Markets See Unexpected Surge Amid New Trade Agreements",
    description: "International markets rallied today following the announcement of a comprehensive trade pact between major economic powers, boosting investor confidence worldwide.",
    url: "#",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { name: "Financial Times", url: "#" },
    category: "Business"
  },
  {
    title: "Championship Finals: Underdog Team Pulls Off Staggering Upset",
    description: "In a match that will be remembered for decades, the massive underdogs secured a definitive victory against the reigning champions in the final minutes of play.",
    url: "#",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800",
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    source: { name: "Sports Network", url: "#" },
    category: "Sports"
  },
  {
    title: "Astronomers Detect Unprecedented Signals from Distant Galaxy",
    description: "Using the latest deep-space arrays, researchers have observed a pattern of signals that challenges our current understanding of astrophysical phenomena.",
    url: "#",
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=800",
    publishedAt: new Date(Date.now() - 28800000).toISOString(),
    source: { name: "Science Weekly", url: "#" },
    category: "Science"
  },
  {
    title: "Breakthrough in Renewable Energy Storage Solutions",
    description: "Scientists have unveiled a new battery architecture that promises to make renewable energy storage significantly more efficient and accessible.",
    url: "#",
    image: "https://images.unsplash.com/photo-1509391366360-1e97d52a0889?auto=format&fit=crop&q=80&w=800",
    publishedAt: new Date(Date.now() - 43200000).toISOString(),
    source: { name: "Eco Observer", url: "#" },
    category: "Technology"
  },
  {
    title: "Major Film Festival Announces This Year's Award Winners",
    description: "The prestigious international film festival concluded last night with several independent features taking home top honors, surprising many leading critics.",
    url: "#",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    source: { name: "Entertainment Insider", url: "#" },
    category: "Entertainment"
  }
];

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) return storedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('General');
  const [region, setRegion] = useState<'India' | 'World'>('India');
  const [newsLanguage, setNewsLanguage] = useState('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Reader Modal State
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);
  const [articleContent, setArticleContent] = useState<{ title?: string, content?: string, textContent?: string } | null>(null);
  const [isReadingLoading, setIsReadingLoading] = useState(false);

  // Initialize Dark Mode based on system preference if no JS previously
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('theme')) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    }
  }, []);

  // Sync Dark Mode with Body and Local Storage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Fetch News Logic
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError('');

      // Real API Call using our local proxy
      try {
        const endpoint = searchQuery 
          ? `/api/news?query=${encodeURIComponent(searchQuery)}&tl=${newsLanguage}&page=${page}`
          : `/api/news?category=${category.toLowerCase()}&region=${region}&tl=${newsLanguage}&page=${page}`;

        const response = await fetch(endpoint);
        const data = await response.json();

        if (response.ok && data.articles) {
          // Filter out removed articles
          const validArticles = data.articles.filter((a: Article) => a.title !== '[Removed]');
          setArticles(validArticles);
        } else {
          setError(data.message || 'Failed to fetch news from API.');
          setArticles([]);
        }
      } catch (err) {
        setError("A network error occurred while reaching the local proxy.");
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [searchQuery, category, region, newsLanguage, page]);

  const triggerRefresh = () => {
    // NewsAPI developer tier restricts pagination deeply, cycling safely max 5 pages
    setPage(prev => prev >= 5 ? 1 : prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1); // Reset page on new search
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  const selectCategory = (cat: string) => {
    setCategory(cat);
    setPage(1); // Reset page on category change
    if (searchQuery) {
      clearSearch();
    }
  };

  // Region and Language resets
  const handleRegionChange = (newRegion: 'India' | 'World') => {
    setRegion(newRegion);
    setPage(1);
  };
  
  const handleLanguageChange = (lang: string) => {
    setNewsLanguage(lang);
    setPage(1);
    setIsLangMenuOpen(false);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const openArticle = async (article: Article) => {
    setReadingArticle(article);
    setArticleContent(null);
    setIsReadingLoading(true);
    
    try {
      const res = await fetch(`/api/extract?url=${encodeURIComponent(article.url)}&tl=${newsLanguage}`);
      if (res.ok) {
        const data = await res.json();
        setArticleContent(data);
      } else {
        throw new Error('Failed to extract html');
      }
    } catch (err) {
      console.error(err);
      setArticleContent({ content: null }); 
    } finally {
      setIsReadingLoading(false);
    }
  };

  const closeReader = () => {
    setReadingArticle(null);
    setArticleContent(null);
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (readingArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [readingArticle]);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => selectCategory('General')}>
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-xl text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Newspaper className="w-5 h-5 sm:w-5 sm:h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden md:block">NewsBase</h1>
          </div>

          <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-full p-1 border border-gray-200 dark:border-slate-700 shadow-sm ml-auto mr-2 sm:mr-4">
            <button 
              onClick={() => handleRegionChange('India')}
              className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-1.5 transition-all ${region === 'India' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <MapPin size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">India</span>
              <span className="sm:hidden">IN</span>
            </button>
            <button 
              onClick={() => handleRegionChange('World')}
              className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-1.5 transition-all ${region === 'World' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <Globe size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">World</span>
              <span className="sm:hidden">WLD</span>
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 relative">
            {/* Native Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center bg-gray-50 dark:bg-slate-800 rounded-full pl-2 sm:pl-3 pr-1 sm:pr-2 py-1.5 sm:py-2 border border-gray-200 dark:border-slate-700 h-8 sm:h-10 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                title="Select Language"
              >
                <Languages className="text-blue-500 w-4 h-4 sm:mr-2 shrink-0" />
                <span className="text-xs sm:text-sm font-medium mr-1 hidden sm:block">
                  {newsLanguage === 'en' ? 'English' : newsLanguage === 'bn' ? 'বাংলা' : newsLanguage === 'hi' ? 'हिंदी' : 'Language'}
                </span>
                <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
              </button>
              
              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-10 sm:top-12 mt-1 w-36 sm:w-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-[60] py-1"
                  >
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'bn', label: 'বাংলা (Bengali)' },
                      { code: 'hi', label: 'हिंदी (Hindi)' }
                    ].map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${newsLanguage === lang.code ? 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={triggerRefresh}
              className={`p-1.5 sm:p-2 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors ${loading ? 'opacity-70' : ''}`}
              aria-label="Refresh News"
              title="Refresh News"
            >
              <RefreshCw size={18} className={`sm:w-5 sm:h-5 ${loading && articles.length > 0 ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 sm:p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls: Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 justify-between items-center mb-8 px-1">
          
          {/* Categories */}
          <div className="flex items-center overflow-x-auto w-[100vw] md:w-auto -ml-4 pl-4 pr-8 md:ml-0 md:px-0 pb-2 md:pb-0 hide-scrollbar gap-2 mask-edges">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat && !searchQuery
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                }`}
              >
                {TRANSLATIONS[newsLanguage]?.[cat] || cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative w-full md:w-80 shrink-0 group">
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={TRANSLATIONS[newsLanguage]?.['Search news...'] || 'Search news...'}
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-white transition-all shadow-sm group-hover:shadow-md"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            
            <AnimatePresence>
              {searchInput && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={16} />
                </motion.button>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            {searchQuery ? (
              <span>{TRANSLATIONS[newsLanguage]?.['Search results for'] || 'Search results for'} <span className="text-blue-600 dark:text-blue-400">"{searchQuery}"</span></span>
            ) : (
              <span>{TRANSLATIONS[newsLanguage]?.['Top Headlines in'] || 'Top Headlines in'} <span className="text-blue-600 dark:text-blue-400">{TRANSLATIONS[newsLanguage]?.[category] || category} ({region === 'India' ? (newsLanguage === 'bn' ? 'ভারত' : newsLanguage === 'hi' ? 'भारत' : 'India') : (newsLanguage === 'bn' ? 'বিশ্ব' : newsLanguage === 'hi' ? 'विश्व' : 'World')})</span></span>
            )}
          </h2>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-700 dark:text-red-400 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800/50 shadow-sm">
                <div className="h-48 bg-gray-200 dark:bg-slate-700 w-full" />
                <div className="p-6">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded-full mb-4" />
                  <div className="h-6 w-full bg-gray-200 dark:bg-slate-700 rounded-md mb-2" />
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-slate-700 rounded-md mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded-md" />
                    <div className="h-4 w-5/6 bg-gray-200 dark:bg-slate-700 rounded-md" />
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded-md" />
                    <div className="h-10 w-28 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="bg-gray-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">{TRANSLATIONS[newsLanguage]?.['No news found'] || 'No news found'}</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
              We couldn't find any articles matching your current search criteria. Try using different keywords or checking another category.
            </p>
            <button 
              onClick={clearSearch}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors"
            >
              {TRANSLATIONS[newsLanguage]?.['Clear Search'] || 'Clear Search'}
            </button>
          </div>
        )}

        {/* News Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {!loading && !error && articles.map((article, index) => (
              <motion.article
                key={`${article.url}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group flex flex-col bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-slate-700">
                  <img 
                    src={article.image || article.urlToImage || `/api/image?url=${encodeURIComponent(article.url)}`} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="backdrop-blur-md bg-black/40 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      {article.source.name}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-3 tracking-wider uppercase">
                    {formatDate(article.publishedAt)}
                  </div>
                  
                  <h3 className="text-lg font-bold leading-tight mb-3 line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-grow">
                    {article.title}
                  </h3>
                  
                  {article.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 leading-relaxed">
                      {article.description}
                    </p>
                  )}
                  
                  {/* Action Footer */}
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      5 min read
                    </span>
                    <button 
                      onClick={() => openArticle(article)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-500 text-gray-900 dark:text-white hover:text-white rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                    >
                      {TRANSLATIONS[newsLanguage]?.['Read Full Article'] || 'Read Full Article'}
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

      </main>

      {/* Reader Modal */}
      <AnimatePresence>
        {readingArticle && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex-none h-16 border-b border-gray-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-10">
              <button 
                onClick={closeReader}
                className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full flex items-center transition-colors"
              >
                <ChevronLeft size={24} />
                <span className="font-semibold ml-1">{TRANSLATIONS[newsLanguage]?.['Back'] || 'Back'}</span>
              </button>
              
              <div className="flex items-center gap-4">
                <a 
                  href={readingArticle.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {TRANSLATIONS[newsLanguage]?.['Source'] || 'Source'} <ExternalLink size={14} className="ml-1" />
                </a>
              </div>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="flex-grow overflow-y-auto w-full px-4 sm:px-6 py-8">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold font-serif leading-tight mb-4">
                  {readingArticle.title}
                </h1>
                
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-8 border-b border-gray-100 dark:border-slate-800 pb-6">
                  {readingArticle.source.name && 
                    <span className="font-semibold px-2.5 py-1 bg-gray-100 dark:bg-slate-800 rounded-md">
                      {readingArticle.source.name}
                    </span>
                  }
                  <span>{formatDate(readingArticle.publishedAt)}</span>
                </div>

                {/* Display lazily loaded image in modal as well */}
                <div className="mb-10 w-full bg-gray-100 dark:bg-slate-800 rounded-2xl overflow-hidden aspect-video">
                  <img 
                    src={readingArticle.image || readingArticle.urlToImage || `/api/image?url=${encodeURIComponent(readingArticle.url)}`} 
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';
                    }}
                  />
                </div>

                {/* Content Area */}
                <div className="prose prose-lg dark:prose-invert prose-blue max-w-none text-gray-800 dark:text-gray-200">
                  {isReadingLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                      <p className="text-gray-500 font-medium">Extracting article content...</p>
                    </div>
                  ) : articleContent && articleContent.content ? (
                    <div 
                      className="article-body font-sans leading-relaxed text-lg"
                      dangerouslySetInnerHTML={{ __html: articleContent.content }}
                    />
                  ) : (
                    <div className="bg-gray-50 dark:bg-slate-800/50 p-8 rounded-2xl text-center border border-gray-200 dark:border-slate-700">
                      <p className="text-xl mb-6">{readingArticle.description}</p>
                      <p className="text-gray-500 mb-6 font-medium">
                         We couldn't extract the full text for this article automatically. Some publishers block content extraction to protect their paywalls.
                      </p>
                      <a 
                        href={readingArticle.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all shadow-md shadow-blue-500/20"
                      >
                        Read on {readingArticle.source.name} <ExternalLink size={18} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

