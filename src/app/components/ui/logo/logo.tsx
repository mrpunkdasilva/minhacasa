import Image from "next/image";
import ImgLogo from "../../../assets/images/logo.svg";

interface LogoCompProps {
    isAnimated?: boolean;
    className?: string;
}

export function LogoComponent({ isAnimated, className }: LogoCompProps) {
    if (isAnimated) {
        return (
            <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
            >
                <style>
                    {`
            @keyframes gradientFlow {
              0% { stop-color: #6366F1; }
              50% { stop-color: #A855F7; }
              100% { stop-color: #10B981; }
            }

            @keyframes advancedDraw {
              0% { stroke-dashoffset: 800; }
              100% { stroke-dashoffset: 0; }
            }

            @keyframes organicGrow {
              0% { transform: scaleY(0); opacity: 0; }
              70% { transform: scaleY(1.1); opacity: 1; }
              100% { transform: scaleY(1); opacity: 1; }
            }

            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }

            @keyframes pulseOpacity {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 0.6; }
            }

            .main-structure {
              stroke-dasharray: 800;
              stroke-dashoffset: 800;
              animation: advancedDraw 3s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
            }

            .canvas-float {
              animation: float 4s ease-in-out infinite;
            }

            .bar {
              transform-origin: 100px 150px;
              opacity: 0;
              animation: organicGrow 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite alternate;
            }

            .bar-1 { animation-delay: 0.4s; }
            .bar-2 { animation-delay: 0.6s; }
            .bar-3 { animation-delay: 0.8s; }

            .roof-accent {
              animation: pulseOpacity 3s ease-in-out infinite;
            }

            .stop-1 { animation: gradientFlow 5s infinite alternate; }
            .stop-2 { animation: gradientFlow 5s infinite alternate-reverse; }
          `}
                </style>

                <defs>
                    <linearGradient id="advanced-gradient-v2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop className="stop-1" offset="0%" stopColor="#6366F1" />
                        <stop className="stop-2" offset="100%" stopColor="#10B981" />
                    </linearGradient>
                </defs>
                
                <g className="canvas-float">
                    <path 
                        className="main-structure" 
                        d="M100 35L165 85V150C165 158.284 158.284 165 150 165H50C41.7157 165 35 158.284 35 150V85L100 35Z" 
                        stroke="url(#advanced-gradient-v2)" 
                        strokeWidth="12" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                    
                    <rect className="bar bar-1" x="72" y="115" width="14" height="25" rx="7" fill="url(#advanced-gradient-v2)" />
                    <rect className="bar bar-2" x="93" y="95" width="14" height="45" rx="7" fill="url(#advanced-gradient-v2)" />
                    <rect className="bar bar-3" x="114" y="105" width="14" height="35" rx="7" fill="url(#advanced-gradient-v2)" />

                    <path 
                        className="roof-accent" 
                        d="M60 85L100 55L140 85" 
                        stroke="url(#advanced-gradient-v2)" 
                        strokeWidth="4" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        opacity="0.3" 
                    />
                </g>
            </svg>
        );
    }

    return (
        <Image
            src={ImgLogo}
            alt="MinhaCasa Logo"
            width={200}
            height={200}
            priority
            className={className}
        />
    );
}

export default LogoComponent;
