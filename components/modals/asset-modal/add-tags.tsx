"use client";

import { toast } from "sonner";
import { ElementRef, useRef, useState } from "react";
import { AlignLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { CardWithList2 } from "@/types";
import { useAction } from "@/hooks/use-action";
import { Skeleton } from "@/components/ui/skeleton";
import { FormInput } from "@/components/form/form-input";
import FilterSection from "@/app/components/FilterSection";

import { FormSubmit } from "@/components/form/form-submit";
import { Button } from "@/components/ui/button";
import { compareStringArrays, getLabelsAndValuesFromValues} from "@/lib/utils";
import { useCardIDToRefreshStore } from "@/hooks/use-refreshedCard";
import { updateAsset } from "@/actions/update-asset";
import { SafeAsset } from "@/app/types";
import { Asset } from "@prisma/client";

interface TagListProps {
  data: Asset;
  // boardId:string;
  setActivityViewMode:(value:boolean) => void;
  
  tagNames:any;
}

export const TagList = ({
  data,
  // boardId,
  setActivityViewMode,
  tagNames
}: TagListProps) => {
  const queryClient = useQueryClient()
  const labelsOnlyTagIDs = data.assetCatIDs;
  const originalA =getLabelsAndValuesFromValues(tagNames, data.assetCatIDs)

  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<"form">>(null);
  const [category,setCategory]=useState<string>('')
  const {setCardIDToRefreshState}=useCardIDToRefreshStore();
  
  const { execute, fieldErrors } = useAction(updateAsset, {
    onSuccess: (data: { id: string; name: string; }) => {
      queryClient.invalidateQueries({
        queryKey: ["card", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["card-logs", data.id]
      });
      toast.success(`Card "${data?.name}" updated`);
      // 
      setCardIDToRefreshState(data.id);
      disableEditing();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit =  (formData: FormData) => {
    const newCategory= category?.length==0?[]: category.split(',');
    const sameList = compareStringArrays(data.assetCatIDs,newCategory);
  
    const updatedList =(sameList==false)
    try {
            if (updatedList){
                
                execute({
                    id: data.id,
                    assetCatIDs:newCategory
                })
            }
        
    }catch(e){
        toast.message(`${e}`)
    }
  };
  const enableEditing = () => {
    setIsEditing(true);
    setActivityViewMode(false)
    
  }

  const disableEditing = () => {
    setIsEditing(false);
    setActivityViewMode(true)
  };

  return (
    <div className="flex items-start gap-x-3 w-full">
      <AlignLeft className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="w-full">
        <p className="font-semibold text-neutral-700 mb-2">
          Tag List
        </p>
        {isEditing ? (
          <form
            id="id1"
            name= "name1"
            action={onSubmit}
            ref={formRef}
            className="flex flex-col space-y-2 "
          >
            <FilterSection
                setCategory={(category) =>{ 
                          setCategory(category?category:'');
                                }}
                productCategories_options={tagNames}
                originalList={originalA}
                isDisabled={false}
                placeholder="Add Card tags.."
                category={labelsOnlyTagIDs.length>0?Array.from(labelsOnlyTagIDs).join(','):null}        
            /> 
            <div className="flex items-center gap-x-2">
              <FormSubmit>
                Update Tag List
              </FormSubmit>
              <Button
                type="button"
                onClick={disableEditing}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
        </form>
        ) : (
          <>
             <div 
                 className="static-editor  overflow-x-hidden overflow-y-auto"
                 onClick={enableEditing} 
              >
                <FilterSection
                    setCategory={(category) =>{ 
                              setCategory(category?category:'');
                     }}
                    productCategories_options={tagNames}
                    originalList={originalA}
                    isDisabled={true}
                    placeholder="Add Card tags..."               
                    category={labelsOnlyTagIDs.length>0?Array.from(labelsOnlyTagIDs).join(','):null}          
                />  
              </div>
           
              </>
        )}
      </div>
    </div>
  );
};

TagList.Skeleton = function HeaderSkeleton() {
  return (
    <div className="flex items-start gap-x-3 mb-6">
      <Skeleton className="h-6 w-6 mt-1 bg-neutral-200" />
      <div>
        <Skeleton className="w-24 h-6 mb-1 bg-neutral-200" />
        <Skeleton className="w-12 h-4 bg-neutral-200" />
      </div>
    </div>
  );
};