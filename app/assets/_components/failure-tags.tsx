"use client";

import { findLabelByValue} from "@/lib/utils";
import { SafeAsset, SafeCard, SafeCardWithBoard, SafeFailure } from "@/app/types";
import { useEffect } from "react";
import { CardWithList2, SafeCardWithList2 } from "@/types";
import { Asset } from "@prisma/client";

interface TagsListProps {
  card:SafeFailure;
  setFailureCategory: (category: string ) => void;
  tagNames:any;
  index2: string;
};

const FailureTags : React.FC<TagsListProps> = ({
  card,
  setFailureCategory,
  tagNames,
  index2
}) => {
  useEffect(()=>{

  },[card])

  if (card?.failureTagIDs){  
    return (
      <div className="flex flex-wrap gap-1 mt-1 rounded-sm" 
         key={index2 +'a'}
      > 
          {
              card.failureTagIDs?.map((tag, index) => {
                return (
                  <span 
                    className="bg-green-500 md:bg-green-500 rounded-sm text-white text-[13px]" key={index}
                    onClick={()=>{ setFailureCategory(tag); }}
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

export default FailureTags
