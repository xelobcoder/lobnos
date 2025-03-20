'use client';
import * as React from "react";
import { Mylinks } from "./PrimeLinks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApplicationSettings } from "@/lib/ApplicationContext/useApplicationContext";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/lib/ThemeContext/ThemeContext";
// Add these imports
import { Search, Bell, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SubLink {
    title: string;
    link: string;
}

interface LinkItem {
    title: string;
    link: string;
    icon: React.ReactNode;
    subLinks: SubLink[];
}

const AppSideBar: React.FC = () => {
    const router = useRouter();
    const [activeGroup, setActiveGroup] = useState<number | null>(null);
    const { company, branchid } = useApplicationSettings().applicationsettings;
    const links = Mylinks(branchid) as LinkItem[];
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [notifications, setNotifications] = useState<number>(3);

    const handleGroupClick = (index: number) => {
        setActiveGroup(activeGroup === index ? null : index);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* First column - Icons only */}
            <div className={`${isCollapsed ? 'w-0' : 'w-16'} flex-shrink-0 flex flex-col ${isDark ? 'bg-[#202124] border-r border-gray-800' : 'bg-white border-r border-gray-200'} transition-all duration-300 overflow-hidden`}>
                <div className="p-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`${isDark ? 'text-gray-400 hover:text-gray-100' : 'text-gray-500 hover:text-gray-900'} rounded-full p-2`}
                        onClick={toggleTheme}
                    >
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                </div>
                
                <div className="flex-1 py-6 flex flex-col items-center gap-6">
                    <TooltipProvider>
                        {Array.isArray(links) && links.map((link, index) => (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`
                                            rounded-full p-2 h-12 w-12 transition-all duration-200
                                            ${isDark ? 
                                                'text-gray-300 hover:text-white hover:bg-gray-700' : 
                                                'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                                            }
                                            ${activeGroup === index && (
                                                isDark ? 
                                                    'bg-blue-600/20 text-blue-400 ring-2 ring-blue-500/40' : 
                                                    'bg-blue-100 text-blue-700 ring-2 ring-blue-500/40'
                                            )}
                                        `}
                                        onClick={() => handleGroupClick(index)}
                                    >
                                        <span className="h-6 w-6">{link.icon}</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="font-medium">
                                    <p>{link.title}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TooltipProvider>
                </div>
                
                <div className="mt-auto">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`
                                        rounded-full p-2 h-12 w-12 mx-auto mb-2
                                        ${isDark ? 'text-gray-400 hover:text-gray-100' : 'text-gray-500 hover:text-gray-900'}
                                    `}
                                >
                                    <Bell className="h-5 w-5" />
                                    {notifications > 0 && (
                                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                                            {notifications}
                                        </Badge>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Notifications</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`
                                        rounded-full p-2 h-12 w-12 mx-auto mb-2
                                        ${isDark ? 'text-gray-400 hover:text-gray-100' : 'text-gray-500 hover:text-gray-900'}
                                    `}
                                >
                                    <User className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>User Profile</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex justify-center">
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                            LIMS
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Add a toggle button */}
            <Button
                variant="ghost"
                size="icon"
                className={`
                    absolute top-3 ${isCollapsed ? 'left-3' : 'left-14'} z-10 h-8 w-8 rounded-full
                    ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} 
                    shadow-md transition-all duration-300
                `}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            
            {/* Second column - Content */}
            {activeGroup !== null && !isCollapsed && (
                <div className={`w-64 flex-shrink-0 flex flex-col ${isDark ? 'bg-[#202124] border-r border-gray-800' : 'bg-white border-r border-gray-200'} overflow-hidden`}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <div className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} text-lg mb-2`}>
                            {links[activeGroup]?.title || 'Menu'}
                        </div>
                        
                        {/* Add search functionality */}
                        <div className="relative">
                            <Search className={`absolute left-2 top-2.5 h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <Input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`pl-8 h-9 text-xs ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-100 border-gray-200'}`}
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 p-3 overflow-y-auto">
                        {links[activeGroup]?.subLinks.length > 0 ? (
                            links[activeGroup].subLinks.map((subLink, subIndex) => (
                                <Link 
                                    key={subIndex}
                                    href={subLink.link}
                                    className={`
                                        block py-2 px-3 text-xs rounded-md transition-colors duration-200 mb-2
                                        ${isDark ? 
                                            'text-gray-300 hover:text-gray-100 hover:bg-gray-800' : 
                                            'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    {subLink.title}
                                </Link>
                            ))
                        ) : (
                            <Button
                                variant="ghost"
                                className={`
                                    w-full text-left justify-start px-3 py-2 text-xs
                                    ${isDark ? 
                                        'text-gray-300 hover:text-gray-100 hover:bg-gray-800' : 
                                        'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                    }
                                `}
                                onClick={() => router.push(links[activeGroup]?.link || '/')}
                            >
                                Go to {links[activeGroup]?.title}
                            </Button>
                        )}
                    </div>
                </div>
            )}
            
            <div className="flex-1 overflow-hidden"></div>
        </div>
    );
};

export default AppSideBar;
