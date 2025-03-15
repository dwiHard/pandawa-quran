import React from "react";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
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
            {displayHadith.judul && (
              <span className="text-sm">
                {displayHadith.judul}
              </span>
            )}
          </h2>
        </div>

        <div className="flex space-x-2">
          {!selectedHadithNumber && (
            <button
              onClick={onRefreshRandom}
              className="p-1 rounded hover:bg-muted-foreground/10 flex items-center justify-center"
              title="Load another random hadith"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          {selectedHadithNumber && selectedHadithNumber > 1 && (
            <button
              onClick={onNavigatePrevious}
              className="p-1 rounded hover:bg-muted-foreground/10 flex items-center justify-center"
              title="Previous hadith"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {selectedHadithNumber && selectedHadithNumber < currentSource.range && (
            <button
              onClick={onNavigateNext}
              className="p-1 rounded hover:bg-muted-foreground/10 flex items-center justify-center"
              title="Next hadith"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
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
