"use client";

import { useQuery } from "@tanstack/react-query";

import { fetcher } from "@/lib/fetcher";
import { Failure } from "@prisma/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FailureData } from "./failureData";
import { useState } from "react";
import { Separator } from "@radix-ui/react-separator";

import { NewFailureData } from "./createNewFailure";;
import { TagList } from "./add-tags";
import { useFailureModal } from "@/hooks/use-failure-modal";
import { useFailureCatLabelValueStore } from "@/hooks/use-failureCatLabelValue";
export const FailureModal = () => {
  //id not avialable insert a dummy id
  const id = useFailureModal((state) => {return state.id? state.id: null
    //"65c91a9a001eefed4bdacc62"  
  });
  const assetId = useFailureModal((state) => {return state.assetId? state.assetId: ''
    //"65c91a9a001eefed4bdacc62"  
  });
  const isOpen = useFailureModal((state) => state.isOpen);
  const onClose = useFailureModal((state) => state.onClose);
  const [activityViewMode,setActivityViewMode]=useState(true)

  const {failureCatList}=useFailureCatLabelValueStore();


  const { data: failureData, isLoading, error } = useQuery<Failure | null>({
    queryKey: ["failure", assetId],
    queryFn: () => 
      id ? fetcher(`/api/failures/${id}`) : Promise.resolve(null),
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
              {id==null?<NewFailureData
                      setActivityViewMode={setActivityViewMode}
                      assetId={assetId}
                    />: !failureData
                ? <FailureData.Skeleton />
                : <>
                    <FailureData 
                      data={failureData}
                      assetId={assetId}
                      setActivityViewMode={setActivityViewMode} 
                    />
                    {/* <FailureData data={}/> */}
                    <Separator/>

                    
                   <TagList
                      data={failureData}
                      assetId={assetId}   
                      tagNames ={failureCatList}
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
