"use client";

import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ThemeSwitcher() {
 const { setTheme } = useTheme();
 const [mounted, setMounted] = useState(false);

 useEffect(() => setMounted(true), []);
 if (!mounted) return null;

 return (
  <DropdownMenu>
   <DropdownMenuTrigger asChild>
    <Button variant={"ghost"} size={"icon"} className="fixed top-0 left-0 m-4 cursor-pointer">
     <SunMoonIcon />
    </Button>
   </DropdownMenuTrigger>
   <DropdownMenuContent>
    <DropdownMenuItem onClick={() => setTheme("light")}>
     <SunIcon />
     <span>Light</span>
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => setTheme("dark")}>
     <MoonIcon />
     <span>Dark</span>
    </DropdownMenuItem>
   </DropdownMenuContent>
  </DropdownMenu>
 );
}
