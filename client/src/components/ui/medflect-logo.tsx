import { Link } from "wouter";
import { Stethoscope, Monitor } from "lucide-react";

interface MedflectLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  showText?: boolean;
  className?: string;
}

export default function MedflectLogo({ 
  size = "md", 
  variant = "dark", 
  showText = true,
  className = ""
}: MedflectLogoProps) {
  const sizeClasses = {
    sm: {
      container: "w-8 h-8",
      stethoscope: "w-4 h-4",
      monitor: "w-5 h-5",
      text: "text-sm",
      tagline: "text-xs"
    },
    md: {
      container: "w-10 h-10",
      stethoscope: "w-5 h-5",
      monitor: "w-6 h-6",
      text: "text-xl",
      tagline: "text-xs"
    },
    lg: {
      container: "w-16 h-16",
      stethoscope: "w-8 h-8",
      monitor: "w-10 h-10",
      text: "text-4xl md:text-6xl",
      tagline: "text-lg"
    }
  };

  const currentSize = sizeClasses[size];
  const isDark = variant === "dark";
  const isLight = variant === "light";

  return (
    <Link href="/" className={`flex items-center space-x-3 group cursor-pointer transition-all hover:scale-105 ${className}`} data-testid="medflect-logo">
      <div className={`${currentSize.container} ${
        isDark ? 'bg-medical-blue-500' : 'bg-white/20 backdrop-blur-sm'
      } rounded-lg flex items-center justify-center relative overflow-hidden`}>
        {/* Monitor/Computer Screen - Technology symbol as base */}
        <Monitor className={`${currentSize.monitor} ${
          isDark ? 'text-white' : 'text-white'
        } absolute`} />
        
        {/* Stethoscope - Medical symbol displayed on the screen */}
        <Stethoscope className={`${size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-3 h-3' : 'w-2 h-2'} ${
          isDark ? 'text-white' : 'text-white'
        } absolute`} />
      </div>
      
      {showText && (
        <div className="group-hover:text-medical-blue-600 transition-colors">
          <h1 className={`font-bold ${currentSize.text} ${
            isDark ? 'text-clinical-gray-900' : isLight ? 'text-white' : 'text-clinical-gray-900'
          }`}>
            MEDFLECT
          </h1>
          <p className={`${currentSize.tagline} ${
            isDark ? 'text-clinical-gray-500' : isLight ? 'text-medical-blue-100' : 'text-clinical-gray-400'
          }`}>
            AI Clinical Intelligence
          </p>
        </div>
      )}
    </Link>
  );
}