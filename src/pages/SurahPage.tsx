import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { MenuNavigation } from "@/components/MenuNavigation";
import { ChevronUp, Info, X } from "lucide-react";
import { Link } from "react-router-dom";
import '@fontsource/poppins';

// Updated interfaces to match the equran.id API structure
interface SurahInfo {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: {
    [key: string]: string;
  };
}

interface SurahVerse {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: {
    [key: string]: string;
  };
}

interface SurahResponse {
  code: number;
  message: string;
  data: SurahInfo & {
    ayat: SurahVerse[];
    suratSelanjutnya?: {
      nomor: number;
      nama: string;
      namaLatin: string;
      jumlahAyat: number;
    };
    suratSebelumnya?: {
      nomor: number;
      nama: string;
      namaLatin: string;
      jumlahAyat: number;
    } | false;
  };
}

// Fetch all surahs
const fetchAllSurahs = async () => {
  const allSurahs = [];
  // Fetch all 114 surahs
  for (let i = 1; i <= 114; i++) {
    try {
      const response = await fetch(`https://equran.id/api/v2/surat/${i}`);
      if (response.ok) {
        const data = await response.json() as SurahResponse;
        allSurahs.push(data.data);
      }
    } catch (error) {
      console.error(`Error fetching surah ${i}:`, error);
    }
  }
  return allSurahs;
};

