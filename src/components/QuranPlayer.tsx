
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Book, PlayCircle, PauseCircle, RefreshCw } from "lucide-react";
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
  try {
    // Get a random juz number between 1 and 30
    const randomJuz = Math.floor(Math.random() * 30) + 1;
    console.log(`Fetching Juz ${randomJuz}`);
    
    const response = await fetch(`https://api.myquran.com/v2/quran/juz/${randomJuz}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Quran data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    
    // Check if the response has the expected structure
    if (!data.status || data.status === false) {
      console.error("API returned an error status:", data.message || "Unknown error");
      throw new Error(data.message || "API returned an error status");
    }
    
    // For this API, we need to fetch the verses separately for the juz
    console.log(`Fetching verses for Juz ${randomJuz}`);
    const versesResponse = await fetch(`https://api.myquran.com/v2/quran/ayat/juz/${randomJuz}`);
    
    if (!versesResponse.ok) {
      throw new Error(`Failed to fetch Quran verses: ${versesResponse.status} ${versesResponse.statusText}`);
    }
    
    const versesData = await versesResponse.json();
    console.log("Verses Response:", versesData);
    
    if (!versesData.status || !versesData.data || !Array.isArray(versesData.data) || versesData.data.length === 0) {
      throw new Error("Invalid or empty Quran verses data received");
    }
    
    // Construct a response that matches our expected JuzResponse interface
    const juzResponse: JuzResponse = {
      status: true,
      message: "Success",
      data: {
        juz: randomJuz,
        juzStartSurahNumber: parseInt(data.data.surah_id_start) || 0,
        juzEndSurahNumber: parseInt(data.data.surah_id_end) || 0,
        juzStartInfo: data.data.name_start_id || "",
        juzEndInfo: data.data.name_end_id || "",
        totalVerses: versesData.data.length,
        verses: versesData.data.map((verse: any) => ({
          id: parseInt(verse.id) || 0,
          surah: parseInt(verse.surah) || 0,
          nomor: parseInt(verse.ayah) || 0,
          ar: verse.arab || "",
          tr: verse.latin || "",
          idn: verse.text || ""
        }))
      }
    };
    
    return juzResponse;
  } catch (error) {
    console.error("Error fetching Quran data:", error);
    throw error;
  }
};

const QuranPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [audio] = useState(new Audio());
  const [retryCount, setRetryCount] = useState(0);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["randomQuranJuz", retryCount],
    queryFn: fetchRandomJuz,
    retry: 2,
    retryDelay: 1000,
  });

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (isPlaying) {
        audio.pause();
      }
    };
  }, [audio, isPlaying]);

  const handlePlayPause = () => {
    if (!data || !data.data.verses || data.data.verses.length === 0) {
      toast.error("No verses available to play");
      return;
    }

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

      // Return cleanup function
      return () => clearInterval(interval);
    }
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setCurrentVerseIndex(0);
    toast.info("Trying to load a different Juz...");
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 bg-white rounded-xl shadow-md mt-6">
        <div className="animate-pulse w-8 h-8 border-2 border-t-[#9b87f5] rounded-full animate-spin"></div>
        <p className="ml-2">Loading Quran verses...</p>
      </div>
    );
  }

  if (error || !data || !data.data || !data.data.verses || data.data.verses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
        <div className="bg-red-500 text-white p-3 flex justify-between items-center">
          <div className="flex items-center">
            <Book className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Quran Player</h3>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-red-500 mb-4">Failed to load Quran verses</p>
          <p className="text-gray-600 text-sm mb-4">
            {error instanceof Error ? error.message : "Please check your internet connection and try again."}
          </p>
          <button 
            onClick={handleRetry}
            className="flex items-center justify-center mx-auto px-4 py-2 bg-[#9b87f5] text-white rounded-md hover:bg-[#8a76e5] transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Another Juz
          </button>
        </div>
      </div>
    );
  }

  // Make sure we have a valid verse to display
  const currentVerse = data.data.verses[currentVerseIndex] || data.data.verses[0];

  // Handle invalid state - this should not happen but adding as a safeguard
  if (!currentVerse) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
        <div className="bg-[#9b87f5] text-white p-3">
          <div className="flex items-center">
            <Book className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Quran Player</h3>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-yellow-600">No verses available to display</p>
          <button 
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-[#9b87f5] text-white rounded-md hover:bg-[#8a76e5] transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2 inline" />
            Try Another Juz
          </button>
        </div>
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
        <div className="flex items-center">
          <button 
            onClick={handleRetry}
            className="text-white hover:text-gray-200 transition-colors mr-3"
            aria-label="Load different Juz"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button 
            onClick={handlePlayPause}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
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
