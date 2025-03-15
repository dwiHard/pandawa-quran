
import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { HadithInfo, HadithSource } from "@/types/hadith";

interface HadithSearchProps {
  currentSource: HadithSource;
  hadithsList?: HadithInfo[];
  isLoadingList: boolean;
  onSelectHadith: (hadith: HadithInfo) => void;
  onSearchByNumber: (number: number) => void;
}

export const HadithSearch = ({
  currentSource,
  hadithsList,
  isLoadingList,
  onSelectHadith,
  onSearchByNumber,
}: HadithSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const filteredHadiths = searchTerm.trim() === ""
    ? []
    : hadithsList?.filter(hadith =>
        hadith.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hadith.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hadith.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hadith.id.toString() === searchTerm.trim()
      );

  const handleSelectHadith = (hadith: HadithInfo) => {
    onSelectHadith(hadith);
    setSearchTerm(`${hadith.name} - ${hadith.title}`);
    setShowDropdown(false);
  };

  const handleSearchByNumber = () => {
    const numericInput = parseInt(searchTerm.trim());
    if (!isNaN(numericInput) && numericInput > 0 && numericInput <= currentSource.range) {
      onSearchByNumber(numericInput);
      setShowDropdown(false);
    } else if (!isNaN(numericInput)) {
      toast.error(`Please enter a valid number between 1 and ${currentSource.range}`);
    }
  };

  return (
    <div className="mt-4 max-w-sm mx-auto relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchByNumber();
            }
          }}
          placeholder={`Search in (1-${currentSource.range})...`}
          className="w-full pl-10 pr-3 py-2 border border-input rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
        />
        <button
          onClick={() => handleSearchByNumber()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8a4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {showDropdown && searchTerm.trim() !== "" && (
        <div className="absolute z-10 w-full mt-1 bg-card shadow-sm rounded-md max-h-60 overflow-auto">
          {filteredHadiths && filteredHadiths.length > 0 ? (
            filteredHadiths.map((hadith) => (
              <div
                key={`${hadith.source}-${hadith.id}`}
                className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                onClick={() => handleSelectHadith(hadith)}
              >
                <div className="font-medium">{hadith.name}</div>
                <div className="text-xs text-muted-foreground">{hadith.title}</div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-muted-foreground text-sm">
              No results found. Enter a number between 1-{currentSource.range} to load directly.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
