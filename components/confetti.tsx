"use client";

import { CreateTypes } from "canvas-confetti";
import canvasConfetti from "canvas-confetti";
import React, { useEffect, useRef } from "react";

export default function Confetti() {
 const canvasRef = useRef<HTMLCanvasElement | null>(null);
 const confetti = useRef<CreateTypes | null>(null);

 useEffect(() => {
  if (!canvasRef.current) return;

  confetti.current = canvasConfetti.create(canvasRef.current, {
   resize: true,
   useWorker: false,
  });

  confetti.current({
   particleCount: 100,
   spread: 70,
   origin: { y: 0.6 },
  });

  return () => {
   confetti.current?.reset();
  };
 }, []);

 return (
  <>
   <canvas
    ref={canvasRef}
    style={{
     position: "fixed",
     pointerEvents: "none",
     width: "100%",
     height: "100%",
     top: 0,
     left: 0,
    }}
   />
  </>
 );
}
