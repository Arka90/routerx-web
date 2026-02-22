"use client";
import React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({ 
  text, 
  disabled = false, 
  speed = 5, 
  className = "" 
}) => {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`relative inline-block overflow-hidden ${disabled ? "" : "animate-shiny"} ${className}`}
      style={{
        backgroundImage: "linear-gradient(120deg, #a1a1aa 40%, #ffffff 50%, #a1a1aa 60%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        animationDuration: animationDuration,
        backgroundRepeat: "no-repeat",
        WebkitTextFillColor: "transparent",
      }}
    >
      {text}
    </span>
  );
};
