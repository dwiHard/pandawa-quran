import React from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Clock, 
  Heart, 
  Star, 
  BookText, 
  Home,
  Info
} from "lucide-react";

interface MenuNavigationProps {
  activeSection: string;
}

export const MenuNavigation: React.FC<MenuNavigationProps> = ({ activeSection }) => {
  const menuItems = [
    { id: "home", label: "Home", path: "/quran-player", icon: <Home className="w-4 h-4" /> },
    { id: "juz30", label: "Quran", path: "/juz30", icon: <BookOpen className="w-4 h-4" /> },
    { id: "tafsir", label: "Tafsir", path: "/tafsir", icon: <Heart className="w-4 h-4" /> },
    { id: "prayer-times", label: "Prayer Times", path: "/prayer-times", icon: <Clock className="w-4 h-4" /> },
    { id: "asmaul-husna", label: "Asmaul Husna", path: "/asmaul-husna", icon: <Star className="w-4 h-4" /> },
    { id: "hadith", label: "Hadith", path: "/hadith", icon: <BookText className="w-4 h-4" /> },
    { id: "about", label: "About", path: "/about", icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <div className="mt-8 mb-6">
      <div className="bg-card rounded-xl shadow-md border border-border/50 p-2 overflow-x-auto">
        <div className="flex min-w-max">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`
                flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
                mx-1 first:ml-0 last:mr-0
              `}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
