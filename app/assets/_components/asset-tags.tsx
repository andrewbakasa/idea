"use client";

import { findLabelByValue} from "@/lib/utils";
import { SafeAsset, SafeCard, SafeCardWithBoard } from "@/app/types";
import { useEffect } from "react";
import { CardWithList2, SafeCardWithList2 } from "@/types";
import { Asset } from "@prisma/client";

interface TagsListProps {
  card:SafeAsset;
  setCategory: (category: string ) => void;
  tagNames:any;
  index2: string;
};

const CardTags : React.FC<TagsListProps> = ({
  card,
  setCategory,
  tagNames,
  index2
}) => {
  useEffect(()=>{

  },[card])

  if (card?.assetCatIDs){  
    return (
      <div className="flex flex-wrap gap-1 mt-1 shadow-lg rounded-sm" 
         key={index2 +'a'}
      > 
          {
              card.assetCatIDs?.map((tag, index) => {
                return (
                  <span 
                    className="bg-red-500 md:bg-red-500 rounded-sm text-white text-[13px]" key={index}
                    onClick={()=>{ setCategory(tag); }}
                  > 
                    {findLabelByValue(tagNames, tag)}
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

export default CardTags
