"use client";
import { cn, findLabelByValue, truncateString,} from "@/lib/utils";
import { useCardModal } from "@/hooks/use-card-modal";
import { Button } from "@/components/ui/button";
import { SafeBoard, SafeCard, SafeFailure, SafeUser } from "@/app/types";
import { AiFillEdit, AiFillLock } from "react-icons/ai";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useCommentModal } from "@/hooks/use-comment-modal";
import { useFailureModal } from "@/hooks/use-failure-modal";
import FailureTags from "./failure-tags";
import CreatedAtUpdatedAt from "./updatedCreated";

interface TopCardProps {
  data: SafeFailure;
  index: string;
//   listOwner?:string;
  isOwnerOrAdmin?:boolean
  currentUserId:string;
  assetId:string; 
  setFailureCategory: (failurecategory: string ) => void;
  tagNames:any;
  userNames:any;
//   compositeDecorator:any;
  currentUser?:SafeUser |null;
  pagnumber?:number|null
//   handlePageClick:(options: { selected: number })=> void
 
};

export const TopFailureCard = ({
  data,
  index,
//   listOwner='',
  isOwnerOrAdmin,
  currentUserId,
  assetId,
  tagNames,
  userNames,
  setFailureCategory,
//   compositeDecorator,
  currentUser,
  pagnumber
//   handlePageClick
}: TopCardProps) => {

//   const cardModal = useCardModal();
  
  const failureModal = useFailureModal();
  const editable=true// (listOwner==currentUserId) //list creator
  //||(data?.userId==currentUserId)  //card creator
  //|| isOwnerOrAdmin // board creator or admin

  useEffect(()=>{

  },[data])
 
 const editableIcon=editable? <span>
                  <AiFillEdit  
                      size={10} 
                      className="cursor-pointer h-4 w-4 hover:h-[18px] hover:w-[18px] hover:text-blue-600"
                  /> 
                </span>: <span>
                  <AiFillLock 
                      size={10} 
                      className="cursor-pointer h-5 w-5 hover:h-[18px] hover:w-[18px] hover:text-blue-600"
                  /> 
                </span>

       // const iamtagged= data.taggedUsers?.find(x=>x.userId==currentUserId)
       // const ihavecomment= data.comments?.find(x=>x.userId==currentUserId)
      //  const mycommentid =ihavecomment?.id||''
     
     return (          
        <div className="mt-3 border rounded-sm p-2">  
            {/*Headings....  */}
            <h5 
                key={index +'2'} 
                className='flex gap-2 text-sm font-bold '>{pagnumber!==null?`${Number(pagnumber)+1}. `:""}{truncateString(data.description,30)}</h5> 

           
         
            <div 
                className={cn(
                    "px-2 static-editor max-h-[50vh] overflow-x-hidden mb-1 rounded-sm",
                )}
                key={index+"3"}
            > 
            
    
                    <CreatedAtUpdatedAt 
                        createdAt={data?.createdAt} 
                        updatedAt={data?.updatedAt}/>

                    <FailureTags index2={String(index +'4')}  card={data} setFailureCategory={setFailureCategory} tagNames={tagNames}/>

                        {/* Contents */}
                            <div className="flex flex-col gap-1 mt-2">
                                <div className="flex gap-1  justify-start">
                                    {
                                    //Column 1..... Edit Records.....
                                    editable? 
                                        <div className="px-2 relative text-[11px]">
                                            <Button
                                                onClick={() =>{ failureModal.onOpen(data.id,assetId);}}
                                                className="absolute top-[-1px]  left-[-15px] h-auto  w-10 justify-end text-muted-foreground text-[11px] hover:text-sm"
                                                size="sm"
                                                variant="ghost"
                                            >
                                                { editableIcon}                   
                                            </Button>
                                        </div>
                                    :
                                        <div className="px-2 relative text-[11px]">
                                            <Button
                                                onClick={() =>{}}
                                                className="absolute top-[-1px]  left-[-15px] h-auto  w-10 justify-end text-muted-foreground text-[11px] hover:text-sm"
                                                size="sm"
                                                variant="ghost"
                                            >
                                                { editableIcon}                   
                                            </Button>
                                        </div>
                                    }
                                    <div className="mt-3 flex gap-1">
                                        <span className='flex gap-2 text-sm text-red-500 italic'>Failure Details</span>  
                                    </div>
                                    
                                    </div>   
                                    {/* 2. column */}
                                    <div className="mt-3 flex gap-1">
                                        <span className='flex gap-2 text-sm text-gray-700 italic'>Description:</span> 
                                        <span className='flex gap-2 text-sm text-gray-500 '>{data.description}</span> 
                                    </div>
                                       
                                        {/* 3. Column */}
                                        <div className=" flex gap-1">
                                                <span className='flex gap-2 text-sm text-gray-700 italic'>Failure Date:</span> 
                                                <span className='flex gap-2 text-sm text-gray-500 '>{data?.occurrenceDate?.toDateString()}</span> 
                                        </div>

                                        <div className=" flex gap-1">
                                                <span className='flex gap-2 text-sm text-gray-700 italic'>Resolved Date:</span> 
                                                <span className='flex gap-2 text-sm text-gray-500 '>{data?.resolutionDate?.toDateString()}</span> 
                                        </div>
                                                            
                            </div>
                        </div>

           
        </div>
  
  );
};