
import React from "react";
import { Book, RefreshCw } from "lucide-react";
import { HadithDetail as HadithDetailType, HadithSource } from "@/types/hadith";

interface HadithDetailProps {
  displayHadith: HadithDetailType | null | undefined;
  selectedHadithNumber: number | null;
  currentSource: HadithSource;
  onRefreshRandom: () => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  isLoading: boolean;
}

export const HadithDetail = ({
  displayHadith,
  selectedHadithNumber,
  currentSource,
  onRefreshRandom,
  onNavigatePrevious,
  onNavigateNext,
  isLoading,
}: HadithDetailProps) => {
  if (isLoading && !displayHadith) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-6 text-center">
        <p className="text-muted-foreground">Loading hadith...</p>
        <div className="mt-4 flex justify-center">
          <div className="w-8 h-8 border-2 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!displayHadith) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-6 text-center">
        <p className="text-muted-foreground">No hadith found. Please select a different source or try again.</p>
      </div>
    );
  }

  // Check if the hadith content is in different structure based on source API
  const arabText = displayHadith.arab || (displayHadith as any).ar || "";
  const indoText = displayHadith.indo || (displayHadith as any).id || "";

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <div className="bg-muted px-4 py-3 border-b border-border flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium flex items-center">
            <Book className="h-4 w-4 mr-2" />
            {selectedHadithNumber ? (
              `${currentSource.name} #${selectedHadithNumber}`
            ) : (
              `Random ${currentSource.name} Hadith`
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
              onClick={onRefreshRandom}
              className="p-1 rounded hover:bg-muted-foreground/10"
              title="Load another random hadith"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          {selectedHadithNumber && (
            <>
              <button
                onClick={onNavigatePrevious}
                disabled={selectedHadithNumber === 1}
                className="p-1 rounded hover:bg-muted-foreground/10 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={onNavigateNext}
                disabled={selectedHadithNumber >= currentSource.range}
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
          {arabText}
        </p>
        <p className="text-muted-foreground text-justify text-sm mt-4">
          {indoText}
        </p>
      </div>
    </div>
  );
};
