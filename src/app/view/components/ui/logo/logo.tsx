import Image from "next/image";
import ImgLogo from "../../../../assets/images/logo.svg";
import ImgLogoAnimated from "../../../../assets/images/logo-animated.svg";
import { LogoCompProps } from "@/app/view/components/ui/logo/props";

export function LogoComponent({ isAnimated, className, w, h }: LogoCompProps) {
  const selectCorrectLogo = isAnimated ? ImgLogoAnimated : ImgLogo;

  return (
    <Image
      src={selectCorrectLogo}
      alt="MinhaCasa Logo"
      width={w ? w : 200}
      height={h ? h : 200}
      priority
      className={className}
    />
  );
}

export default LogoComponent;
