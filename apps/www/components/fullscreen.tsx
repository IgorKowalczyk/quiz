"use client";

import { ExpandIcon, MinimizeIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export default function FullScreen() {
 const [isFullscreen, setIsFullscreen] = useState(false);
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
  setMounted(true);

  const handleFullscreenChange = () => {
   setIsFullscreen(!!document.fullscreenElement);
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  return () => {
   document.removeEventListener("fullscreenchange", handleFullscreenChange);
  };
 }, []);

 if (!mounted) return null;

 const toggleFullscreen = () => {
  if (isFullscreen && document.fullscreenElement) {
   document.exitFullscreen();
  } else {
   document.documentElement.requestFullscreen();
  }
 };

 return (
  <div className={cn("fixed right-0 top-0 m-4 cursor-pointer", buttonVariants({ variant: "ghost", size: "icon" }))} onClick={toggleFullscreen}>
   {isFullscreen ? <MinimizeIcon /> : <ExpandIcon />}
  </div>
 );
}
