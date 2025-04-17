"use client";
import { SafeAsset} from "@/app/types";
import { useEffect } from "react";
interface TagsListProps {
  card:SafeAsset;
  index2: string;
};

const MTBFTags : React.FC<TagsListProps> = ({
  card,
    index2
}) => {
  useEffect(()=>{

  },[card])

if (card?.availability){
  
}else{
  return
}
// // let jsonO=JSON.parse(card?.availability as string);
// let jsonO= {}; // Or specify a more specific type if known

// try {
//   let val =card?.availability
//   jsonO = JSON.parse(val as string);
// } catch (error) {
//   console.error("Error parsing JSON:", error);
//   // Handle the error gracefully, e.g., provide a default value or log a warning
//   jsonO = {}; // Or another appropriate default
// }
  const availabilityString = card?.availability ?? ""; // Default to an empty string if undefined or null
  let jsonO: any = {}; // Or specify a more specific type if known
  try {
    jsonO = JSON.parse(availabilityString as string);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    // Handle the error appropriately, e.g., provide a default value or log a warning
  }
//console.log(`....${typeof(jsonO)} valeus: ${jsonO} keys: ${Object.keys(jsonO)}`)
  if (card?.availability){  
    return (
      <div className="flex flex-wrap gap-2 mt-1 shadow-lg rounded-sm" 
         key={index2 +'a'}
      > 
          {
            Object.entries(jsonO).map(([key,value]) => {
              return (
                  <span 
                    className="bg-gray-100 md:bg-gray-200 rounded-sm text-black text-[13px]" 
                    key={key}
                  > 
                   {key} {': '} {value as string}
                  </span>
                )
              })
          }
          
      </div> 
            
    );
  }else{
    return 
  }
};

export default MTBFTags
