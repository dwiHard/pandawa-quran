
import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { MenuNavigation } from "@/components/MenuNavigation";
import { BookOpen, Search } from "lucide-react";

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
    teks: string;
  }[];
}

const fetchTafsir = async (surahId: number): Promise<TafsirData> => {
  const response = await fetch(`https://equran.id/api/v2/tafsir/${surahId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch Tafsir data");
  }
  const data = await response.json();
  return data.data;
};

// Format HTML tags in text, specifically handling <i> tags for italics
const formatHtmlText = (text: string) => {
  if (!text) return "";
  // Replace <i> tags with styled spans for italics
  return text.replace(/<i>(.*?)<\/i>/g, (match, p1) => {
    return `<em class="italic font-medium text-primary/90">${p1}</em>`;
  });
};

const TafsirSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header skeleton */}
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <div className="bg-muted px-4 py-3 border-b border-border">
        <div className="h-6 bg-muted-foreground/20 rounded w-1/3 mb-2"></div>
        <div className="flex justify-between">
          <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-16"></div>
        </div>
      </div>
      <div className="p-4">
        <div className="h-4 bg-muted-foreground/20 rounded w-full mb-2"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-4/6"></div>
      </div>
    </div>

    {/* Table skeleton */}
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <div className="bg-muted px-4 py-3 border-b border-border">
        <div className="h-6 bg-muted-foreground/20 rounded w-1/4"></div>
      </div>
      <div className="p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b border-border py-2 px-2 flex">
            <div className="h-5 bg-muted-foreground/20 rounded w-16 mr-2"></div>
            <div className="flex-1">
              <div className="h-5 bg-muted-foreground/20 rounded w-full mb-2"></div>
              <div className="h-5 bg-muted-foreground/20 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Verse skeletons */}
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="bg-muted px-4 py-2 border-b border-border">
          <div className="h-5 bg-muted-foreground/20 rounded w-1/5"></div>
        </div>
        <div className="p-4">
          <div className="h-8 bg-muted-foreground/20 rounded w-full mb-4 text-right"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-full mb-2"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-4/6 mb-2"></div>
          <div className="border-t border-border mt-4 pt-4">
            <div className="h-5 bg-muted-foreground/20 rounded w-1/6 mb-2"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-full mb-2"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-8 px-4">
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
          <h1 className="text-2xl md:text-3xl font-medium mb-2 flex items-center justify-center">
            <BookOpen className="mr-2 h-6 w-6" />
            Tafsir Al-Quran
          </h1>
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
                className="w-full px-3 py-2 pl-9 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              />
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-card shadow-md rounded-md max-h-60 overflow-auto">
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

        {isLoading && <TafsirSkeleton />}

        {data && !isLoading && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              <div className="bg-muted/50 px-5 py-4 border-b border-border">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-medium">{data.namaLatin}</h2>
                  <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {data.tempatTurun}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground">{data.arti}</p>
                  <p className="text-xs text-muted-foreground">{data.jumlahAyat} Ayat</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-muted-foreground text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatHtmlText(data.deskripsi) }} >
                </p>
              </div>
            </div>

            {/* Table of verses and interpretations */}
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
              <div className="bg-muted/50 px-5 py-4 border-b border-border">
                <h2 className="text-lg font-medium">Tafsir Summary</h2>
                <p className="text-xs text-muted-foreground mt-1">Verse by verse interpretations</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="border-b border-border py-3 px-4 text-left text-sm font-medium">Verse</th>
                      <th className="border-b border-border py-3 px-4 text-left text-sm font-medium">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.tafsir.map((tafsir, index) => (
                      <tr key={index} className="hover:bg-muted/20 transition-colors group">
                        <td className="border-b border-border py-3 px-4 text-sm font-medium whitespace-nowrap">
                          Ayat {index + 1}
                        </td>
                        <td className="border-b border-border py-3 px-4 text-sm">
                          <div className="prose prose-sm max-w-none leading-relaxed text-foreground/90 group-hover:text-foreground transition-colors" 
                            dangerouslySetInnerHTML={{ __html: formatHtmlText(tafsir.teks) }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {data.ayat && data.ayat.map((verse, index) => (
              <div key={verse.id} className="bg-card rounded-lg shadow-sm overflow-hidden">
                <div className="bg-muted/50 px-5 py-3 border-b border-border flex justify-between items-center">
                  <h2 className="text-md font-medium">Ayat {verse.id}</h2>
                  <div className="text-xs px-2 py-1 bg-secondary/30 text-secondary-foreground rounded-full">
                    {data.namaLatin}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-right text-2xl mb-4 leading-loose font-arabic">
                    {verse.arab}
                  </p>
                  <p className="text-foreground/90 mb-4 text-sm leading-relaxed">
                    {verse.translation}
                  </p>
                  {data.tafsir && data.tafsir[index] && (
                    <div className="mt-5 border-t border-border pt-4">
                      <h3 className="font-medium mb-2 text-primary/90">Tafsir</h3>
                      <div 
                        className="text-sm prose prose-sm max-w-none leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatHtmlText(data.tafsir[index].id) }}
                      />
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
