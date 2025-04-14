'use client';

import { checkIsNonEmptyArray } from "unsplash-js/dist/helpers/typescript";
import useIsMobile from "../hooks/isMobile";
import { cn } from "@/lib/utils";

interface HeadingProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

const Heading: React.FC<HeadingProps> = ({ 
  title, 
  subtitle,
  center
}) => {  
  const isMobile =  useIsMobile();

  return ( 
    <div className={center ? 'mb-0 text-center' : 'mb-0 text-start'}>
      <div className=" hidden md:block text-2xl font-bold">
        {title}
      </div>
      <div 
          className={cn(
                      "font-light text-neutral-500 mt-1",
                      isMobile?"text-2xl font-bold":"",
                    )}
          >
        {isMobile?title:subtitle}
      </div>
    </div>
   );
}
 
export default Heading;