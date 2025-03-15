import React from "react";
import { Toaster } from "sonner";
import QuranPlayer from "@/components/QuranPlayer";
import '@fontsource/poppins';

const Home = () => {
  return <div style={{ fontFamily: 'Poppins, sans-serif' }} className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 pb-24 sm:pt-24">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-medium mb-2">Quran Player</h1>
          <p className="text-muted-foreground">Develop by Hardiyanto</p>
          
          <QuranPlayer />
        </header>
      </div>
    </div>;
};
export default Home;