
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";

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

const fetchQuranVerses = async () => {
  const response = await fetch("https://api.myquran.com/v2/quran/ayat/juz/1");
  if (!response.ok) {
    throw new Error("Failed to fetch Quran verses");
  }
  const data = await response.json();
  return data.data as QuranVerse[];
};

const Index = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["quranVerses"],
    queryFn: fetchQuranVerses,
  });

  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingVerse, setPlayingVerse] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 border-4 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading verses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-800">Error Loading Verses</h2>
          <p className="mt-2 text-gray-600 text-center">We couldn't load the Quranic verses. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Group verses by surah
  const versesGroupedBySurah: Record<string, QuranVerse[]> = {};
  data?.forEach(verse => {
    if (!versesGroupedBySurah[verse.surah]) {
      versesGroupedBySurah[verse.surah] = [];
    }
    versesGroupedBySurah[verse.surah].push(verse);
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Quranic Verses</h1>
          <p className="text-gray-600">Juz 1 - Surah and Transliteration</p>
        </header>

        <div className="space-y-8">
          {Object.entries(versesGroupedBySurah).map(([surahNumber, verses]) => (
            <div key={surahNumber} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Surah {surahNumber}</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {verses.map((verse) => (
                  <div key={verse.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div className="flex-1">
                        <p className="text-right text-2xl mb-4 leading-loose text-gray-900 font-arabic">
                          {verse.arab}
                        </p>
                        <p className="text-gray-700 mb-2 italic">
                          {verse.latin}
                        </p>
                        <p className="text-gray-600">
                          {verse.text}
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-4 flex items-center">
                        <button
                          onClick={() => playAudio(verse.audio, verse.id)}
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          aria-label={playingVerse === verse.id ? "Pause audio" : "Play audio"}
                        >
                          {playingVerse === verse.id ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <span className="ml-2 text-sm text-gray-500">
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
      </div>
    </div>
  );
};

export default Index;
