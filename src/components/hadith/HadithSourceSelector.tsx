
import React from "react";
import { HadithSource } from "@/types/hadith";

interface HadithSourceSelectorProps {
  hadithSources: HadithSource[];
  selectedSource: string;
  onSelectSource: (sourceId: string) => void;
}

export const HadithSourceSelector = ({
  hadithSources,
  selectedSource,
  onSelectSource,
}: HadithSourceSelectorProps) => {
  return (
    <div className="mt-6 overflow-x-auto">
      <div className="flex gap-2 pb-2">
        {hadithSources.map((source) => (
          <button
            key={source.id}
            onClick={() => onSelectSource(source.id)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
              selectedSource === source.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {source.name}
          </button>
        ))}
      </div>
    </div>
  );
};
