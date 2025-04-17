"use client";

import { Expand} from "lucide-react";
import {  
    useEffect,
  useState,
} from "react";

import { cn, getCardsFromSafeBoard, getColorFromPercent } from "@/lib/utils";


import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { SafeAsset, SafeUser } from "@/app/types";
import { SafeBoard2 } from "@/types";
import PrivacyButton from "@/app/components/PrivacyButton";
import CreatedAtUpdatedAt from "./updatedCreated";
import { Asset } from "@prisma/client";

interface PageViewProps {
  asset:SafeAsset;
  currentUser?: SafeUser | null,
  expand:()=>void;
};

export const CollapsedView : React.FC<PageViewProps> = ({
    asset,
    currentUser,
    expand,
  }) => {
  
// const[ cardListLocal, setCardListLocal] =useState(getCardsFromSafeBoard(board))
    
  useEffect(()=>{
    // setCardListLocal(getCardsFromSafeBoard(board))
  },[asset])             
  return (
            <div 
             className="p-1 flex flex-col shadow-lg  hover:border hover:border-primary rounded-lg cursor-pointer"
            >
                {/*1 column...... */}
                <div
                    className="flex  flex-col gap-1 px-2  w-full justify-start text-muted-foreground  text-sm hover:text-sm"
                >
                    {/* first
                    <div className="relative">
                        <Expand    
                            onClick={expand}
                            className="h-4 w-4  absolute top-3"
                        />
                    </div> */}
                    
                        {/*1. col First...  */}
                        <div
                            key={asset.id}
                            className='flex flex-col' 
                        >
                            <div 
                                className="relative flex flex-row"
                            >   
                                <> 
                                 
                                    <h4 className={cn("text-[16px] text-white bg-black mix-blend-difference mt-3",'px-9')}>{asset?.name}</h4>
                                
                                </>
                                <div className="absolute top-[1px] right-[18px]">
                                    <Expand    
                                        onClick={expand}
                                        className="h-5 w-5  absolute text-black"
                                    />
                                </div>
                            </div>
                           <span className="text-[9px] px-9 text-white bg-black mix-blend-difference ">{asset.serialNumber}</span>
                 
                        </div>
                    {/* Second */}
                    {/* <Avatar className="h-10 w-10 ml-4">
                        <AvatarImage src={board?.imageThumbUrl} />
                    </Avatar> */}
                    
                    {/* Third */}
                    {/* <span className="text-wrap p-5">{asset.name}</span> */}
                    
                </div>
            
                {/*2 column....  */}
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row">
                        <span className="px-[80px]  text-[10px]">
                            {asset.make} <span className="text-red-500 text-[11px]">{`; Failure records: `}{asset?.failures.length}</span>
                        </span>
                        {/* <span className="px-[80px]  text-[10px]">{'Test'}</span> */}
                    </div>
                    
                {/*2... far end */}
                    <div className='flex'>
                                <div className="flex flex-row"
                                >
                                    <span className="text-white bg-black mix-blend-difference">{asset.manufacturer}</span>
                                </div>
                                {/* {currentUser?.id == board?.userId 
                                    && <PrivacyButton 
                                            boardId={board.id}
                                            currentState={board.public} 
                                            currentUser={currentUser}
                                        /> 
                                } */}
                    </div>
                </div>
                {/* 3. col */}
                {/* <CreatedAtUpdatedAt               
                    createdAt={board?.createdAt} 
                    updatedAt={board?.updatedAt}
                /> */}

           </div>
            );
}