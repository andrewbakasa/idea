"use client";

import { useQuery } from "@tanstack/react-query";

import { fetcher } from "@/lib/fetcher";
import { Asset, AuditLog, Comment, Tag } from "@prisma/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { Header } from "./header";
import { AssetData } from "./assetData";
import { Actions } from "./actions";
import { Activity } from "./activity";
import { useState } from "react";
import { Separator } from "@radix-ui/react-separator";

import { NewAssetData } from "./createNewAsset";
import { useAssetModal } from "@/hooks/use-asset-modal";
import { TagList } from "./add-tags";
import { useAssetCatLabelValueStore } from "@/hooks/use-assetCatLabelValue";
export const AssetModal = () => {
  //id not avialable insert a dummy id
  const id = useAssetModal((state) => {return state.id? state.id: null });
  
  const isOpen = useAssetModal((state) => state.isOpen);
  const onClose = useAssetModal((state) => state.onClose);
  const [activityViewMode,setActivityViewMode]=useState(true)

  const {assetCatList}=useAssetCatLabelValueStore();
 
  const { data: assetData, isLoading, error } = useQuery<Asset | null>({
    queryKey: ["asset", id],
    queryFn: () => 
      id ? fetcher(`/api/assets/${id}`) : Promise.resolve(null),
    enabled: !!id, // Enable the query only when id is truthy
  });


  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        {/* {!cardData
          ? <Header.Skeleton />
          : <Header data={cardData} boardId={boardId} />
        } */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4 max-h-[100vh] overflow-x-hidden overflow-y-auto">
          <div className="col-span-3">
            <div className="w-full space-y-2">
              {id==null?<NewAssetData
                      setActivityViewMode={setActivityViewMode} 
                    />: !assetData
                ? <AssetData.Skeleton />
                : <>
                    <AssetData 
                      data={assetData} 
                      setActivityViewMode={setActivityViewMode} 
                    />
                    <Separator/>

                    
                    <TagList
                      data={assetData}   
                      tagNames ={assetCatList}
                      setActivityViewMode={setActivityViewMode} 
                    />
                    <Separator/>

                  </>
              }
              {/* Hidden if in mobile */}
              {/*show Log only if not editing  */}
              {/* {activityViewMode  && <div className="hidden md:block ">
                {!auditLogsData
                  ? <Activity.Skeleton />
                  : <Activity items={auditLogsData} />
                }
              </div>} */}
            </div>
          </div>
          {/* {!commentData
            ? <Actions.Skeleton />
            : <Actions data={commentData} />
          } */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
