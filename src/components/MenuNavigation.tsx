import React from "react";
import {
  SunMoon,
  Sun,
  CloudSun,
  Moon,
  SunDim,
  MoonStar,
} from "lucide-react";
type CategoryItem = {
  id: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
};
const categories: CategoryItem[] = [
  {
    id: "1",
    icon: <CloudSun size={24} />,
    label: "Juz 30",
  },
  {
    id: "2",
    icon: <Sun size={24} />,
    label: "Jadwal Sholat",
  },
  {
    id: "3",
    icon: <SunDim size={24} />,
    label: "Do'a Harian",
    isActive: true,
  },
  {
    id: "4",
    icon: <SunMoon size={24} />,
    label: "Asmaul Husna",
  },
  {
    id: "6",
    icon: <Moon size={24} />,
    label: "Hadits",
  },
  {
    id: "6",
    icon: <MoonStar size={24} />,
    label: "About",
  },
];
export const MenuNavigation = () => {
  return (
    <nav className="w-full overflow-x-auto">
      <div className="flex gap-4 p-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`flex flex-col items-center min-w-[80px] p-4 rounded-xl cursor-pointer transition-colors
              ${category.isActive ? "bg-card-foreground text-foreground" : "bg-card text-foreground"}`}
          >
            {category.icon}
            <span className="mt-2 text-sm">{category.label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
};

