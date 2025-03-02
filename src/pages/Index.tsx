
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { Moon, Sunrise, Sunset, Sun } from "lucide-react";

interface PrayerTime {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  date: string;
}

interface PrayerScheduleResponse {
  status: boolean;
  data: {
    id: string;
    lokasi: string;
    daerah: string;
    koordinat: {
      lat: string;
      lon: string;
    };
    jadwal: PrayerTime;
  };
}

const fetchPrayerTimes = async (cityCode: string, date: string) => {
  const response = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityCode}/${date}`);
  if (!response.ok) {
    throw new Error("Failed to fetch prayer times");
  }
  const data = await response.json();
  return data as PrayerScheduleResponse;
};

// Convert Gregorian date to Hijri date (simplified conversion)
// In a real app, you would want to use a proper library for this conversion
const getHijriDate = (): string => {
  // This is just a placeholder - in a real app this would be a proper conversion
  return "29 Sya'ban, 1446";
};

const Index = () => {
  const [cityCode, setCityCode] = useState("1501"); // Default city code (Jakarta)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Today's date in YYYY-MM-DD format
  const [currentPrayer, setCurrentPrayer] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["prayerTimes", cityCode, date],
    queryFn: () => fetchPrayerTimes(cityCode, date),
  });

  // Determine which prayer time is current or next
  useEffect(() => {
    if (data) {
      const now = new Date();
      const timeStr = now.toTimeString().substr(0, 5); // HH:MM format
      const prayerTimes = {
        subuh: data.data.jadwal.subuh,
        terbit: data.data.jadwal.terbit,
        dzuhur: data.data.jadwal.dzuhur,
        ashar: data.data.jadwal.ashar,
        maghrib: data.data.jadwal.maghrib,
        isya: data.data.jadwal.isya
      };

      // Compare current time with prayer times to find the current or next prayer
      const sortedPrayers = Object.entries(prayerTimes).sort((a, b) => a[1].localeCompare(b[1]));
      
      // Find the next prayer
      const nextPrayer = sortedPrayers.find(([_, time]) => time > timeStr);
      
      if (nextPrayer) {
        setCurrentPrayer(nextPrayer[0]);
      } else {
        // If there's no next prayer today, the next is the first prayer of the next day
        setCurrentPrayer("subuh");
      }
    }
  }, [data]);

  // Get icon for each prayer time
  const getPrayerIcon = (prayerName: string, isActive: boolean = false) => {
    const className = `h-6 w-6 ${isActive ? "text-white" : "text-gray-500"}`;
    
    switch (prayerName) {
      case "subuh":
        return <Sunrise className={className} />;
      case "terbit":
        return <Sunrise className={className} />;
      case "dzuhur":
        return <Sun className={className} />;
      case "ashar":
        return <Sun className={className} />;
      case "maghrib":
        return <Sunset className={className} />;
      case "isya":
        return <Moon className={className} />;
      default:
        return <Sun className={className} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#9b87f5]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 border-4 border-t-white rounded-full animate-spin"></div>
          <p className="mt-4 text-white">Loading prayer times...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#9b87f5]">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-800">Error Loading Prayer Times</h2>
          <p className="mt-2 text-gray-600 text-center">We couldn't load the prayer times. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full bg-[#9b87f5] text-white py-2 rounded-md hover:bg-[#8a78e0] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get the current time in large format (for the main display)
  const getCurrentPrayerTime = () => {
    if (!data || !currentPrayer) return "";
    
    let time = "";
    switch (currentPrayer) {
      case "subuh":
        time = data.data.jadwal.subuh;
        break;
      case "terbit":
        time = data.data.jadwal.terbit;
        break;
      case "dzuhur":
        time = data.data.jadwal.dzuhur;
        break;
      case "ashar":
        time = data.data.jadwal.ashar;
        break;
      case "maghrib":
        time = data.data.jadwal.maghrib;
        break;
      case "isya":
        time = data.data.jadwal.isya;
        break;
      default:
        time = "";
    }
    
    // Format time to match the design (with big dots)
    if (time) {
      const [hours, minutes] = time.split(":");
      return `${hours}.${minutes}.00`;
    }
    
    return "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#9b87f5] p-4">
      <Toaster position="top-right" />
      
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8">
          {/* Header with location and Islamic date */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{currentPrayer.charAt(0).toUpperCase() + currentPrayer.slice(1)}</h1>
              <h2 className="text-6xl font-bold">{getCurrentPrayerTime()}</h2>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-semibold">{data?.data.lokasi || "Jawabaru"}</h3>
              <p className="text-gray-600 text-lg">{getHijriDate()}</p>
              <div className="flex justify-end mt-2">
                <div className="rounded-full w-10 h-10 bg-teal-500 flex items-center justify-center">
                  <div className="rounded-full w-8 h-8 border-2 border-white"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Prayer times grid */}
          <div className="grid grid-cols-6 gap-2 mt-8">
            {[
              { name: "Subuh", key: "subuh" },
              { name: "Terbit", key: "terbit" },
              { name: "Zuhur", key: "dzuhur" },
              { name: "Ashar", key: "ashar" },
              { name: "Maghrib", key: "maghrib" },
              { name: "Isya", key: "isya" }
            ].map((prayer) => {
              const isActive = currentPrayer === prayer.key;
              const prayerTime = data?.data.jadwal[prayer.key as keyof PrayerTime] || "";
              
              return (
                <div 
                  key={prayer.key}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg ${
                    isActive ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="font-medium mb-1">{prayer.name}</p>
                  <div className="my-2">
                    {getPrayerIcon(prayer.key, isActive)}
                  </div>
                  <p className="text-lg font-bold">{prayerTime}</p>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-[#9b87f5] text-white py-3 text-center">
          <p className="text-lg font-medium">Sajda</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
