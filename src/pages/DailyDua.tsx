import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuNavigation } from "@/components/MenuNavigation";
import { Toaster, toast } from "sonner";
import '@fontsource/poppins';

interface Dua {
  id: string;
  arab: string;
  ayat: string;
  indo: string;
  artinya: string;
}

// Fetch a single dua by ID
const fetchDua = async (id: number): Promise<Dua> => {
  console.log(`Fetching dua with ID: ${id}`);
  const response = await fetch(`https://api.myquran.com/v2/doa/${id}`,{
    method: 'GET',
     mode: 'no-cors',
     redirect: 'follow'
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch dua with id ${id}`);
  }
  const data = await response.json();
  console.log(data);
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
  
  // If searching by ID (assuming it's a number)
  if (/^\d+$/.test(keyword) && parseInt(keyword) >= 1 && parseInt(keyword) <= 108) {
    try {
      const dua = await fetchDua(parseInt(keyword));
      return [dua];
    } catch (error) {
      console.error("Error fetching dua by ID:", error);
      return [];
    }
  }
  
  // For text search, fetch multiple duas and filter
  const searchRange = 20; // Fetch 20 duas for searching
  const startId = Math.floor(Math.random() * (108 - searchRange)) + 1;
  
  const promises = [];
  for (let i = startId; i < startId + searchRange; i++) {
    promises.push(
      fetch(`https://api.myquran.com/v2/doa/${i}`, {
        method: 'GET',
        mode: 'no-cors',
        redirect: 'follow'
      })
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
    const lowercaseKeyword = keyword.toLowerCase();
    return filteredResults.filter(dua => 
      dua.arab.toLowerCase().includes(lowercaseKeyword) ||
      dua.artinya.toLowerCase().includes(lowercaseKeyword)
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
  const { data: randomDua, isLoading: isLoadingRandom, refetch: refetchRandom } = useQuery({
    queryKey: ["randomDua"],
    queryFn: fetchRandomDua,
    enabled: !selectedDua, // Only fetch when no dua is selected
    retry: 3,
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching random dua:", error);
        toast.error("Failed to load random dua. Please try again.");
      }
    }
  });

  // Query for search results
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ["searchDuas", searchTerm],
    queryFn: () => searchDuas(searchTerm),
    enabled: isSearching && searchTerm.length > 0,
    retry: 2,
    meta: {
      onError: (error: Error) => {
        console.error("Error searching duas:", error);
        toast.error("Failed to search. Please try again.");
      }
    }
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
    if (randomDua && !selectedDua) {
      setSelectedDua(randomDua);
      setSearchTerm(randomDua.arab);
    }
  }, [randomDua, selectedDua]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() !== "") {
      setIsSearching(true);
      setShowDropdown(true);
    } else {
      setIsSearching(false);
      setShowDropdown(false);
    }
  };

  const handleSelectDua = (dua: Dua) => {
    setSelectedDua(dua);
    setSearchTerm(dua.arab);
    setShowDropdown(false);
    setIsSearching(false);
    toast.success(`Loaded: ${dua.arab}`);
  };

  // Get a new random dua
  const handleGetRandomDua = async () => {
    setSelectedDua(null);
    setSearchTerm("");
    await refetchRandom();
    toast.info("Loading a new random dua...");
  };

  // Handle searching for a specific dua ID
  const handleSearchById = async (id: number) => {
    try {
      const dua = await fetchDua(id);
      setSelectedDua(dua);
      setSearchTerm(dua.arab);
      toast.success(`Loaded: ${dua.arab}`);
    } catch (error) {
      toast.error("Failed to find dua with that ID");
    }
  };

  const isLoading = (isLoadingRandom || isSearchLoading) && !selectedDua;

  if (isLoading) {
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
    <div style={{ fontFamily: 'Poppins, sans-serif' }} className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
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
            
            {showDropdown && searchResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-card shadow-sm rounded-md max-h-60 overflow-auto">
                {searchResults.map((dua) => (
                  <div
                    key={dua.id}
                    className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                    onClick={() => handleSelectDua(dua)}
                  >
                    <span className="inline-block w-8 text-muted-foreground">{dua.id}.</span>
                    {dua.arab}
                  </div>
                ))}
              </div>
            )}
            
            {showDropdown && searchResults && searchResults.length === 0 && searchTerm.trim() !== "" && (
              <div className="absolute z-10 w-full mt-1 bg-card shadow-sm rounded-md">
                <div className="px-3 py-2 text-muted-foreground text-sm">No results found</div>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <button
              onClick={handleGetRandomDua}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Get Random Du'a
            </button>
          </div>
        </header>

        {selectedDua ? (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border">
              <h2 className="text-lg font-medium">{selectedDua.arab}</h2>
              <p className="text-xs text-muted-foreground">ID: {selectedDua.id}</p>
            </div>
            <div className="p-4">
              <p className="text-right text-xl mb-3 leading-loose font-arabic">
                {selectedDua.ayat}
              </p>
              <p className="text-muted-foreground mb-2 italic text-sm">
                {selectedDua.indo}
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