// Fetch a specific surah with verses
const fetchSurahWithVerses = async (surahNumber: string) => {
  const response = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch surah ${surahNumber}`);
  }
  const data = await response.json() as SurahResponse;
  return data.data;
};

const SurahPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState<string>("1"); // Default to Al-Fatihah
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingVerse, setPlayingVerse] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [surahDetail, setSurahDetail] = useState<SurahInfo | null>(null);
  const [isLoadingSurahInfo, setIsLoadingSurahInfo] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<string>("01"); // Default reciter
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch all surahs for the dropdown
  const { data: allSurahs, isLoading: isLoadingSurahs } = useQuery({
    queryKey: ["surahs"],
    queryFn: async () => {
      try {
        const response = await fetch("https://equran.id/api/v2/surat");
        const data = await response.json();
        return data.data as SurahInfo[];
      } catch (error) {
        console.error("Error fetching surahs:", error);
        toast.error("Failed to load surah list");
        return [];
      }
    },
  });

  // Fetch selected surah details with verses
  const { data: surahData, isLoading: isLoadingSurah, error } = useQuery({
    queryKey: ["surah", selectedSurah],
    queryFn: () => fetchSurahWithVerses(selectedSurah),
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

  // Format HTML tags in text, specifically handling <i> tags for italics
  const formatHtmlText = (text: string) => {
    if (!text) return "";
    // Replace <i> tags with styled spans for italics
    return text.replace(/<i>(.*?)<\/i>/g, (match, p1) => {
      return `<em class="italic font-medium text-primary/90">${p1}</em>`;
    });
  };

  const filteredSurahs = allSurahs?.filter((surah) =>
    surah.namaLatin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.nomor.toString().includes(searchTerm)
  );

  const handleSearch = (surahNum: string) => {
    setSelectedSurah(surahNum);
    setSearchTerm("");
    setShowDropdown(false);
    toast.success(`Loaded Surah ${surahNum}`);
  };

  const playAudio = (verseId: string, audioUrls: { [key: string]: string }) => {
    if (currentAudio) {
      currentAudio.pause();
      if (playingVerse === verseId) {
        setPlayingVerse(null);
        setCurrentAudio(null);
        return;
      }
    }
    
    const audioUrl = audioUrls[selectedReciter];
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      setCurrentAudio(audio);
      setPlayingVerse(verseId);
      
      audio.addEventListener("ended", () => {
        setPlayingVerse(null);
        setCurrentAudio(null);
      });
    } else {
      toast.error("Audio not available for this verse");
    }
  };

  const handleInfoClick = async () => {
    if (surahData) {
      setIsLoadingSurahInfo(true);
      try {
        setSurahDetail(surahData);
        setShowModal(true);
      } catch (error) {
        console.error("Error showing surah info:", error);
        toast.error("Failed to load surah information");
      } finally {
        setIsLoadingSurahInfo(false);
      }
    }
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

  const isLoading = isLoadingSurahs || isLoadingSurah;

  if (isLoading && !surahData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading surah...</p>
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
          <h2 className="text-xl font-medium text-center">Error Loading Surah</h2>
          <p className="mt-2 text-muted-foreground text-center">We couldn't load the surah. Please try again later.</p>
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

  const reciters = [
    { id: "01", name: "Abdullah Al-Juhany" },
    { id: "02", name: "Abdul Muhsin Al-Qasim" },
    { id: "03", name: "Abdurrahman as-Sudais" },
    { id: "04", name: "Ibrahim Al-Dossari" },
    { id: "05", name: "Misyari Rasyid Al-Afasi" },
  ];

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }} className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-medium mb-2">Quran</h1>
          <p className="text-muted-foreground">
            {surahData ? `${surahData.namaLatin} - ${surahData.arti}` : "Surah Al-Quran"}
          </p>
          
          <MenuNavigation activeSection="juz30" />
          
          <div className="flex justify-center space-x-4 mt-4 mb-6">
            <Link 
              to="/juz30" 
              className="px-4 py-2 rounded-md bg-card hover:bg-muted transition-colors"
            >
              JUZ 30
            </Link>
            <Link 
              to="/surah" 
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium"
            >
              Surah
            </Link>
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
                placeholder="Search for a Surah..."
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
            
            {showDropdown && allSurahs && (
              <div className="absolute z-10 w-full mt-1 bg-card shadow-sm rounded-md max-h-60 overflow-auto">
                {filteredSurahs && filteredSurahs.length > 0 ? (
                  filteredSurahs.map((surah) => (
                    <div
                      key={surah.nomor}
                      className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                      onClick={() => handleSearch(surah.nomor.toString())}
                    >
                      <span className="inline-block w-8 text-muted-foreground">{surah.nomor}.</span>
                      {surah.namaLatin}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-muted-foreground text-sm">No results found</div>
                )}
              </div>
            )}
          </div>
          
          {surahData && (
            <div className="mt-6 flex flex-col items-center space-y-4">

              
              <div className="flex items-center space-x-2">
                <label htmlFor="reciter" className="text-sm">Audio:</label>
                <select
                  id="reciter"
                  value={selectedReciter}
                  onChange={(e) => setSelectedReciter(e.target.value)}
                  className="px-2 py-1 text-sm border border-input rounded-md bg-background"
                >
                  {reciters.map(reciter => (
                    <option key={reciter.id} value={reciter.id}>
                      {reciter.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </header>

        {surahData?.ayat && surahData.ayat.length > 0 ? (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-medium">
                {surahData.namaLatin || `Surah ${selectedSurah}`}
              <button
                onClick={handleInfoClick}
                className="rounded-md hover:bg-muted transition-colors ml-2"
              >
                <Info className="w-4 h-4" />
              </button>
              </h2>
              <span className="text-xs text-muted-foreground">
              <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {surahData.tempatTurun}
              </div>
                {surahData.jumlahAyat} Ayat
              </span>
            </div>
            <div className="divide-y divide-border">
              {surahData.ayat.map((verse) => (
                <div key={verse.nomorAyat} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div className="flex-1">
                      <p className="text-right text-xl mb-3 leading-loose font-arabic">
                        {verse.teksArab}
                      </p>
                      <p className="text-muted-foreground mb-2 italic text-sm">
                        {verse.teksLatin}
                      </p>
                      <p className="text-foreground text-sm">
                        {verse.teksIndonesia}
                      </p>
                    </div>
                    <div className="mt-3 md:mt-0 md:ml-4 flex items-center">
                      <button
                        onClick={() => playAudio(verse.nomorAyat.toString(), verse.audio)}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={playingVerse === verse.nomorAyat.toString() ? "Pause audio" : "Play audio"}
                      >
                        {playingVerse === verse.nomorAyat.toString() ? (
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
                        {verse.nomorAyat}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm p-6 text-center">
            <p className="text-muted-foreground">Please select a Surah to view its verses</p>
          </div>
        )}

        {/* Surah Info Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div 
              ref={modalRef}
              className="bg-card rounded-lg shadow-lg max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
            >
              {isLoadingSurahInfo ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-t-primary rounded-full animate-spin mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading surah information...</p>
                </div>
              ) : surahDetail && (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-medium">{surahDetail.namaLatin}</h3>
                      <p className="text-muted-foreground text-sm">{surahDetail.arti}</p>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-1 rounded-full hover:bg-muted transition-colors"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Surah Number</h4>
                        <p className="text-sm">{surahDetail.nomor}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Revealed in</h4>
                        <p className="text-sm">{surahDetail.tempatTurun}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Number of Verses</h4>
                        <p className="text-sm">{surahDetail.jumlahAyat}</p>
                      </div>
                    </div>
                    
                    {surahDetail.audioFull && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Full Audio</h4>
                        <audio controls className="w-full mt-1">
                          <source src={surahDetail.audioFull[selectedReciter]} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: formatHtmlText(surahDetail.deskripsi) }} />
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

export default SurahPage;