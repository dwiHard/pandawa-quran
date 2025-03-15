"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { LucideIcon, MoreHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  activeOverride?: string
}

export function NavBar({ items, className, activeOverride }: NavBarProps) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Maximum number of visible items before showing "More"
  const MAX_VISIBLE_ITEMS = 4
  
  // Items to show in the main navbar
  const visibleItems = isDesktop ? items : items.slice(0, MAX_VISIBLE_ITEMS);
  
  // Items to show in the "More" menu
  const moreItems = items.slice(MAX_VISIBLE_ITEMS);

  // Check if we're on desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Set active tab based on current URL path or override
  useEffect(() => {
    if (activeOverride) {
      setActiveTab(activeOverride);
    } else {
      const currentPath = location.pathname;
      const activeItem = items.find(item => item.url === currentPath);
      if (activeItem) {
        setActiveTab(activeItem.name);
      } else {
        // Handle nested routes
        const matchingItem = items.find(item => 
          currentPath.startsWith(item.url) && item.url !== "/"
        );
        if (matchingItem) {
          setActiveTab(matchingItem.name);
        } else {
          // Default to first item if no match
          setActiveTab(items[0].name);
        }
      }
    }
  }, [location.pathname, items, activeOverride]);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMoreMenu(false);
    };
    
    if (showMoreMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMoreMenu]);

  const renderNavItem = (item: NavItem, isInMoreMenu = false) => {
    const Icon = item.icon;
    const isActive = activeTab === item.name;

    if (isDesktop || isInMoreMenu) {
      // Desktop or More menu item rendering
      return (
        <Link
          key={item.name}
          to={item.url}
          onClick={() => {
            setActiveTab(item.name);
            setShowMoreMenu(false);
          }}
          className={cn(
            "flex items-center transition-all duration-200",
            isDesktop 
              ? "px-4 py-2 rounded-lg text-sm font-medium" 
              : "",
            "text-foreground/60 hover:text-muted-foreground",
            isActive 
              ? isDesktop ? "bg-primary text-primary-foreground rounded-full" : "text-primary-foreground" 
              : isDesktop ? "hover:bg-muted/50" : "",
            isInMoreMenu && "justify-start w-full p-2"
          )}
        >
          <div className="relative mr-2">
            {isActive && !isInMoreMenu && isDesktop ? (
              <div className="absolute -inset-2 bg-primary/10 rounded-full -z-10 w-10 h-10">
                <motion.div 
                  layoutId="desktop-circle"
                  className="absolute inset-0 bg-primary/10 rounded-full"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              </div>
            ) : null}
            
            <Icon 
              size={isActive ? 24 : 20} 
              strokeWidth={isActive ? 2.5 : 2}
              className="transition-all duration-200"
            />
          </div>
          
          <span className={cn(
            "transition-all duration-200",
            isActive ? "opacity-100" : "opacity-70"
          )}>
            {item.name}
          </span>
        </Link>
      );
    } else {
      // Mobile item rendering
      return (
        <Link
          key={item.name}
          to={item.url}
          onClick={() => {
            setActiveTab(item.name);
            setShowMoreMenu(false);
          }}
          className={cn(
            "flex flex-col items-center justify-center px-2 py-1 transition-all duration-200",
            "text-foreground/60 hover:text-primary",
            isActive && "text-primary"
          )}
        >
          <div className="relative flex items-center justify-center mb-0.5 w-10 h-10">
            {isActive && (
              <motion.div 
                layoutId="mobile-circle"
                className="absolute inset-0 bg-primary/10 rounded-full"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />
            )}
            
            <Icon 
              size={isActive ? 22 : 18} 
              strokeWidth={isActive ? 2.5 : 2}
              className="transition-all duration-200 z-10"
            />
          </div>
          
          <span className={cn(
            "text-[9px] font-medium transition-all duration-200 text-center",
            isActive ? "opacity-100" : "opacity-70"
          )}>
            {item.name}
          </span>
        </Link>
      );
    }
  };

  return (
    <div
      className={cn(
        "fixed z-50",
        isDesktop 
          ? "top-0 left-0 right-0 pt-4 pb-2 px-4" 
          : "bottom-0 left-0 right-0 px-4 pb-1 pt-1",
        className,
      )}
    >
      <div className={cn(
        "mx-auto bg-background/90 border border-border backdrop-blur-lg shadow-lg",
        isDesktop 
          ? "max-w-3xl rounded-xl py-2 px-2" 
          : "max-w-lg rounded-2xl py-1 px-1"
      )}>
        <div className="flex items-center justify-between">
          {visibleItems.map(item => renderNavItem(item))}
          
          {!isDesktop && moreItems.length > 0 && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoreMenu(!showMoreMenu);
                }}
                className="flex flex-col items-center justify-center px-2 py-1 transition-all duration-200 text-foreground/60 hover:text-primary"
              >
                <div className="relative flex items-center justify-center mb-0.5 w-10 h-10">
                  <MoreHorizontal size={18} />
                </div>
                <span className="text-[9px] font-medium opacity-70">More</span>
              </button>
              
              {showMoreMenu && (
                <div className="absolute bottom-14 right-0 bg-background border border-border rounded-lg shadow-lg p-2 min-w-[150px]">
                  <div className="flex flex-col space-y-1">
                    {moreItems.map(item => renderNavItem(item, true))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 