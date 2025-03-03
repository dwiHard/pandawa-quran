
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  SunMoon,
  Sun,
  CloudSun,
  Moon,
  SunDim,
  MoonStar,
  Home,
} from "lucide-react";

type CategoryItem = {
  id: string;
  icon: React.ReactNode;
  label: string;
  route: string;
  isActive?: boolean;
};

interface MenuNavigationProps {
  activeSection: string;
}

export const MenuNavigation = ({ activeSection }: MenuNavigationProps) => {
  const navigate = useNavigate();

  const categories: CategoryItem[] = [
    {
      id: "1",
      icon: <Home size={24} />,
      label: "Home",
      route: "/quran-player",
      isActive: activeSection === "quran-player",
    },
    {
      id: "2",
      icon: <CloudSun size={24} />,
      label: "Juz 30",
      route: "/juz30",
      isActive: activeSection === "juz30",
    },
    {
      id: "3",
      icon: <Sun size={24} />,
      label: "Jadwal Sholat",
      route: "/prayer-times",
      isActive: activeSection === "prayer-times",
    },
    {
      id: "4",
      icon: <SunDim size={24} />,
      label: "Do'a Harian",
      route: "/daily-dua",
      isActive: activeSection === "daily-dua",
    },
    {
      id: "5",
      icon: <SunMoon size={24} />,
      label: "Asmaul Husna",
      route: "/asmaul-husna",
      isActive: activeSection === "asmaul-husna",
    },
    {
      id: "6",
      icon: <Moon size={24} />,
      label: "Hadits",
      route: "/hadith",
      isActive: activeSection === "hadith",
    },
    {
      id: "7",
      icon: <MoonStar size={24} />,
      label: "About",
      route: "/about",
      isActive: activeSection === "about",
    },
  ];

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <nav className="w-full overflow-x-auto">
      <div className="flex gap-4 p-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`flex flex-col items-center min-w-[80px] p-4 rounded-xl cursor-pointer transition-colors
              ${category.isActive ? "bg-card-foreground text-foreground" : "bg-card text-foreground"}`}
            onClick={() => handleNavigate(category.route)}
          >
            {category.icon}
            <span className="mt-2 text-sm">{category.label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
};
