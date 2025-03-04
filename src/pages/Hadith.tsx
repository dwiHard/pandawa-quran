
import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuNavigation } from "@/components/MenuNavigation";
import { Toaster, toast } from "sonner";
import { Book, Search, RefreshCw } from "lucide-react";

interface HadithInfo {
  id: number;
  name: string;
  title: string;
  text: string;
  source: string;
}

interface HadithDetail {
  id: number;
  arab: string;
  indo: string;
  judul: string;
}

interface HadithSource {
  id: string;
  name: string;
  range: number;
  endpoint: string;
}

const hadithSources: HadithSource[] = [
  { id: "arbain", name: "Arbain Nawawi", range: 42, endpoint: "arbain" },
  { id: "bukhari", name: "Bukhari", range: 6638, endpoint: "bukhari" },
  { id: "muslim", name: "Muslim", range: 4930, endpoint: "muslim" },
  { id: "abu-dawud", name: "Abu Dawud", range: 4419, endpoint: "abu-dawud" },
  { id: "tirmidzi", name: "Tirmidzi", range: 3625, endpoint: "tirmidzi" },
  { id: "nasai", name: "Nasai", range: 5364, endpoint: "nasai" },
  { id: "ibnu-majah", name: "Ibnu Majah", range: 4285, endpoint: "ibnu-majah" },
  { id: "ahmad", name: "Ahmad", range: 4305, endpoint: "ahmad" },
  { id: "malik", name: "Malik", range: 1587, endpoint: "malik" },
  { id: "darimi", name: "Darimi", range: 2949, endpoint: "darimi" },
  { id: "bm", name: "Bulughul Maram", range: 1697, endpoint: "bm" },
];

const fetchHadith = async ({ collection, number }: { collection: string, number: number }) => {
  const response = await fetch(`https://api.myquran.com/v2/hadits/${collection}/${number}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch hadith number ${number} from ${collection}`);
  }
  const data = await response.json();
  return data.data as HadithDetail;
};

const fetchRandomHadith = async (collection: string) => {
  const response = await fetch(`https://api.myquran.com/v2/hadits/${collection}/acak`);
  if (!response.ok) {
    throw new Error(`Failed to fetch random hadith from ${collection}`);
  }
  const data = await response.json();
  return data.data as HadithDetail;
};

// Modified function to fetch hadiths based on collection source and its range
const fetchHadithsInfoBySource = async (source: HadithSource) => {
  const hadithTitles: Record<string, string[]> = {
    "arbain": [
      "Niat", "Islam, Iman dan Ihsan", "Rukun Islam", "Penciptaan Manusia", 
      "Perkara Baru dalam Agama", "Halal dan Haram", "Agama adalah Nasihat", 
      "Perintah Memerangi Manusia", "Perintah dan Larangan", "Makanan yang Baik",
      "Yakin dan Meninggalkan Keraguan", "Meninggalkan yang Tidak Bermanfaat", 
      "Mencintai Sesama Muslim", "Larangan Menumpahkan Darah", "Berkata Baik", 
      "Larangan Marah", "Berbuat Baik dalam Segala Hal", "Takwa kepada Allah", 
      "Pertolongan Allah", "Malu", "Istiqamah", "Jalan Menuju Surga", 
      "Bersuci dan Shalat", "Larangan Berbuat Zalim", "Sedekah", 
      "Mendamaikan Manusia", "Kebajikan dan Dosa", "Nasihat", 
      "Amal yang Mendekatkan ke Surga", "Batas-batas Allah", "Zuhud", 
      "Larangan Menimbulkan Bahaya", "Pembuktian dan Sumpah", 
      "Mengubah Kemungkaran", "Persaudaraan", "Amalan yang Bermanfaat", 
      "Berbuat Baik", "Catatan Kebaikan dan Keburukan", "Wali Allah", 
      "Toleransi Agama", "Dunia adalah Ladang Akhirat", "Mengikuti Sunnah"
    ]
  };
  
  const promises = [];
  const maxFetchCount = Math.min(20, source.range); // Limit to 20 hadiths to prevent too many requests
  
  for (let i = 1; i <= maxFetchCount; i++) {
    const title = source.id === "arbain" && i <= hadithTitles.arbain.length 
      ? hadithTitles.arbain[i-1] 
      : `Hadith ${i}`;
      
    promises.push(
      fetch(`https://api.myquran.com/v2/hadits/${source.endpoint}/${i}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch hadith ${i} from ${source.name}`);
          return res.json();
        })
        .then(data => ({
          id: i,
          name: `${source.name} No. ${i}`,
          title: title,
          text: data.data?.contents?.text || data.data?.indo || "",
          source: source.id
        }))
        .catch(err => {
          console.error(`Error fetching hadith ${i} from ${source.name}:`, err);
          return {
            id: i,
            name: `${source.name} No. ${i}`,
            title: title,
            text: "",
            source: source.id
          };
        })
    );
  }
  
  const results = await Promise.all(promises);
  return results as HadithInfo[];
};

