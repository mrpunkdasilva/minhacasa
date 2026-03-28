import Image from "next/image";
import ImgLogo from "../../../../assets/images/logo.svg";
import ImgLogoAnimated from "../../../../assets/images/logo-animated.svg";
import { LogoCompProps } from "@/app/view/components/ui/logo/props";

import { cn } from "@/app/infra/lib/utils";

export function LogoComponent({ isAnimated, className, w, h }: LogoCompProps) {
  const selectCorrectLogo = isAnimated ? ImgLogoAnimated : ImgLogo;

  const width = w ?? (h ?? 200);
  const height = h ?? (w ?? 200);

  return (
    <Image
      src={selectCorrectLogo}
      alt="MinhaCasa Logo"
      width={width}
      height={height}
      priority
      className={cn("w-auto h-auto", className)}
      style={{
        width: w ?? undefined,
        height: h ?? undefined,
      }}
    />
  );
}

export default LogoComponent;
