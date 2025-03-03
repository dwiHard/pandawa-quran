
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { toast } from "sonner";

interface PrayerTimesData {
  lokasi: string;
  daerah: string;
  jadwal: {
    tanggal: string;
    imsak: string;
    subuh: string;
    terbit: string;
    dhuha: string;
    dzuhur: string;
    ashar: string;
    maghrib: string;
    isya: string;
    date: string;
  };
}

interface TimeData {
  time: {
    hour: string;
    minute: string;
    second: string;
    timestamp: number;
  };
  date: {
    hijriah: {
      day: string;
      month: {
        number: number;
        en: string;
        ar: string;
      };
      year: string;
    };
    masehi: {
      day: string;
      month: {
        number: number;
        en: string;
        id: string;
      };
      year: string;
    };
  };
}

interface PrayerTime {
  name: string;
  time: string;
  icon: React.ReactNode;
  isCurrent: boolean;
}

const fetchPrayerTimes = async (cityCode: string, date: string) => {
  const response = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityCode}/${date}`);
  if (!response.ok) {
    throw new Error("Failed to fetch prayer times");
  }
  const data = await response.json();
  return data.data as PrayerTimesData;
};

const fetchCurrentTime = async () => {
  const response = await fetch("https://api.myquran.com/v2/tools/time");
  if (!response.ok) {
    throw new Error("Failed to fetch current time");
  }
  const data = await response.json();
  return data.data as TimeData;
};

const PrayerTimes = () => {
  const [currentPrayer, setCurrentPrayer] = useState<string>("");
  const [nextPrayer, setNextPrayer] = useState<string>("");
  const [hijriDate, setHijriDate] = useState<string>("");
  const [cityCode] = useState<string>("1501"); // Default code (can be made configurable)
  
  // Format current date as YYYY-MM-DD
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const { data: prayerData, isLoading: isLoadingPrayer, error: prayerError } = useQuery({
    queryKey: ["prayerTimes", cityCode, formattedDate],
    queryFn: () => fetchPrayerTimes(cityCode, formattedDate),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: timeData, isLoading: isLoadingTime, error: timeError } = useQuery({
    queryKey: ["currentTime"],
    queryFn: fetchCurrentTime,
    refetchInterval: 60000, // Refetch every minute
  });

  useEffect(() => {
    if (timeData) {
      // Format hijri date from the API
      const hijriMonth = timeData.date.hijriah.month.ar;
      const hijriDay = timeData.date.hijriah.day;
      const hijriYear = timeData.date.hijriah.year;
      setHijriDate(`${hijriDay} ${hijriMonth}, ${hijriYear}`);
    }
  }, [timeData]);

  useEffect(() => {
    if (prayerData) {
      // Determine current prayer time
      let currentTime;
      
      if (timeData) {
        // Use time from API if available
        currentTime = `${timeData.time.hour}:${timeData.time.minute}`;
      } else {
        // Fallback to device time
        const now = new Date();
        currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      }
      
      const prayerTimes = [
        { name: "subuh", time: prayerData.jadwal.subuh },
        { name: "terbit", time: prayerData.jadwal.terbit },
        { name: "dzuhur", time: prayerData.jadwal.dzuhur },
        { name: "ashar", time: prayerData.jadwal.ashar },
        { name: "maghrib", time: prayerData.jadwal.maghrib },
        { name: "isya", time: prayerData.jadwal.isya },
      ];
      
      // Sort prayer times
      prayerTimes.sort((a, b) => a.time.localeCompare(b.time));
      
      // Find current and next prayer
      let current = "";
      let next = "";
      
      for (let i = 0; i < prayerTimes.length; i++) {
        if (currentTime < prayerTimes[i].time) {
          next = prayerTimes[i].name;
          current = i > 0 ? prayerTimes[i-1].name : prayerTimes[prayerTimes.length-1].name;
          break;
        }
      }
      
      // If we've passed all prayers, the current one is the last and next is the first
      if (!next) {
        current = prayerTimes[prayerTimes.length-1].name;
        next = prayerTimes[0].name;
      }
      
      setCurrentPrayer(current);
      setNextPrayer(next);
    }
  }, [prayerData, timeData]);

  if (isLoadingPrayer || isLoadingTime) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-4 h-4 border border-t-primary rounded-full animate-spin"></div>
        <p className="ml-2 text-sm text-muted-foreground">Loading prayer times...</p>
      </div>
    );
  }

  if ((prayerError || timeError) || !prayerData) {
    return (
      <div className="bg-card p-4 rounded-lg text-muted-foreground text-sm">
        <p>Failed to load prayer times</p>
      </div>
    );
  }

  const currentTimeDisplay = (() => {
    let time = "";
    let name = "";
    
    if (currentPrayer === "subuh") {
      time = prayerData.jadwal.subuh;
      name = "Subuh";
    } else if (currentPrayer === "terbit") {
      time = prayerData.jadwal.terbit;
      name = "Terbit";
    } else if (currentPrayer === "dzuhur") {
      time = prayerData.jadwal.dzuhur;
      name = "Zuhur";
    } else if (currentPrayer === "ashar") {
      time = prayerData.jadwal.ashar;
      name = "Ashar";
    } else if (currentPrayer === "maghrib") {
      time = prayerData.jadwal.maghrib;
      name = "Maghrib";
    } else if (currentPrayer === "isya") {
      time = prayerData.jadwal.isya;
      name = "Isya";
    }
    
    return { time, name };
  })();

  const prayerTimes: PrayerTime[] = [
    { 
      name: "Subuh", 
      time: prayerData.jadwal.subuh, 
      icon: <Moon className="h-4 w-4 text-muted-foreground" />,
      isCurrent: currentPrayer === "subuh"
    },
    { 
      name: "Terbit", 
      time: prayerData.jadwal.terbit, 
      icon: <Sunrise className="h-4 w-4 text-muted-foreground" />,
      isCurrent: currentPrayer === "terbit"
    },
    { 
      name: "Zuhur", 
      time: prayerData.jadwal.dzuhur, 
      icon: <Sun className="h-4 w-4 text-muted-foreground" />,
      isCurrent: currentPrayer === "dzuhur"
    },
    { 
      name: "Ashar", 
      time: prayerData.jadwal.ashar, 
      icon: <Sun className="h-4 w-4 text-muted-foreground" />,
      isCurrent: currentPrayer === "ashar"
    },
    { 
      name: "Maghrib", 
      time: prayerData.jadwal.maghrib, 
      icon: <Sunset className="h-4 w-4 text-muted-foreground" />,
      isCurrent: currentPrayer === "maghrib"
    },
    { 
      name: "Isya", 
      time: prayerData.jadwal.isya, 
      icon: <Moon className="h-4 w-4 text-muted-foreground" />,
      isCurrent: currentPrayer === "isya"
    }
  ];

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden mt-6">
      <div className="bg-muted p-4 text-foreground">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm text-muted-foreground">{currentTimeDisplay.name}</h3>
            <p className="text-3xl font-medium tracking-wider">
              {currentTimeDisplay.time}
            </p>
            {timeData && (
              <p className="text-xs text-muted-foreground mt-1">
                Current time: {timeData.time.hour}:{timeData.time.minute}
              </p>
            )}
          </div>
          <div className="text-right">
            <h3 className="text-base font-medium">{prayerData.lokasi}</h3>
            <p className="text-sm text-muted-foreground">{hijriDate}</p>
            {timeData && (
              <p className="text-xs text-muted-foreground">
                {timeData.date.masehi.day} {timeData.date.masehi.month.id} {timeData.date.masehi.year}
              </p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-2 mt-6">
          {prayerTimes.map((prayer) => (
            <div 
              key={prayer.name}
              className={`p-2 rounded-md flex flex-col items-center ${
                prayer.isCurrent ? "bg-card-foreground text-foreground" : "bg-card text-foreground"
              }`}
            >
              <p className="text-xs font-medium">{prayer.name}</p>
              {prayer.icon}
              <p className="text-xs mt-1">{prayer.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrayerTimes;
