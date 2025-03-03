
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

const fetchDua = async (id: number) => {
  const response = await fetch(`https://api.myquran.com/v2/doa/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dua with id ${id}`);
  }
  const data = await response.json();
  return data.data as Dua;
};

const fetchAllDuas = async () => {
  // Fetching dua list one by one with fixed endpoint format
  const promises = [];
  const duaIds = Array.from({ length: 108 }, (_, i) => i + 1);
  
  for (const id of duaIds) {
    promises.push(
      fetch(`https://api.myquran.com/v2/doa/${id}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch dua with id ${id}`);
          return res.json();
        })
        .then(data => {
          if (data.status === "true" || data.status === true) {
            return data.data; 
          }
          console.error(`Invalid data structure for dua ${id}:`, data);
          return null;
        })
        .catch(err => {
          console.error(`Error fetching dua ${id}:`, err);
          return null; // Return null for failed requests
        })
    );
  }
  
  const results = await Promise.all(promises);
  return results.filter(Boolean) as Dua[]; // Filter out null values
};

const DailyDua = () => {
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: duas, isLoading, error } = useQuery({
    queryKey: ["duas"],
    queryFn: fetchAllDuas,
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

  // If no dua is selected and we have data, select the first one
  useEffect(() => {
    if (!selectedDua && duas && duas.length > 0) {
      setSelectedDua(duas[0]);
      setSearchTerm(duas[0].doa);
    }
  }, [duas, selectedDua]);

  // Filter duas based on search term
  const filteredDuas = duas?.filter(dua => 
    dua.doa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dua.artinya.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectDua = (dua: Dua) => {
    setSelectedDua(dua);
    setSearchTerm(dua.doa);
    setShowDropdown(false);
    toast.success(`Loaded: ${dua.doa}`);
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-medium mb-2">Do'a Harian</h1>
            <p className="text-muted-foreground">Daily Prayers</p>
            
            <MenuNavigation activeSection="daily-dua" />
          </header>
          
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            <p>Failed to load duas. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle the case when no duas are loaded
  if (!duas || duas.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-medium mb-2">Do'a Harian</h1>
            <p className="text-muted-foreground">Daily Prayers</p>
            
            <MenuNavigation activeSection="daily-dua" />
          </header>
          
          <div className="bg-card rounded-lg shadow-sm p-6 text-center">
            <p className="text-muted-foreground">No Du'a data available. Please try again later.</p>
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for a Du'a..."
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
                {filteredDuas && filteredDuas.length > 0 ? (
                  filteredDuas.map((dua) => (
                    <div
                      key={dua.id}
                      className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                      onClick={() => handleSelectDua(dua)}
                    >
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
