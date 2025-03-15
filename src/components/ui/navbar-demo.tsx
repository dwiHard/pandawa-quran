import { Home, BookOpen, FileText, Clock, Star, BookText, Info } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"
import { useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

export function NavBarDemo() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");
  
  useEffect(() => {
    // Determine active section based on current path
    const path = location.pathname;
    
    if (path.includes('quran-player')) {
      setActiveSection('Home');
    } else if (path.includes('juz30') || path.includes('surah')) {
      setActiveSection('Quran'); // Set Quran as active for both juz30 and surah pages
    } else if (path.includes('tafsir')) {
      setActiveSection('Tafsir');
    } else if (path.includes('prayer-times')) {
      setActiveSection('Prayer');
    } else if (path.includes('asmaul-husna')) {
      setActiveSection('Asmaul');
    } else if (path.includes('hadith')) {
      setActiveSection('Hadith');
    } else if (path.includes('about')) {
      setActiveSection('About');
    }
  }, [location]);

  const navItems = [
    { name: 'Home', url: '/quran-player', icon: Home },
    { name: 'Quran', url: '/juz30', icon: BookOpen },
    { name: 'Tafsir', url: '/tafsir', icon: FileText },
    { name: 'Prayer', url: '/prayer-times', icon: Clock },
    { name: 'Asmaul', url: '/asmaul-husna', icon: Star },
    { name: 'Hadith', url: '/hadith', icon: BookText },
    // { name: 'About', url: '/about', icon: Info }
  ]

  return <NavBar items={navItems} activeOverride={activeSection} />;
} 