import React, { useState, useRef, useEffect } from "react";
import { Filter, Check, X } from "lucide-react";
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
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const currentSource = hadithSources.find(s => s.id === selectedSource) || hadithSources[0];

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3 border border-border/50">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Selected Collection</h3>
          <p className="text-lg font-medium mt-1">{currentSource.name}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Filter hadith collections"
        >
          <Filter className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Modal for selecting hadith source */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            ref={modalRef}
            className="bg-card rounded-xl shadow-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto border border-border/50 animate-in fade-in slide-in-from-bottom-10 duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Select Hadith Collection</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2 mt-4">
              {hadithSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => {
                    onSelectSource(source.id);
                    setShowModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedSource === source.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-muted border border-transparent"
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{source.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {source.range} hadith
                    </span>
                  </div>
                  {selectedSource === source.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
