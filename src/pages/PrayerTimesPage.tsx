import React from "react";
import PrayerTimes from "@/components/PrayerTimes";
import { Toaster } from "sonner";
import '@fontsource/poppins';

const PrayerTimesPage = () => {
  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }} className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 pb-24 sm:pt-24">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-medium mb-2">Jadwal Sholat</h1>
          <p className="text-muted-foreground">untuk wilayah indonesia</p>
        </header>

        <div className="bg-card rounded-lg shadow-sm overflow-hidden p-6">
          <PrayerTimes />
        </div>
      </div>
    </div>
  );
};

export default PrayerTimesPage;
