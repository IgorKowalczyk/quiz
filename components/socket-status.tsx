"use client";

import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { socket } from "@/lib/socket";

export default function SocketStatus() {
 const [isConnected, setIsConnected] = useState(false);
 const [ping, setPing] = useState<number | null>(null);

 const handleConnect = () => setIsConnected(true);
 const handleDisconnect = () => setIsConnected(false);

 useEffect(() => {
  setIsConnected(socket.connected);

  const sendPing = () => {
   const startTime = Date.now();
   socket.emit("ping", startTime);
  };

  const handlePong = (startTime: number) => {
   const latency = Date.now() - startTime;
   setPing(latency);
  };

  sendPing();

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);
  socket.on("pong", handlePong);

  const timer = setInterval(() => {
   if (socket.connected) sendPing();
  }, 5000);

  return () => {
   clearInterval(timer);
   socket.off("connect", handleConnect);
   socket.off("disconnect", handleDisconnect);
   socket.off("pong", handlePong);
  };
 }, []);

 return (
  <TooltipProvider delayDuration={10}>
   <Tooltip>
    <TooltipTrigger asChild>
     <div className={`fixed bottom-0 left-0 z-50 m-4 inline-block size-2 animate-pulse rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
    </TooltipTrigger>
    <TooltipContent>
     {isConnected
      ? `Connected to server. Ping: 
    ${ping ? `${ping}ms ` : "N/A"}
    
    `
      : "Disconnected from server"}
    </TooltipContent>
   </Tooltip>
  </TooltipProvider>
 );
}
