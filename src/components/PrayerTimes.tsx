import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Moon, Sun, Sunrise, Sunset, MapPin, Calendar, Clock, X } from "lucide-react";
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
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  
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
    setShowCityModal(false);
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
      <div className="flex items-center justify-center p-8">
        <div className="w-12 h-12 border-2 border-t-primary rounded-full animate-spin"></div>
        <p className="ml-4 text-lg text-muted-foreground">Loading prayer times...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-destructive/10 text-destructive p-6 rounded-lg text-center">
        <p className="text-lg font-medium mb-2">Failed to load prayer times</p>
        <p className="text-sm">Please check your connection and try again</p>
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
      icon: <Moon className="h-5 w-5 text-primary" />,
      isCurrent: currentPrayer === "subuh"
    },
    { 
      name: "Terbit", 
      time: data.jadwal.terbit, 
      icon: <Sunrise className="h-5 w-5 text-amber-500" />,
      isCurrent: currentPrayer === "terbit"
    },
    { 
      name: "Zuhur", 
      time: data.jadwal.dzuhur, 
      icon: <Sun className="h-5 w-5 text-yellow-500" />,
      isCurrent: currentPrayer === "dzuhur"
    },
    { 
      name: "Ashar", 
      time: data.jadwal.ashar, 
      icon: <Sun className="h-5 w-5 text-orange-500" />,
      isCurrent: currentPrayer === "ashar"
    },
    { 
      name: "Maghrib", 
      time: data.jadwal.maghrib, 
      icon: <Sunset className="h-5 w-5 text-red-500" />,
      isCurrent: currentPrayer === "maghrib"
    },
    { 
      name: "Isya", 
      time: data.jadwal.isya, 
      icon: <Moon className="h-5 w-5 text-indigo-500" />,
      isCurrent: currentPrayer === "isya"
    }
  ];

  return (
    <div className="space-y-8">
      {/* City Selection Button */}
      <div className="city-dropdown-container">
        <button 
          onClick={() => setShowCityModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
        >
          <MapPin className="h-4 w-4" />
          <span>{data.lokasi || "Pilih Kota"}</span>
        </button>
      </div>

      {/* Current Time and Location Display */}
      <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">{data.lokasi}</h2>
            </div>
            <div className="flex items-center space-x-2 mt-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <p>{hijriDate}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <div className="text-4xl font-bold tracking-tight text-foreground">
                {currentTime}
              </div>
            </div>
            <p className="text-sm text-primary font-medium mt-1">
              {currentTimeDisplay.name}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {prayerTimes.map((prayer) => (
            <div 
              key={prayer.name}
              className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
                prayer.isCurrent 
                  ? "bg-primary/10 border-2 border-primary/20" 
                  : "bg-card hover:bg-muted/50 border border-border"
              }`}
            >
              <div className="mb-2">{prayer.icon}</div>
              <p className={`text-sm font-medium mb-1 ${prayer.isCurrent ? "text-primary" : "text-foreground"}`}>
                {prayer.name}
              </p>
              <p className={`text-sm ${prayer.isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                {prayer.time}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Prayer Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border/50">
          <h3 className="text-lg font-medium mb-4 text-foreground">Additional Times</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Moon className="h-5 w-5 text-primary mr-3" />
                <span className="text-foreground">Imsak</span>
              </div>
              <span className="text-muted-foreground">{data.jadwal.imsak}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Sun className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-foreground">Dhuha</span>
              </div>
              <span className="text-muted-foreground">{data.jadwal.dhuha}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border/50">
          <h3 className="text-lg font-medium mb-4 text-foreground">Next Prayer</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Coming up next</p>
              <p className="text-xl font-semibold text-foreground mt-1">
                {nextPrayer.charAt(0).toUpperCase() + nextPrayer.slice(1)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Time until</p>
              <p className="text-xl font-semibold text-primary mt-1">
                {/* Calculate time difference here */}
                Soon
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* City Selection Modal */}
      {showCityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Pilih Kota</h3>
              <button
                onClick={() => setShowCityModal(false)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Cari kota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
            
            <div className="overflow-y-auto flex-1 -mx-6 px-6">
              {isLoadingCities ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-t-primary rounded-full animate-spin mr-3"></div>
                  <p>Loading cities...</p>
                </div>
              ) : filteredCities && filteredCities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredCities.map((city) => (
                    <div
                      key={city.id}
                      onClick={() => handleCitySelect(city.id, city.lokasi)}
                      className="p-3 rounded-md hover:bg-primary/10 cursor-pointer transition-colors border border-border/50 hover:border-primary/30"
                    >
                      <div className="font-medium text-foreground">{city.lokasi}</div>
                      <div className="text-xs text-muted-foreground">ID: {city.id}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No cities found matching your search" : "Type to search for a city"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrayerTimes;