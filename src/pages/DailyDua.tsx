
import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuNavigation } from "@/components/MenuNavigation";
import { Toaster, toast } from "sonner";

interface Dua {
  id: string;
  doa: string;
  ayat: string;
  latin: string;
  artinya: string;
}

// Fetch a single dua by ID
const fetchDua = async (id: number): Promise<Dua> => {
  console.log(`Fetching dua with ID: ${id}`);
  const response = await fetch(`https://api.myquran.com/v2/doa/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dua with id ${id}`);
  }
  const data = await response.json();
  return data.data;
};

// Fetch a random dua (between 1-108)
const fetchRandomDua = async (): Promise<Dua> => {
  const randomId = Math.floor(Math.random() * 108) + 1;
  return fetchDua(randomId);
};

// Search duas by keyword
const searchDuas = async (keyword: string): Promise<Dua[]> => {
  console.log(`Searching duas with keyword: ${keyword}`);
  // For simplicity, we'll fetch a range of duas and filter them client-side
  // This is more efficient than fetching all 108 duas
  const searchRange = 20; // Fetch 20 duas for searching
  const startId = Math.floor(Math.random() * (108 - searchRange)) + 1;
  
  const promises = [];
  for (let i = startId; i < startId + searchRange; i++) {
    promises.push(
      fetch(`https://api.myquran.com/v2/doa/${i}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch dua with id ${i}`);
          return res.json();
        })
        .then(data => {
          if (data.status === "true" || data.status === true) {
            return data.data;
          }
          return null;
        })
        .catch(err => {
          console.error(`Error fetching dua ${i}:`, err);
          return null;
        })
    );
  }
  
  const results = await Promise.all(promises);
  const filteredResults = results.filter(Boolean) as Dua[];
  
  // Filter by keyword if provided
  if (keyword && keyword.trim() !== "") {
    return filteredResults.filter(dua => 
      dua.doa.toLowerCase().includes(keyword.toLowerCase()) ||
      dua.artinya.toLowerCase().includes(keyword.toLowerCase()) ||
      dua.id.toString().includes(keyword)
    );
  }
  
  return filteredResults;
};

const DailyDua = () => {
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Query for initial random dua
  const { data: randomDua, isLoading: isLoadingRandom } = useQuery({
    queryKey: ["randomDua"],
    queryFn: fetchRandomDua,
    enabled: !isSearching && !selectedDua,
  });

  // Query for search results
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ["searchDuas", searchTerm],
    queryFn: () => searchDuas(searchTerm),
    enabled: isSearching && searchTerm.length > 0,
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

  // Set the initial random dua when it loads
  useEffect(() => {
    if (!selectedDua && randomDua) {
      setSelectedDua(randomDua);
      setSearchTerm(randomDua.doa);
    }
  }, [randomDua, selectedDua]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsSearching(true);
    setShowDropdown(true);
  };

  const handleSelectDua = (dua: Dua) => {
    setSelectedDua(dua);
    setSearchTerm(dua.doa);
    setShowDropdown(false);
    setIsSearching(false);
    toast.success(`Loaded: ${dua.doa}`);
  };

  // Handle searching for a specific dua ID
  const handleSearchById = async (id: number) => {
    try {
      const dua = await fetchDua(id);
      setSelectedDua(dua);
      setSearchTerm(dua.doa);
      toast.success(`Loaded: ${dua.doa}`);
    } catch (error) {
      toast.error("Failed to find dua with that ID");
    }
  };

  const isLoading = isLoadingRandom || isSearchLoading;

  if (isLoading && !selectedDua) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-medium mb-2">Do'a Harian</h1>
            <p className="text-muted-foreground">Daily Prayers</p>
            
            <MenuNavigation activeSection="daily-dua" />
          </header>
          
          <div className="flex justify-center">
            <div className="w-12 h-12 border-2 border-t-primary rounded-full animate-spin"></div>
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
          <h1 className="text-2xl md:text-3xl font-medium mb-2">Do'a Harian</h1>
          <p className="text-muted-foreground">Daily Prayers</p>
          
          <MenuNavigation activeSection="daily-dua" />
          
          <div className="mt-6 max-w-sm mx-auto relative" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for a Du'a by name, meaning or ID..."
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
            
            {showDropdown && searchResults && (
              <div className="absolute z-10 w-full mt-1 bg-card shadow-sm rounded-md max-h-60 overflow-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((dua) => (
                    <div
                      key={dua.id}
                      className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                      onClick={() => handleSelectDua(dua)}
                    >
                      <span className="inline-block w-8 text-muted-foreground">{dua.id}.</span>
                      {dua.doa}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-muted-foreground text-sm">No results found</div>
                )}
              </div>
            )}
          </div>
        </header>

        {selectedDua ? (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border">
              <h2 className="text-lg font-medium">{selectedDua.doa}</h2>
              <p className="text-xs text-muted-foreground">ID: {selectedDua.id}</p>
            </div>
            <div className="p-4">
              <p className="text-right text-xl mb-3 leading-loose font-arabic">
                {selectedDua.ayat}
              </p>
              <p className="text-muted-foreground mb-2 italic text-sm">
                {selectedDua.latin}
              </p>
              <p className="text-foreground text-sm">
                {selectedDua.artinya}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm p-6 text-center">
            <p className="text-muted-foreground">Please search and select a Du'a to view its details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyDua;
