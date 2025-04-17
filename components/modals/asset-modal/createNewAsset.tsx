"use client";

import { toast } from "sonner";
import { AlignLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useRef, ElementRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

import { useAction } from "@/hooks/use-action";
import { CardWithList, CardWithList2, SafeCardWithList2 } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSubmit } from "@/components/form/form-submit";
import { Button } from "@/components/ui/button";
import { cn, isJsonStringEditorCompatible } from "@/lib/utils";
import 'react-calendar/dist/Calendar.css';
import { Separator } from "@radix-ui/react-separator";
import { differenceInDays, format, isValid } from "date-fns";

import { FormTextarea } from "@/components/form/form-textarea";

import dynamic from "next/dynamic";
import { ACTION, Card, Comment, ENTITY_TYPE, Tag } from "@prisma/client";
import { SafeCard } from "@/app/types";
import { createAudit } from "@/actions/create-audit-log";
import { useCardIDToRefreshStore } from "@/hooks/use-refreshedCard";
import { updateComment } from "@/actions/update-comment";
import { createComment } from "@/actions/create-comment";
import { createAsset } from "@/actions/create-asset";



interface AssetProps {
  setActivityViewMode:(value:boolean) => void;
};

export const NewAssetData = ({
  setActivityViewMode
}: AssetProps) => {
  // const params = useParams();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(true);
  const formRef = useRef<ElementRef<"form">>(null);
  const textareaCapacityRef = useRef<ElementRef<"textarea">>(null);
  
  const nameInputRef = useRef<ElementRef<"input">>(null);
  const assetNumInputRef = useRef<ElementRef<"input">>(null);
  

  const [nameInput, setNameInput] = useState<string>(); // Initial value
  const [assetNumInput, setAssetNumInput] = useState<string>(); // Initial value

  const handleNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value; // Parse to number
      setNameInput(name);
  };

  
  const handleAssetNumInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value; // Parse to number
      setAssetNumInput(name);
  };
  
  
  const enableEditing = () => {
    setIsEditing(true);
    setActivityViewMode(false)
    setTimeout(() => {
      textareaCapacityRef.current?.focus();
    });
  }

  const disableEditing = () => {
    setIsEditing(false);
    setActivityViewMode(true)
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
     // disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);
  
  
  const { execute:executeAudit, isLoading } = useAction(createAudit, {
    onSuccess: (data) => {
      toast.success(`Update AuditLog`);
      //console.log(data)
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  

  const { execute:executeCreate} = useAction(createAsset, {
    onSuccess: (data) => {
      toast.success(`Comment created for ${data.id}`);
      formRef.current?.reset();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit =  (formData: FormData) => {
    const name = formData.get("name") as string;
    const capacity = formData.get("capacity") as string;
 
    const asset_num = formData.get("asset_num") as string;
        try {
          executeCreate({
            asset_num,
            capacity,
            name
          })
        
        }catch(e){
              toast.message(`${e}`)
        }
  };

  
  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];
  
  

 
  
 
  return (
    <div className="flex items-start gap-x-3 w-full">
      <AlignLeft className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="w-full">
        <p className="font-semibold text-neutral-700 mb-2">
          New Asset
        </p>
          <form
            id="id1"
            name= "name1"
            action={onSubmit}
            ref={formRef}
            className="flex flex-col space-y-2 min-h-[30vh]"
          >
           <div  className="flex flex-col gap-y-1">
          

              {/* 1 */}
            <div className="flex md:flex-col flex-col justify-between gap-1">
                 <div className="space-x-2 flex flex-row justify-between">
                  <label htmlFor="name">Name</label>
                  <input 
                      id="name" 
                      name="name"
                      type="text" 
                      ref={nameInputRef} 
                      value={nameInput}
                      className="border w-[70%]"
                      onChange={handleNameInputChange}
                      />
                </div>

                <div className="space-x-2 flex flex-row justify-between">
                   <label htmlFor="name">Asset no.</label>
                  <input 
                      id="asset_num" 
                      name="asset_num"
                      type="text" 
                      ref={assetNumInputRef} 
                      value={assetNumInput}
                      className="border w-[70%]"
                      onChange={handleAssetNumInputChange}
                      />
                </div>

                <div className="space-x-2">
                  <FormTextarea
                      id="capacity"
                      className="w-full mt-2 min-h-[108px] "
                      placeholder="Add asset capacity"
                      defaultValue={""}// data.name|| ''
                      // errors={fieldErrors}
                      ref={textareaCapacityRef}
                    /> 
                </div>

                
            </div>
        

              {/* 2 */}
              {/* 3 */}

            </div>
           
            <Separator/>
          
            <div className="flex items-center gap-x-2">
              <FormSubmit>
                Save
              </FormSubmit>
              <Button
                type="button"
                // onClick={disableEditing}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </form>
      </div>
    </div>
  );
};



interface Data {
  text: string;
  // Add other properties as needed
}
interface UserData {
  blocks: Data[];
  // Add other properties as needed
}
export function getAllTextEntriesA(json_string: string) {

  let c : string []=[]// string array initialised empty
 
  //const data = json.loads(json_string)
  const userData = JSON.parse(json_string);
  //toast.error(`"----->${ userData}`)
  userData.forEach((el: { text: string; }, index: any)=> {
    // Code to be executed for each element
   // console.log("pushing", el.text)
    c.push(el.text)
   
  });
  const joinedString = c.join("\n");
  return joinedString
}
export function isValidJSON(str:string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}