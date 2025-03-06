
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Juz30 from "./pages/Juz30";
import Tafsir from "./pages/Tafsir";
import PrayerTimesPage from "./pages/PrayerTimesPage";
import DailyDua from "./pages/DailyDua";
import AsmaulHusna from "./pages/AsmaulHusna";
import Hadith from "./pages/Hadith";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/quran-player" replace />} />
          <Route path="/quran-player" element={<Home />} />
          <Route path="/juz30" element={<Juz30 />} />
          <Route path="/tafsir" element={<Tafsir />} />
          <Route path="/prayer-times" element={<PrayerTimesPage />} />
          <Route path="/daily-dua" element={<DailyDua />} />
          <Route path="/asmaul-husna" element={<AsmaulHusna />} />
          <Route path="/hadith" element={<Hadith />} />
          <Route path="/about" element={<About />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
