import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { HadithSearch } from "@/components/hadith/HadithSearch";
import { HadithSourceSelector } from "@/components/hadith/HadithSourceSelector";
import { HadithDetail } from "@/components/hadith/HadithDetail";
import { hadithSources } from "@/components/hadith/HadithData";
import { fetchHadith, fetchRandomHadith, fetchHadithsInfoBySource } from "@/services/hadithService";
import { HadithInfo } from "@/types/hadith";
import { toast } from "sonner";
import '@fontsource/poppins';
import { BookText, RefreshCw } from "lucide-react";

const Hadith = () => {
  const [selectedSource, setSelectedSource] = useState("arbain");
  const [selectedHadithNumber, setSelectedHadithNumber] = useState<number | null>(null);
  
  const currentSource = hadithSources.find(s => s.id === selectedSource) || hadithSources[0];

  // Fetch hadiths based on selected source
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
    queryFn: () => fetchRandomHadith(currentSource),
    enabled: !selectedHadithNumber,
  });

  // Reset search and selected hadith when source changes
  useEffect(() => {
    setSelectedHadithNumber(null);
    refetchHadiths();
  }, [selectedSource, refetchHadiths]);

  const handleSelectHadith = (hadith: HadithInfo) => {
    setSelectedHadithNumber(hadith.id);
    toast.success(`Loading ${hadith.name}`);
  };

  const selectHadithSource = (sourceId: string) => {
    setSelectedSource(sourceId);
    setSelectedHadithNumber(null);
    refetchRandomHadith();
  };

  const handleSearchByNumber = (number: number) => {
    setSelectedHadithNumber(number);
    toast.success(`Loading ${currentSource.name} Hadith #${number}`);
  };

  const handleRefreshRandom = () => {
    refetchRandomHadith();
    toast.success(`Loading random hadith from ${currentSource.name}`);
  };

  const handleNavigatePrevious = () => {
    setSelectedHadithNumber(prev => (prev && prev > 1) ? prev - 1 : 1);
  };

  const handleNavigateNext = () => {
    if (selectedHadithNumber && selectedHadithNumber < currentSource.range) {
      setSelectedHadithNumber(selectedHadithNumber + 1);
    }
  };

  const isLoading = isLoadingList || (selectedHadithNumber && isLoadingSelected) || (!selectedHadithNumber && isLoadingRandom);
  const displayHadith = selectedHadithNumber ? selectedHadith : randomHadith;

  if (isLoading && !displayHadith) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 pb-24 sm:pt-24">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-medium mb-2 flex items-center justify-center">
              <BookText className="mr-2 h-6 w-6" />
              Hadits
            </h1>
            <p className="text-muted-foreground">Hadits Collections</p>
          </header>
          
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-2 border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if ((error && selectedHadithNumber) || (error && !selectedHadithNumber && !displayHadith)) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 pb-24 sm:pt-24">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-medium mb-2 flex items-center justify-center">
              <BookText className="mr-2 h-6 w-6" />
              Hadits
            </h1>
            <p className="text-muted-foreground">Hadits Collections</p>
          </header>
          
          <div className="bg-destructive/10 text-destructive p-6 rounded-lg shadow-sm border border-destructive/20 flex flex-col items-center">
            <p className="mb-4">Failed to load hadith. Please try again later.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-md flex items-center transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh Page
            </button>
          </div>
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
            <BookText className="mr-2 h-6 w-6" />
            Hadits
          </h1>
          <p className="text-muted-foreground mb-6">Hadits Collections</p>
          
          <div className="bg-card rounded-lg shadow-sm border border-border/50 p-6 mb-8">
            <HadithSourceSelector 
              hadithSources={hadithSources}
              selectedSource={selectedSource}
              onSelectSource={selectHadithSource}
            />
            
            <div className="mt-6">
              <HadithSearch
                currentSource={currentSource}
                hadithsList={hadithsList}
                isLoadingList={isLoadingList}
                onSelectHadith={handleSelectHadith}
                onSearchByNumber={handleSearchByNumber}
              />
            </div>
          </div>
        </header>

        <div className="bg-card rounded-lg shadow-sm border border-border/50 p-6">
          <HadithDetail
            displayHadith={displayHadith}
            selectedHadithNumber={selectedHadithNumber}
            currentSource={currentSource}
            onRefreshRandom={handleRefreshRandom}
            onNavigatePrevious={handleNavigatePrevious}
            onNavigateNext={handleNavigateNext}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Hadith;
