"use client";

import { MoonIcon, PaintbrushIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal } from "@/components/ui/dropdown-menu";

const availableThemes = [
 {
  name: "Orange",
  value: "orange",
  color: "bg-orange-500",
 },
 {
  name: "Yellow",
  value: "yellow",
  color: "bg-yellow-500",
 },
 {
  name: "Green",
  value: "green",
  color: "bg-green-500",
 },
 {
  name: "Purple",
  value: "purple",
  color: "bg-purple-500",
 },
 {
  name: "Red",
  value: "red",
  color: "bg-red-500",
 },
];

export default function ThemeSwitcher() {
 const { setTheme, theme: currentTheme } = useTheme();
 const [mounted, setMounted] = useState(false);

 useEffect(() => setMounted(true), []);
 if (!mounted) return null;

 function changeTheme(theme: string, keepTheme = false) {
  if (!currentTheme) return;

  const isDark = currentTheme.includes("dark");
  const currentAccent = currentTheme.replace("dark-", "").replace("light-", "");

  if (keepTheme) {
   if (theme === "light") {
    setTheme(`light-${currentAccent}`);
   } else if (theme === "dark") {
    setTheme(`dark-${currentAccent}`);
   }
  } else if (isDark) {
   setTheme(`dark-${theme}`);
  } else {
   setTheme(`light-${theme}`);
  }
 }

 return (
  <DropdownMenu>
   <DropdownMenuTrigger asChild>
    <Button variant={"ghost"} size={"icon"} className="fixed left-0 top-0 m-4 cursor-pointer">
     <SunMoonIcon />
    </Button>
   </DropdownMenuTrigger>
   <DropdownMenuContent>
    <DropdownMenuItem onClick={() => changeTheme("light", true)}>
     <SunIcon />
     <span>Light</span>
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => changeTheme("dark", true)}>
     <MoonIcon />
     <span>Dark</span>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuSub>
     <DropdownMenuSubTrigger>
      <PaintbrushIcon className="mr-2 size-4" />
      <span>Accent</span>
     </DropdownMenuSubTrigger>
     <DropdownMenuPortal>
      <DropdownMenuSubContent>
       {availableThemes.map((theme) => (
        <DropdownMenuItem key={theme.value} onClick={() => changeTheme(theme.value)}>
         <div className={`mr-2 size-4 rounded-full ${theme.color}`} />
         <span>{theme.name}</span>
        </DropdownMenuItem>
       ))}
      </DropdownMenuSubContent>
     </DropdownMenuPortal>
    </DropdownMenuSub>
   </DropdownMenuContent>
  </DropdownMenu>
 );
}
