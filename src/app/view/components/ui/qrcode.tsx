"use client";

import { useEffect, useState } from "react";
import QRCodeLib from "qrcode";
import { cn } from "@/app/infra/lib/utils";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export function QRCode({
  value,
  size = 200,
  className,
  darkColor = "#10b981", // Emerald-500 default
  lightColor = "#000000", // Dark background for contrast
}: QRCodeProps) {
  const [qrSvg, setQrSvg] = useState<string>("");

  useEffect(() => {
    async function generateQRCode() {
      console.log("QRCODE_COMP: Generating for value:", value);
      try {
        let svg = await QRCodeLib.toString(value, {
          type: "svg",
          width: size,
          margin: 1,
          color: {
            dark: darkColor,
            light: lightColor,
          },
        });
        
        // Clean up SVG string for dangerouslySetInnerHTML
        svg = svg.replace(/<\?xml.*\?>/g, "");
        
        console.log("QRCODE_COMP: SVG length after clean:", svg.length);
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
      className={cn("flex items-center justify-center p-2 bg-white/5 rounded-xl border border-emerald-500/10 backdrop-blur-sm", className)}
      dangerouslySetInnerHTML={{ __html: qrSvg }}
    />
  );
}

export default QRCode;
