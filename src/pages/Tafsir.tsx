
import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { MenuNavigation } from "@/components/MenuNavigation";

interface TafsirVerse {
  id: number;
  arab: string;
  translation: string;
}

interface TafsirData {
  ayat: TafsirVerse[];
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  tafsir: {
    id: string;
  }[];
}

const fetchTafsir = async (surahId: number): Promise<TafsirData> => {
  const response = await fetch(`https://equran.id/api/v2/tafsir/${surahId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch Tafsir data");
  }
  const data = await response.json();
  console.log(data);
  return data.data;
};

const Tafsir = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [surahId, setSurahId] = useState(1); // Default to Surah Al-Fatihah
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tafsir", surahId],
    queryFn: () => fetchTafsir(surahId),
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching tafsir:", error);
        toast.error("Failed to load tafsir. Please try again.");
      }
    }
  });

  const surahOptions = Array.from({ length: 114 }, (_, i) => ({
    value: i + 1,
    label: `Surah ${i + 1}`,
  }));

  const filteredOptions = surahOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (selectedSurahId: number) => {
    setSurahId(selectedSurahId);
    setSearchTerm(`Surah ${selectedSurahId}`);
    setShowDropdown(false);
    refetch();
    toast.success(`Loaded Surah ${selectedSurahId}`);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading tafsir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card p-8 rounded-lg shadow-sm max-w-md w-full">
          <div className="text-destructive text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-center">Error Loading Tafsir</h2>
          <p className="mt-2 text-muted-foreground text-center">We couldn't load the tafsir data. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-medium mb-2">Tafsir Al-Quran</h1>
          {data && (
            <p className="text-muted-foreground">
              {data.namaLatin} - {data.arti}
            </p>
          )}
          
          <MenuNavigation activeSection="tafsir" />
          
          <div className="mt-6 max-w-xs mx-auto relative" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for a Surah..."
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
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                      onClick={() => handleSearch(option.value)}
                    >
                      {option.label}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-muted-foreground text-sm">No results found</div>
                )}
              </div>
            )}
          </div>
        </header>

        {data && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              <div className="bg-muted px-4 py-3 border-b border-border">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">{data.namaLatin}</h2>
                  <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {data.tempatTurun}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground">{data.arti}</p>
                  <p className="text-xs text-muted-foreground">{data.jumlahAyat} Ayat</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-muted-foreground mb-4 text-sm">
                  {data.deskripsi}
                </p>
              </div>
            </div>
            
            {data.ayat && data.ayat.map((verse, index) => (
              <div key={verse.id} className="bg-card rounded-lg shadow-sm overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b border-border flex justify-between items-center">
                  <h2 className="text-md font-medium">Ayat {verse.id}</h2>
                  <div className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                    {data.namaLatin}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-right text-xl mb-3 leading-loose font-arabic">
                    {verse.arab}
                  </p>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {verse.translation}
                  </p>
                  {data.tafsir && data.tafsir[index] && (
                    <div className="mt-4 border-t border-border pt-4">
                      <h3 className="font-medium mb-2">Tafsir</h3>
                      <p className="text-sm">{data.tafsir[index].id}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tafsir;
