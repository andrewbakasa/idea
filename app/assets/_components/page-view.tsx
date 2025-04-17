"use client";
import {  
    useEffect,
  useState,
} from "react";

import { cn, getColorFromPercent } from "@/lib/utils";

import useIsMobile from "@/app/hooks/isMobile";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { SafeAsset, SafeUser } from "@/app/types";
import { useShowBGImageStore } from "@/hooks/use-showBGImage";
import { BiCollapse } from "react-icons/bi";
import { useCollapseStore } from "@/hooks/use-collapseState";
import { CollapsedView } from "./collapsed-view";
import CreatedAtUpdatedAt from "./updatedCreated";
import { useAssetModal } from "@/hooks/use-asset-modal";
import DeckFailures from "./deck-cards-failures";

import { Button } from "@/components/ui/button";
import { useFailureModal } from "@/hooks/use-failure-modal";
import AssetTags from "./card-tags";
import MTBFTags from "./asset-mtbf";

interface PageViewProps {
  asset:SafeAsset;
  currentUser?: SafeUser | null,
  index: number,
  assetTagNames:any,
  failureTagNames:any,
  userNames:any;
  setCategory: (category: string ) => void;
  setFailureCategory: (failurecategory: string ) => void;
  
  initialEditingState?:boolean;
};

export const PageView : React.FC<PageViewProps> = ({
    asset,
    currentUser,
    index,
    failureTagNames, 
    assetTagNames,
    userNames,
    setCategory,
    setFailureCategory,
    initialEditingState=false,
  }) => {
  
const [isCollapsed, setIsCollapsed] = useState(initialEditingState);

const failureModal = useFailureModal();

const assetModal = useAssetModal();
let personalBgColor='bg-sky-100';

const isMobile =  useIsMobile();

const {collapseState}=useCollapseStore();

useEffect(()=>{
    setIsCollapsed(collapseState)
},[collapseState])

const {showBGImage }= useShowBGImageStore();

const disableCollapse = () => {
  setIsCollapsed(false);
  //hit database if 
//   if currentUser?.taggedInboxIds.find(x=>x==)
};
const jsob= asset.mtbf
if (jsob){
  const kys=Object.keys(jsob)
  for (let key in kys){

  }
}
const enableCollapse = () => {
  setIsCollapsed(true);
  
};


  if (!isCollapsed) {
        return (
            <div
                className={cn(
                    "p-1 hover:border hover:border-primary rounded-lg cursor-pointer",
                    isMobile?'grid grid-cols-[0%_100%] ':'grid grid-cols-[0%_100%]',
                    // currentUser?.id == asset.userId?personalBgColor:'bg-gray-100',
                )}
            
            >
                
                <div
                    key={asset.id +'1'}
                    className='cursor-pointer z-50'//this was no visible until ontopdeck 
                    // onClick={()=>{handleToggleSelectUniqueasset(asset.id||'aaaaa')}}

                > 
                    <Avatar 

                        className="h-10 w-10 z-50"
                    >
                        {/* <AvatarImage src={asset?.imageThumbUrl} /> */}
                    </Avatar>
                </div> 
                {/* <Separator/> */}
                {/* <hr/> */}
                <div className='flex mt-0 flex-col gap-1 shadow-md px-2 bg-white  rounded-md'>
                    
                    <div
                        className="flex flex-col justify-between w-full bg-no-repeat bg-cover bg-center rounded-sm bg-white"
                        // style={showBGImage ? { backgroundImage: `url(${asset.imageThumbUrl})` } : undefined}
                    >
                      
                        {/*1. col First...  */}
                        <div
                            key={asset.id}
                            className='flex flex-col' 
                        >
                            <div 
                                className="relative flex flex-row"
                            >   
                                <div
                                    key={asset.id} 
                                   // href={`/asset/${asset.id}`} 
                                   onClick={() => assetModal.onOpen(asset.id)}
                            
                                 className='cursor-pointer'>   
                                    <h4 
                                      className={cn("font-bold text-[16px] text-white bg-black mix-blend-difference mt-3", isMobile?'px-0':'px-0')}
                                      onClick={() => assetModal.onOpen(asset.id)}
                            
                                     >{asset?.name}</h4>
                                </div>
                         
                                <div className="absolute top-[0px] right-0">
                                    <BiCollapse className="h-5 w-5  text-black"  
                                         onClick={enableCollapse} 
                                    />
                                </div>
                            </div>
                           {/* <span 
                              className="text-[9px] px-9 text-white bg-black mix-blend-difference "
                              onClick={() => assetModal.onOpen(asset.id)}
                              >{asset.name}</span> */}
                 
                        </div>
                        
                        {/*2. col Second.... */}
                        <div className='flex justify-end gap-1'>
                        <MTBFTags index2={String(index +'4')}  card={asset} 
                        //setCategory={setCategory} 
                        //tagNames={assetTagNames}
                        />

                            <div className="">
                             </div>
                        </div> 
                        {/* 3. col */}
                        <CreatedAtUpdatedAt               
                            createdAt={asset?.createdAt} 
                            updatedAt={asset?.updatedAt}
                        />
                        <AssetTags index2={String(index +'4')}  card={asset} setCategory={setCategory} tagNames={assetTagNames}/>

                     
                    </div>
                        
                    <div 
                        className=" w-full"
                    >
                        {/* <ProgressBar 
                            height={'3px'}
                            isLabelVisible={false}  
                            bgColor={getColorFromPercent(Number(asset.percent))} 
                            completed={Number(asset.percent)} 
                            className="mt-0 h-0.5"
                        /> */}
                        
                     <Button 
                        className="mt-2 h-auto px-2 py-1.5 max-w-[150px] justify-end text-muted-foreground text-[12px] hover:text-sm"
                        size="sm"
                        variant="secondary"
                        onClick={() => failureModal.onOpen('',asset.id)}
                    > Add New Failure
                   </Button>

                    </div>
                    <DeckFailures
                            index ={asset.id} 
                            key={index}
                            asset={asset} 
                            setFailureCategory={setFailureCategory}                             
                            failureTagNames={failureTagNames} 
                            userNames={userNames}
                            currentUser={currentUser}
                    /> 
                </div>
            </div> 
                    
        )
 };
                  
  return (
    <CollapsedView asset={asset} expand={disableCollapse} currentUser={currentUser}/>
    );
}
                    
