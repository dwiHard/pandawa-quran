
import React from "react";
import { Toaster } from "sonner";
import { MenuNavigation } from "@/components/MenuNavigation";
import QuranPlayer from "@/components/QuranPlayer";

const Home = () => {
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-medium mb-2">Quran Player</h1>
          <p className="text-muted-foreground">Listen to the Holy Quran</p>
          
          <MenuNavigation activeSection="quran-player" />
          
          <QuranPlayer />
        </header>
      </div>
    </div>
  );
};

export default Home;
