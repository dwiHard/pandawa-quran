import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ChevronUp, Info, X, Search, Book, BookOpen, Volume2 } from "lucide-react";
import '@fontsource/poppins';
import { Link } from "react-router-dom";

interface QuranVerse {
  id: string;
  surah: string;
  ayah: string;
  juz: string;
  arab: string;
  latin: string;
  text: string;
  audio: string;
}

interface JuzInfo {
  juz: string;
  juzStartSurahNumber: string;
  juzEndSurahNumber: string;
  juzStartInfo: string;
  juzEndInfo: string;
  verses: number;
}

interface SurahInfo {
  number: string;
  name?: string;
  name_id: string;
  translation?: string;
  translation_id: string;
  tafsir: string;
  description?: string;
}

const fetchQuranVerses = async (juzNumber: number) => {
  const response = await fetch(`https://api.myquran.com/v2/quran/ayat/juz/${juzNumber}`);
  if (!response.ok) {
    throw new Error("Failed to fetch Quran verses");
  }
  const data = await response.json();
  return data.data as QuranVerse[];
};

// Update the fetchSurahInfo function to get data from the API
const fetchSurahInfo = async (surahNumber: string): Promise<SurahInfo> => {
  try {
    const response = await fetch(`https://api.myquran.com/v2/quran/surat/${surahNumber}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah info for surah ${surahNumber}`);
    }

    const data = await response.json();
    return data.data;
    
  } catch (error) {
    console.error(`Error fetching surah info for surah ${surahNumber}:`, error);
    // Return default info if API fails
    return {
      number: surahNumber,
      name_id: `Surah ${surahNumber}`,
      translation_id: "",
      tafsir: "",
    };
  }
};

