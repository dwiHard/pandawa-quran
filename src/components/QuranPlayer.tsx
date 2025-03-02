
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Book, PlayCircle, PauseCircle } from "lucide-react";
import { toast } from "sonner";

interface QuranVerse {
  id: number;
  surah: number;
  nomor: number;
  ar: string;
  tr: string;
  idn: string;
}

interface JuzResponse {
  status: boolean;
  message: string;
  data: {
    juz: number;
    juzStartSurahNumber: number;
    juzEndSurahNumber: number;
    juzStartInfo: string;
    juzEndInfo: string;
    totalVerses: number;
    verses: QuranVerse[];
  };
}

const fetchRandomJuz = async () => {
  // Get a random juz number between 1 and 30
  const randomJuz = Math.floor(Math.random() * 30) + 1;
  const response = await fetch(`https://api.myquran.com/v2/quran/juz/${randomJuz}`);
  if (!response.ok) {
    throw new Error("Failed to fetch Quran data");
  }
  const data = await response.json();
  
  // Verify that the response contains necessary data
  if (!data.data || !data.data.verses || !data.data.verses.length) {
    throw new Error("Invalid or empty Quran data received");
  }
  
  return data as JuzResponse;
};

const QuranPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [audio] = useState(new Audio());

  const { data, isLoading, error } = useQuery({
    queryKey: ["randomQuranJuz"],
    queryFn: fetchRandomJuz,
  });

  const handlePlayPause = () => {
    if (!data || !data.data.verses.length) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      
      // We don't have direct audio URLs from this API, so this is just a placeholder
      // In a real app, you would use an actual Quran recitation API
      toast.info("Audio playback would start here in a real app");
      
      // Simulate audio playing by advancing verses every few seconds
      const interval = setInterval(() => {
        setCurrentVerseIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= data.data.verses.length) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return nextIndex;
        });
      }, 5000);

      // Clean up interval when component unmounts or audio stops
      return () => clearInterval(interval);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse w-8 h-8 border-2 border-t-[#9b87f5] rounded-full animate-spin"></div>
        <p className="ml-2">Loading Quran verses...</p>
      </div>
    );
  }

  if (error || !data || !data.data || !data.data.verses || data.data.verses.length === 0) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-500">
        <p>Failed to load Quran verses</p>
      </div>
    );
  }

  // Make sure we have a valid verse to display
  const currentVerse = data.data.verses[currentVerseIndex] || data.data.verses[0];

  // Handle invalid state - this should not happen but adding as a safeguard
  if (!currentVerse) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg text-yellow-600">
        <p>No verses available to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
      <div className="bg-[#9b87f5] text-white p-3 flex justify-between items-center">
        <div className="flex items-center">
          <Book className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Quran Player</h3>
        </div>
        <div>
          <button 
            onClick={handlePlayPause}
            className="text-white hover:text-gray-200 transition-colors"
          >
            {isPlaying ? 
              <PauseCircle className="h-8 w-8" /> : 
              <PlayCircle className="h-8 w-8" />
            }
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-sm text-gray-500 mb-2">
          Juz {data.data.juz} • Surah {currentVerse.surah} • Verse {currentVerse.nomor}
        </div>
        
        <div className="space-y-4">
          <div className="text-right font-arabic text-2xl leading-loose">
            {currentVerse.ar}
          </div>
          
          <div className="text-gray-700 italic text-sm">
            {currentVerse.tr}
          </div>
          
          <div className="text-gray-900">
            {currentVerse.idn}
          </div>
        </div>
        
        <div className="mt-4 flex justify-between text-xs text-gray-500">
          <span>Verse {currentVerseIndex + 1} of {data.data.verses.length}</span>
          <span>{data.data.juzStartInfo} - {data.data.juzEndInfo}</span>
        </div>
      </div>
    </div>
  );
};

export default QuranPlayer;
