import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import '@fontsource/poppins';

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
  const [currentTafsirPage, setCurrentTafsirPage] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const tafsirPerPage = 1; // Number of tafsir items to show per page
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tafsirSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    setCurrentTafsirPage(1); // Reset to first page when changing surah
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

  // Calculate pagination for tafsir interpretations
  const indexOfLastTafsir = currentTafsirPage * tafsirPerPage;
  const indexOfFirstTafsir = indexOfLastTafsir - tafsirPerPage;
  const currentTafsirs = data?.tafsir ? data.tafsir.slice(indexOfFirstTafsir, indexOfLastTafsir) : [];
  const totalTafsirPages = data?.tafsir ? Math.ceil(data.tafsir.length / tafsirPerPage) : 0;

  // Pagination controls for tafsir with scroll
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalTafsirPages) {
      setCurrentTafsirPage(pageNumber);
      // Add scroll to Tafsir Summary section
      if (tafsirSummaryRef.current) {
        tafsirSummaryRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  // Fungsi untuk menentukan halaman mana yang ditampilkan
  const getPageNumbers = (currentPage: number, totalPages: number) => {
    const pageNumbers = [];
    
    // Selalu tampilkan halaman pertama
    pageNumbers.push(1);
    
    // Tentukan range halaman yang akan ditampilkan di sekitar halaman saat ini
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Tambahkan ellipsis setelah halaman pertama jika diperlukan
    if (startPage > 2) {
      pageNumbers.push('...');
    }
    
    // Tambahkan halaman di sekitar halaman saat ini
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Tambahkan ellipsis sebelum halaman terakhir jika diperlukan
    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    // Selalu tampilkan halaman terakhir jika totalPages > 1
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

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
    <div style={{ fontFamily: 'Poppins, sans-serif' }} className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 pb-24 sm:pt-24">
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
                className="w-full pl-10 pr-3 py-2 border border-input rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
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
                <p className="text-muted-foreground text-sm leading-relaxed text-justify"
                  dangerouslySetInnerHTML={{ __html: formatHtmlText(data.deskripsi) }} >
                </p>
              </div>
            </div>

            {/* Tafsir Interpretations Card with Pagination */}
            <div 
              ref={tafsirSummaryRef} 
              id="tafsir-summary" 
              className="bg-card rounded-lg shadow-sm overflow-hidden scroll-mt-4"
            >
              <div className="bg-muted/50 px-5 py-4 border-b border-border">
                <h2 className="text-lg font-medium">Tafsir</h2>
                <p className="text-xs text-muted-foreground mt-1">Tentang Surah {data.namaLatin}</p>
              </div>
              
              <div className="p-5">
                {currentTafsirs.map((tafsir, index) => (
                  <div key={indexOfFirstTafsir + index} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-muted px-2 py-1 rounded text-xs font-medium">
                        Ayat {indexOfFirstTafsir + index + 1}
                      </div>
                      <div className="h-px flex-grow bg-border"></div>
                    </div>
                    <div 
                      className="prose prose-sm max-w-none leading-relaxed text-muted-foreground text-sm text-justify"
                      dangerouslySetInnerHTML={{ __html: formatHtmlText(tafsir.teks) }} 
                    />
                  </div>
                ))}
                
                {/* Pagination Control yang Lebih Cantik dengan Nomor Halaman */}
                {totalTafsirPages > 1 && (
                  <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 mt-8 mb-12 bg-card rounded-lg shadow-sm p-4 border border-border/50">
                    <button
                      onClick={() => paginate(currentTafsirPage - 1)}
                      disabled={currentTafsirPage === 1}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        currentTafsirPage === 1 
                          ? "opacity-50 cursor-not-allowed" 
                          : "hover:bg-muted"
                      }`}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="text-sm">Previous</span>
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {getPageNumbers(currentTafsirPage, totalTafsirPages).map((page, index) => {
                        if (page === '...') {
                          return <span key={`ellipsis-${index}`} className="text-muted-foreground px-1">...</span>;
                        }
                        
                        return (
                          <button
                            key={`page-${page}`}
                            onClick={() => paginate(page as number)}
                            className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${
                              currentTafsirPage === page
                                ? "bg-primary text-primary-foreground font-medium"
                                : "border border-input hover:bg-muted"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => paginate(currentTafsirPage + 1)}
                      disabled={currentTafsirPage === totalTafsirPages}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        currentTafsirPage === totalTafsirPages 
                          ? "opacity-50 cursor-not-allowed" 
                          : "hover:bg-muted"
                      }`}
                      aria-label="Next page"
                    >
                      <span className="text-sm">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
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

        {/* Back to Top Button yang Diperbaiki untuk Mode Mobile */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-20 sm:bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-3 shadow-lg transition-all duration-300 hover:bg-primary/90 ${
            showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
          }`}
          aria-label="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Tafsir;
