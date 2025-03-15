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

interface City {
  id: string;
  lokasi: string;
}

const fetchCities = async () => {
  const response = await fetch('https://api.myquran.com/v2/sholat/kota/semua');
  if (!response.ok) {
    throw new Error("Failed to fetch cities");
  }
  const data = await response.json();
  return data.data as City[];
};

const fetchPrayerTimes = async (cityCode: string, date: string) => {
  const response = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityCode}/${date}`);
  if (!response.ok) {
    throw new Error("Failed to fetch prayer times");
  }
  const data = await response.json();
  return data.data as PrayerTimesData;
};

const fetchCurrentTime = async () => {
  const response = await fetch('https://api.myquran.com/v2/tools/time');
  if (!response.ok) {
    throw new Error("Failed to fetch current time");
  }
  const data = await response.json();
  return data.data;
};

const PrayerTimes = () => {
  const [currentPrayer, setCurrentPrayer] = useState<string>("");
  const [nextPrayer, setNextPrayer] = useState<string>("");
  const [hijriDate, setHijriDate] = useState<string>("");
  const [currentTime, setCurrentTimeDisplay] = useState<string>("");
  const [cityCode, setCityCode] = useState<string>("1501");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  
  // Format current date as YYYY-MM-DD
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Fetch all cities
  const { data: cities, isLoading: isLoadingCities } = useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Fetch prayer times for selected city
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["prayerTimes", cityCode, formattedDate],
    queryFn: () => fetchPrayerTimes(cityCode, formattedDate),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: timeData, isLoading: timeLoading } = useQuery({
    queryKey: ["currentTime"],
    queryFn: fetchCurrentTime,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // 30 seconds
  });

  // Filter cities based on search term
  const filteredCities = cities?.filter(city => 
    city.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.id.includes(searchTerm)
  );

  // Handle city selection
  const handleCitySelect = (id: string, name: string) => {
    setCityCode(id);
    setSearchTerm("");
    setShowDropdown(false);
    toast.success(`Jadwal sholat untuk ${name} telah dimuat`);
    refetch();
  };

  useEffect(() => {
    if (timeData) {
      const currentHour = timeData.time.hour;
      const currentMinute = timeData.time.minute;
      setCurrentTimeDisplay(`${currentHour}:${currentMinute}`);
    }
  }, [timeData]);

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

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.city-dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-4 h-4 border border-t-primary rounded-full animate-spin"></div>
        <p className="ml-2 text-sm text-muted-foreground">Loading prayer times...</p>
      </div>
    );
  }

  if (error || !data) {
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
      icon: <Moon className="h-4 w-4 text-muted-foreground" />,
      isCurrent: currentPrayer === "subuh"
    },
    { 
      name: "Terbit", 
      time: data.jadwal.terbit, 
      icon: <Sunrise className="h-4 w-4 text-muted-foreground" />,
      isCurrent: currentPrayer === "terbit"
    },
    { 
      name: "Zuhur", 
      time: data.jadwal.dzuhur, 
      icon: <Sun className="h-4 w-4 text-muted-foreground" />,
      isCurrent: currentPrayer === "dzuhur"
    },
    { 
      name: "Ashar", 
      time: data.jadwal.ashar, 
      icon: <Sun className="h-4 w-4 text-muted-foreground" />,
      isCurrent: currentPrayer === "ashar"
    },
    { 
      name: "Maghrib", 
      time: data.jadwal.maghrib, 
      icon: <Sunset className="h-4 w-4 text-muted-foreground" />,
      isCurrent: currentPrayer === "maghrib"
    },
    { 
      name: "Isya", 
      time: data.jadwal.isya, 
      icon: <Moon className="h-4 w-4 text-muted-foreground" />,
      isCurrent: currentPrayer === "isya"
    }
  ];

  return (
    <div className="space-y-6">
      {/* City Selection Dropdown */}
      <div className="city-dropdown-container relative">
        <label htmlFor="city-search" className="block text-sm font-medium mb-1">
          Pilih Kota
        </label>
        <div className="relative">
          <input
            id="city-search"
            type="text"
            placeholder="Cari kota..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onClick={() => setShowDropdown(true)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-card shadow-sm rounded-md max-h-60 overflow-auto">
            {isLoadingCities ? (
              <div className="px-3 py-2 text-muted-foreground text-sm">Loading cities...</div>
            ) : filteredCities && filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <div
                  key={city.id}
                  className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                  onClick={() => handleCitySelect(city.id, city.lokasi)}
                >
                  {city.lokasi}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-muted-foreground text-sm">No cities found</div>
            )}
          </div>
        )}
      </div>

      {/* Prayer Times Display */}
      <div className="bg-muted p-4 text-foreground rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm text-muted-foreground">{currentTimeDisplay.name}</h3>
            <p className="text-3xl font-medium tracking-wider">
              {currentTime}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-base font-medium">{data.lokasi}</h3>
            <p className="text-sm text-muted-foreground">{hijriDate}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-6">
          {prayerTimes.map((prayer) => (
            <div 
              key={prayer.name}
              className={`p-2 rounded-md flex flex-col items-center ${
                prayer.isCurrent ? "bg-primary/10 text-primary" : "bg-card text-foreground"
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