const Juz30 = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [juzNumber, setJuzNumber] = useState(1);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingVerse, setPlayingVerse] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState<SurahInfo | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLoadingSurahInfo, setIsLoadingSurahInfo] = useState(false);
  const [surahNames, setSurahNames] = useState<Record<string, string>>({});

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["quranVerses", juzNumber],
    queryFn: () => fetchQuranVerses(juzNumber),
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const juzOptions = Array.from({ length: 30 }, (_, i) => ({
    value: i + 1,
    label: `Juz ${i + 1}`,
  }));

  const filteredOptions = juzOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (juzNum: number) => {
    setJuzNumber(juzNum);
    setSearchTerm(`Juz ${juzNum}`);
    setShowDropdown(false);
    refetch();
    toast.success(`Loaded Juz ${juzNum}`);
  };

  const playAudio = (audioUrl: string, verseId: string) => {
    if (currentAudio) {
      currentAudio.pause();
      if (playingVerse === verseId) {
        setPlayingVerse(null);
        setCurrentAudio(null);
        return;
      }
    }
    
    const audio = new Audio(audioUrl);
    audio.play();
    setCurrentAudio(audio);
    setPlayingVerse(verseId);
    
    audio.addEventListener("ended", () => {
      setPlayingVerse(null);
      setCurrentAudio(null);
    });
  };

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, [currentAudio]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInfoClick = async (surahNumber: string) => {
    setIsLoadingSurahInfo(true);
    try {
      const surahInfo = await fetchSurahInfo(surahNumber);
      setSelectedSurah(surahInfo);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching surah info:", error);
      toast.error("Failed to load surah information");
      
      // Set default info if API fails
      setSelectedSurah({
        number: surahNumber,
        name_id: `Surah ${surahNumber}`,
        translation_id: "",
        tafsir: "",
      });
      setShowModal(true);
    } finally {
      setIsLoadingSurahInfo(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  const fetchSurahNames = async () => {
    if (data) {
      const uniqueSurahNumbers = [...new Set(data.map(verse => verse.surah))];
      
      const surahInfoPromises = uniqueSurahNumbers.map(surahNumber => 
        fetchSurahInfo(surahNumber)
      );
      
      try {
        const surahInfoResults = await Promise.all(surahInfoPromises);
        const surahNamesMap: Record<string, string> = {};
        
        surahInfoResults.forEach(info => {
          if (info && info.number && info.name_id) {
            surahNamesMap[info.number] = info.name_id;
          }
        });
        
        setSurahNames(surahNamesMap);
      } catch (error) {
        console.error("Error fetching surah names:", error);
      }
    }
  };

  useEffect(() => {
    fetchSurahNames();
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card p-8 rounded-lg shadow-sm max-w-md w-full">
          <div className="text-destructive text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-center">Error Loading Verses</h2>
          <p className="mt-2 text-muted-foreground text-center">We couldn't load the Quranic verses. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const versesGroupedBySurah: Record<string, QuranVerse[]> = {};
  data?.forEach(verse => {
    if (!versesGroupedBySurah[verse.surah]) {
      versesGroupedBySurah[verse.surah] = [];
    }
    versesGroupedBySurah[verse.surah].push(verse);
  });

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }} className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 pb-24 sm:pt-24">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-medium mb-2">Quran</h1>
          <p className="text-muted-foreground">Juz {juzNumber} - Surah and Terjemahan</p>
          
          <div className="flex justify-center mt-6 mb-8">
            <div className="bg-card rounded-full p-1 shadow-sm border border-border/50 flex">
              <Link 
                to="/juz30" 
                className="px-5 py-2 rounded-full flex items-center space-x-2 bg-primary text-primary-foreground font-medium"
              >
                <BookOpen className="w-4 h-4" />
                <span>JUZ 30</span>
              </Link>
              <Link 
                to="/surah" 
                className="px-5 py-2 rounded-full flex items-center space-x-2 hover:bg-muted transition-colors"
              >
                <Book className="w-4 h-4" />
                <span>Surah</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-6 max-w-xs mx-auto relative" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for a Juz..."
                className="w-full pl-10 pr-3 py-2 border border-input rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            
            {showDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-card shadow-md rounded-lg max-h-60 overflow-auto border border-border/50">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className="px-4 py-2 hover:bg-muted cursor-pointer text-sm border-b border-border/20 last:border-0"
                      onClick={() => handleSearch(option.value)}
                    >
                      {option.label}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-muted-foreground text-sm text-center">No results found</div>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="space-y-6">
          {Object.entries(versesGroupedBySurah).map(([surahNumber, verses]) => (
            <div key={surahNumber} className="bg-card rounded-lg shadow-sm overflow-hidden">
              <div className="bg-muted px-4 py-3 border-b border-border flex items-center">
                <h2 className="text-lg font-medium">
                  {surahNames[surahNumber] || `Surah ${surahNumber}`}
                </h2>
                <button 
                  onClick={() => handleInfoClick(surahNumber)}
                  className="ml-2 p-1 rounded-full hover:bg-background/50 transition-colors"
                  aria-label="Show surah information"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-border">
                {verses.map((verse) => (
                  <div key={verse.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div className="flex-1">
                        <p className="text-right text-xl mb-3 leading-loose font-arabic">
                          {verse.arab}
                        </p>
                        <p className="text-muted-foreground mb-2 italic text-sm">
                          {verse.latin}
                        </p>
                        <p className="text-foreground text-sm">
                          {verse.text}
                        </p>
                      </div>
                      <div className="mt-3 md:mt-0 md:ml-4 flex items-center">
                        <button
                          onClick={() => playAudio(verse.audio, verse.id)}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={playingVerse === verse.id ? "Pause audio" : "Play audio"}
                        >
                          {playingVerse === verse.id ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {verse.ayah}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Surah Info Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div 
              ref={modalRef}
              className="bg-card rounded-xl shadow-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto border border-border/50"
              style={{ transform: 'translateY(0px)', opacity: 1, transition: 'all 0.3s ease' }}
            >
              {isLoadingSurahInfo ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-10 h-10 border-3 border-t-primary rounded-full animate-spin mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading surah information...</p>
                </div>
              ) : selectedSurah && (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-medium">{selectedSurah.name_id}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{selectedSurah.translation_id}</p>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2 text-primary">Surah Number</h4>
                      <p className="text-lg">{selectedSurah.number}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-3 text-primary">Tafsir</h4>
                      <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground leading-relaxed">
                        {selectedSurah.tafsir}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Back to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-20 sm:bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-3 shadow-lg transition-all duration-300 hover:bg-primary/90 ${
            showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
          }`}
          aria-label="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Juz30;
