'use client';

import { cn } from "@/lib/utils";
import DebouncedInput from "./DebouncedInput";

interface SearchProps {
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchTerm?: string;
  placeholderText?:string,
  option?:boolean
  setSearchTerm: (value: string) => void;
  
}

const Search: React.FC<SearchProps> = ({ 
  handleSearch,
  setSearchTerm, 
  searchTerm,
  option=true,
  placeholderText
}) => {
  return ( 
   
    // <div className="flex flex-col items-center justify-center min-h-screen py-2">
     <div className="w-full max-w-lg min-w-[300px] md:w-[800px]">
        <div className={cn("flex  sm:mt-10 rounded-lg",
         option==true?'mt-1':'mt-0'
        )}>

          <DebouncedInput
            value={searchTerm}
            onChange={(value:string|number ) => setSearchTerm(String(value))}
            className={cn("w-full px-4 text-sm  py-2 focus:outline-none border-[1px] rounded-l-lg", 
            // option==true?'py-2':'py-0'
            )}
            placeholder={placeholderText?placeholderText:"Filter projects..."}
          />
          <button 
              onClick={()=>{setSearchTerm('')}}
              className="flex items-center justify-center px-4 bg-blue-500 rounded-r-lg"
          >
            <svg
                className="w-4 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <svg
              className="w-4 h-6 text-white"
              fill="currentColor"  viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 8v5a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8L12 5zM6 19h12a2 2 0 0 1 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 1-2 2zM10 11h4a1 1 0 0 1 0 2h-4a1 1 0 0 1-1-2z"
              />
            </svg>

          </button>
        </div>
    </div>
     
    // </div>
   );
}
 
export default Search;