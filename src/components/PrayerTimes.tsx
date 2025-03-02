
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

const PrayerTimes = () => {
  const [currentPrayer, setCurrentPrayer] = useState<string>("");
  const [nextPrayer, setNextPrayer] = useState<string>("");
  const [hijriDate, setHijriDate] = useState<string>("");
  const [cityCode] = useState<string>("1501"); // Jawabaru code
  
  // Format current date as YYYY-MM-DD
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["prayerTimes", cityCode, formattedDate],
    queryFn: () => fetchPrayerTimes(cityCode, formattedDate),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  useEffect(() => {
    if (data) {
      // For demo purposes, let's set a placeholder Hijri date
      setHijriDate("29 Sya'ban, 1446");
      
      // Determine current prayer time
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const prayerTimes = [
        { name: "subuh", time: data.jadwal.subuh },
        { name: "terbit", time: data.jadwal.terbit },
        { name: "dzuhur", time: data.jadwal.dzuhur },
        { name: "ashar", time: data.jadwal.ashar },
        { name: "maghrib", time: data.jadwal.maghrib },
        { name: "isya", time: data.jadwal.isya },
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
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse w-8 h-8 border-2 border-t-primary rounded-full animate-spin"></div>
        <p className="ml-2">Loading prayer times...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-500">
        <p>Failed to load prayer times</p>
      </div>
    );
  }

  const currentTimeDisplay = (() => {
    let time = "";
    let name = "";
    
    if (currentPrayer === "subuh") {
      time = data.jadwal.subuh;
      name = "Subuh";
    } else if (currentPrayer === "terbit") {
      time = data.jadwal.terbit;
      name = "Terbit";
    } else if (currentPrayer === "dzuhur") {
      time = data.jadwal.dzuhur;
      name = "Zuhur";
    } else if (currentPrayer === "ashar") {
      time = data.jadwal.ashar;
      name = "Ashar";
    } else if (currentPrayer === "maghrib") {
      time = data.jadwal.maghrib;
      name = "Maghrib";
    } else if (currentPrayer === "isya") {
      time = data.jadwal.isya;
      name = "Isya";
    }
    
    return { time, name };
  })();

  const prayerTimes: PrayerTime[] = [
    { 
      name: "Subuh", 
      time: data.jadwal.subuh, 
      icon: <Moon className="h-6 w-6 text-gray-500" />,
      isCurrent: currentPrayer === "subuh"
    },
    { 
      name: "Terbit", 
      time: data.jadwal.terbit, 
      icon: <Sunrise className="h-6 w-6 text-gray-500" />,
      isCurrent: currentPrayer === "terbit"
    },
    { 
      name: "Zuhur", 
      time: data.jadwal.dzuhur, 
      icon: <Sun className="h-6 w-6 text-gray-500" />,
      isCurrent: currentPrayer === "dzuhur"
    },
    { 
      name: "Ashar", 
      time: data.jadwal.ashar, 
      icon: <Sun className="h-6 w-6 text-gray-500" />,
      isCurrent: currentPrayer === "ashar"
    },
    { 
      name: "Maghrib", 
      time: data.jadwal.maghrib, 
      icon: <Sunset className="h-6 w-6 text-gray-500" />,
      isCurrent: currentPrayer === "maghrib"
    },
    { 
      name: "Isya", 
      time: data.jadwal.isya, 
      icon: <Moon className="h-6 w-6 text-gray-500" />,
      isCurrent: currentPrayer === "isya"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
      <div className="bg-[#4a5b89] p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl text-gray-200">{currentTimeDisplay.name}</h3>
            <p className="text-6xl font-bold tracking-wider">
              {currentTimeDisplay.time.split(":").join(".")}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-semibold">{data.lokasi}</h3>
            <p className="text-gray-200">{hijriDate}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-2 mt-8">
          {prayerTimes.map((prayer) => (
            <div 
              key={prayer.name}
              className={`p-4 rounded-lg flex flex-col items-center ${
                prayer.isCurrent ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="font-medium">{prayer.name}</p>
              {prayer.icon}
              <p className="font-bold mt-2">{prayer.time}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#4a5b89] text-center py-2 text-white border-t border-white/10">
        <p className="text-sm">Sajda</p>
      </div>
    </div>
  );
};

export default PrayerTimes;
