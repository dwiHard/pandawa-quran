
import React from "react";
import { MenuNavigation } from "@/components/MenuNavigation";
import '@fontsource/poppins';
const About = () => {
  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }} className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-medium mb-2">About</h1>
          <p className="text-muted-foreground">Learn more about this application</p>
          
          <MenuNavigation activeSection="about" />
        </header>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-medium mb-4">Islamic Resource App</h2>
          
          <p className="mb-4 text-muted-foreground">
            This application is designed to provide easy access to various Islamic resources including:
          </p>
          
          <ul className="list-disc pl-5 mb-4 space-y-2 text-muted-foreground">
            <li>Complete Juz 30 of the Holy Quran with Arabic text, transliteration, and translation</li>
            <li>Daily prayer times based on your location</li>
            <li>Collection of daily duas (prayers) for various occasions</li>
            <li>The 99 beautiful names of Allah (Asmaul Husna)</li>
            <li>Collection of authentic hadiths from Arbain Nawawi</li>
          </ul>
          
          <p className="mb-4 text-muted-foreground">
            All data is sourced from myQuran API, which provides accurate and authentic Islamic content.
          </p>
          
          <h3 className="text-lg font-medium mt-6 mb-2">API Credits</h3>
          <p className="text-muted-foreground">
            This application uses the myQuran API (<a href="https://api.myquran.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://api.myquran.com</a>) 
            for all Islamic content. We are grateful to the developers of myQuran for providing this valuable resource.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