const Hadith = () => {
  const [selectedSource, setSelectedSource] = useState("arbain");
  const [selectedHadithNumber, setSelectedHadithNumber] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentSource = hadithSources.find(s => s.id === selectedSource) || hadithSources[0];

  // Updated to fetch hadiths based on selected source only
  const { data: hadithsList, isLoading: isLoadingList, refetch: refetchHadiths } = useQuery({
    queryKey: ["hadithsList", selectedSource],
    queryFn: () => fetchHadithsInfoBySource(currentSource),
  });

  const { data: selectedHadith, isLoading: isLoadingSelected, error } = useQuery({
    queryKey: ["hadith", selectedSource, selectedHadithNumber],
    queryFn: () => selectedHadithNumber ? fetchHadith({ collection: selectedSource, number: selectedHadithNumber }) : null,
    enabled: !!selectedHadithNumber,
  });

  const { data: randomHadith, isLoading: isLoadingRandom, refetch: refetchRandomHadith } = useQuery({
    queryKey: ["randomHadith", selectedSource],
    queryFn: () => fetchRandomHadith(selectedSource),
    enabled: !selectedHadithNumber,
  });

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

  // Reset search and selected hadith when source changes
  useEffect(() => {
    setSearchTerm("");
    setSelectedHadithNumber(null);
    refetchHadiths();
  }, [selectedSource, refetchHadiths]);

  const filteredHadiths = searchTerm.trim() === ""
    ? []
    : hadithsList?.filter(hadith =>
        hadith.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hadith.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hadith.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hadith.id.toString() === searchTerm.trim()
      );

  const handleSelectHadith = (hadith: HadithInfo) => {
    setSelectedHadithNumber(hadith.id);
    setSearchTerm(`${hadith.name} - ${hadith.title}`);
    setShowDropdown(false);
    toast.success(`Loading ${hadith.name}`);
  };

  const selectHadithSource = (sourceId: string) => {
    setSelectedSource(sourceId);
    setSelectedHadithNumber(null);
    setSearchTerm("");
    refetchRandomHadith();
  };

  const handleSearchByNumber = () => {
    const numericInput = parseInt(searchTerm.trim());
    if (!isNaN(numericInput) && numericInput > 0 && numericInput <= currentSource.range) {
      setSelectedHadithNumber(numericInput);
      setShowDropdown(false);
      toast.success(`Loading ${currentSource.name} Hadith #${numericInput}`);
    } else if (!isNaN(numericInput)) {
      toast.error(`Please enter a valid number between 1 and ${currentSource.range}`);
    }
  };

  const handleRefreshRandom = () => {
    refetchRandomHadith();
    toast.success(`Loading random hadith from ${hadithSources.find(s => s.id === selectedSource)?.name}`);
  };

  const isLoading = isLoadingList || (selectedHadithNumber && isLoadingSelected) || (!selectedHadithNumber && isLoadingRandom);
  const displayHadith = selectedHadithNumber ? selectedHadith : randomHadith;

  if (isLoading && !displayHadith) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-medium mb-2">Hadith</h1>
            <p className="text-muted-foreground">Hadith Collections</p>
            
            <MenuNavigation activeSection="hadith" />
          </header>
          
          <div className="flex justify-center">
            <div className="w-12 h-12 border-2 border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if ((error && selectedHadithNumber) || (error && !selectedHadithNumber && !displayHadith)) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-medium mb-2">Hadits</h1>
            <p className="text-muted-foreground">Hadith Collections</p>
            
            <MenuNavigation activeSection="hadith" />
          </header>
          
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            <p>Failed to load hadith. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-medium mb-2">Hadits</h1>
          <p className="text-muted-foreground">Hadith Collections</p>
          
          <MenuNavigation activeSection="hadith" />
          
          <div className="mt-6 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {hadithSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => selectHadithSource(source.id)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                    selectedSource === source.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {source.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-4 max-w-sm mx-auto relative" ref={dropdownRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchByNumber();
                  }
                }}
                placeholder={`Search in ${currentSource.name} (1-${currentSource.range})...`}
                className="w-full pl-10 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              />
              <button
                onClick={() => handleSearchByNumber()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8a4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {showDropdown && searchTerm.trim() !== "" && (
              <div className="absolute z-10 w-full mt-1 bg-card shadow-sm rounded-md max-h-60 overflow-auto">
                {filteredHadiths && filteredHadiths.length > 0 ? (
                  filteredHadiths.map((hadith) => (
                    <div
                      key={`${hadith.source}-${hadith.id}`}
                      className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                      onClick={() => handleSelectHadith(hadith)}
                    >
                      <div className="font-medium">{hadith.name}</div>
                      <div className="text-xs text-muted-foreground">{hadith.title}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-muted-foreground text-sm">
                    No results found. Enter a number between 1-{currentSource.range} to load directly.
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {displayHadith ? (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium flex items-center">
                  <Book className="h-4 w-4 mr-2" />
                  {selectedHadithNumber ? (
                    `${hadithSources.find(s => s.id === selectedSource)?.name} #${selectedHadithNumber}`
                  ) : (
                    `Random ${hadithSources.find(s => s.id === selectedSource)?.name} Hadith`
                  )}
                </h2>
                {displayHadith.judul && (
                  <span className="text-sm text-muted-foreground">
                    {displayHadith.judul}
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                {!selectedHadithNumber && (
                  <button
                    onClick={handleRefreshRandom}
                    className="p-1 rounded hover:bg-muted-foreground/10"
                    title="Load another random hadith"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
                {selectedHadithNumber && (
                  <>
                    <button
                      onClick={() => setSelectedHadithNumber(prev => (prev && prev > 1) ? prev - 1 : 1)}
                      disabled={selectedHadithNumber === 1}
                      className="p-1 rounded hover:bg-muted-foreground/10 disabled:opacity-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        const source = hadithSources.find(s => s.id === selectedSource);
                        if (source && selectedHadithNumber && selectedHadithNumber < source.range) {
                          setSelectedHadithNumber(selectedHadithNumber + 1);
                        }
                      }}
                      disabled={!selectedHadithNumber || selectedHadithNumber >= (hadithSources.find(s => s.id === selectedSource)?.range || 1)}
                      className="p-1 rounded hover:bg-muted-foreground/10 disabled:opacity-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="p-4">
              <p className="text-right text-xl mb-3 leading-loose font-arabic">
                {displayHadith?.arab}
              </p>
              <p className="text-foreground text-sm mt-4">
                {displayHadith?.indo}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm p-6 text-center">
            <p className="text-muted-foreground">Loading random hadith...</p>
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-8 border-2 border-t-primary rounded-full animate-spin"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hadith;
