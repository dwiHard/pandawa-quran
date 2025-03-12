import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { MenuNavigation } from "@/components/MenuNavigation";
import { ChevronUp } from "lucide-react";
import '@fontsource/poppins';

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

const fetchQuranVerses = async (juzNumber: number) => {
  const response = await fetch(`https://api.myquran.com/v2/quran/ayat/juz/${juzNumber}`);
  if (!response.ok) {
    throw new Error("Failed to fetch Quran verses");
  }
  const data = await response.json();
  return data.data as QuranVerse[];
};

const Juz30 = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [juzNumber, setJuzNumber] = useState(1);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingVerse, setPlayingVerse] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["quranVerses", juzNumber],
    queryFn: () => fetchQuranVerses(juzNumber),
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading verses...</p>
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
    <div style={{ fontFamily: 'Poppins, sans-serif' }} className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-medium mb-2">Quran</h1>
          <p className="text-muted-foreground">Juz {juzNumber} - Surah and Terjemahan</p>
          
          <MenuNavigation activeSection="juz30" />
          
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
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              />
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8a4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-card shadow-sm rounded-md max-h-60 overflow-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                      onClick={() => handleSearch(option.value)}
                    >
                      {option.label}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-muted-foreground text-sm">No results found</div>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="space-y-6">
          {Object.entries(versesGroupedBySurah).map(([surahNumber, verses]) => (
            <div key={surahNumber} className="bg-card rounded-lg shadow-sm overflow-hidden">
              <div className="bg-muted px-4 py-3 border-b border-border">
                <h2 className="text-lg font-medium">Surah {surahNumber}</h2>
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

        {/* Back to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-3 shadow-lg transition-all duration-300 hover:bg-primary/90 ${
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
