"use client";

import { useEffect, useState } from "react";
import QRCodeLib from "qrcode";
import { cn } from "@/app/infra/lib/utils";
import { Home } from "lucide-react";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
  showLogo?: boolean;
}

export function QRCode({
  value,
  size = 200,
  className,
  darkColor = "#10b981", // Emerald-500 default
  lightColor = "#000000", // Dark background for contrast
  showLogo = true,
}: QRCodeProps) {
  const [qrSvg, setQrSvg] = useState<string>("");

  useEffect(() => {
    async function generateQRCode() {
      try {
        let svg = await QRCodeLib.toString(value, {
          type: "svg",
          errorCorrectionLevel: "H", // High error correction to allow logo overlay
          width: size,
          margin: 1,
          color: {
            dark: darkColor,
            light: lightColor,
          },
        });
        
        // Clean up SVG string for dangerouslySetInnerHTML
        svg = svg.replace(/<\?xml.*\?>/g, "");
        setQrSvg(svg);
      } catch (err) {
        console.error("QRCODE_COMP: Failed to generate QR Code:", err);
      }
    }

    if (value) {
      generateQRCode();
    } else {
      console.warn("QRCODE_COMP: No value provided to QRCode component");
    }
  }, [value, size, darkColor, lightColor]);

  if (!qrSvg) {
    return (
      <div
        className={cn("bg-zinc-800 animate-pulse rounded-lg", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center p-2 bg-black/50 rounded-xl border border-emerald-500/10 backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
      {showLogo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="bg-black p-1.5 rounded-lg border border-emerald-500/30 shadow-xl"
            style={{ width: size * 0.25, height: size * 0.25 }}
          >
            <div className="w-full h-full flex items-center justify-center bg-emerald-500/10 rounded-md">
              <Home size={size * 0.15} className="text-emerald-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRCode;
