import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuNavigation } from "@/components/MenuNavigation";
import { Toaster, toast } from "sonner";

interface HadithInfo {
  id: number;
  name: string;
  title: string; // Added title for better search
  text: string;  // Adding the missing text property for search
}

interface HadithDetail {
  id: number;
  contents: {
    arab: string;
    text: string;
  }
}

// This function fetches a specific hadith by number
const fetchHadith = async (number: number) => {
  const response = await fetch(`https://api.myquran.com/v2/hadits/arbain/${number}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch hadith number ${number}`);
  }
  const data = await response.json();
  return data.data as HadithDetail;
};

// This function fetches all available hadiths (arbain 1-42)
const fetchAllHadithsInfo = async () => {
  // Define hadith titles (since the API doesn't provide them)
  const hadithTitles = [
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
  ];

  const promises = [];
  for (let i = 1; i <= 42; i++) {
    const title = hadithTitles[i-1] || `Hadith ${i}`;
    promises.push(
      fetch(`https://api.myquran.com/v2/hadits/arbain/${i}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch hadith ${i}`);
          return res.json();
        })
        .then(data => ({
          id: i,
          name: `Hadith No. ${i}`,
          title: title,
          // Include a snippet of the text for search purposes
          text: data.data?.contents?.text.substring(0, 50) || "",
        }))
        .catch(err => {
          console.error(`Error fetching hadith ${i}:`, err);
          return {
            id: i,
            name: `Hadith No. ${i}`,
            title: title,
            text: ""
          }; // Return basic info even on error
        })
    );
  }
  
  const results = await Promise.all(promises);
  return results as HadithInfo[];
};

const Hadith = () => {
  const [selectedHadithNumber, setSelectedHadithNumber] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all hadiths info for the search dropdown
  const { data: hadithsList, isLoading: isLoadingList } = useQuery({
    queryKey: ["hadithsList"],
    queryFn: fetchAllHadithsInfo,
  });

  // Fetch the selected hadith
  const { data: selectedHadith, isLoading: isLoadingSelected, error } = useQuery({
    queryKey: ["hadith", selectedHadithNumber],
    queryFn: () => selectedHadithNumber ? fetchHadith(selectedHadithNumber) : null,
    enabled: !!selectedHadithNumber,
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

  // Filter hadiths based on search term
  const filteredHadiths = hadithsList?.filter(hadith => 
    hadith.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hadith.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hadith.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectHadith = (id: number) => {
    setSelectedHadithNumber(id);
    const selectedHadith = hadithsList?.find(h => h.id === id);
    setSearchTerm(selectedHadith ? `${selectedHadith.name} - ${selectedHadith.title}` : `Hadith No. ${id}`);
    setShowDropdown(false);
    toast.success(`Loading Hadith No. ${id}`);
  };

  const isLoading = isLoadingList || (selectedHadithNumber && isLoadingSelected);

  if (isLoading && !selectedHadith) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-medium mb-2">Hadith</h1>
            <p className="text-muted-foreground">Arbain Nawawi Collection</p>
            
            <MenuNavigation activeSection="hadith" />
          </header>
          
          <div className="flex justify-center">
            <div className="w-12 h-12 border-2 border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && selectedHadithNumber) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-medium mb-2">Hadith</h1>
            <p className="text-muted-foreground">Arbain Nawawi Collection</p>
            
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
          <h1 className="text-2xl md:text-3xl font-medium mb-2">Hadith</h1>
          <p className="text-muted-foreground">Arbain Nawawi Collection</p>
          
          <MenuNavigation activeSection="hadith" />
          
          <div className="mt-6 max-w-sm mx-auto relative" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for a Hadith..."
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
            
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-card shadow-sm rounded-md max-h-60 overflow-auto">
                {filteredHadiths && filteredHadiths.length > 0 ? (
                  filteredHadiths.map((hadith) => (
                    <div
                      key={hadith.id}
                      className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                      onClick={() => handleSelectHadith(hadith.id)}
                    >
                      <div className="font-medium">{hadith.name}</div>
                      <div className="text-xs text-muted-foreground">{hadith.title}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-muted-foreground text-sm">No results found</div>
                )}
              </div>
            )}
          </div>
        </header>

        {selectedHadith ? (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border">
              <h2 className="text-lg font-medium">
                Hadith No. {selectedHadithNumber} 
                {hadithsList && selectedHadithNumber && 
                  <span className="ml-2 font-normal text-sm">
                    {hadithsList.find(h => h.id === selectedHadithNumber)?.title}
                  </span>
                }
              </h2>
            </div>
            <div className="p-4">
              <p className="text-right text-xl mb-3 leading-loose font-arabic">
                {selectedHadith.contents?.arab}
              </p>
              <p className="text-foreground text-sm mt-4">
                {selectedHadith.contents?.text}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm p-6 text-center">
            <p className="text-muted-foreground">Please search and select a Hadith to view its details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hadith;
