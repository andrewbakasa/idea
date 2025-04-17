"use client";

import { toast } from "sonner";
import { AlignLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useRef, ElementRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

import { useAction } from "@/hooks/use-action";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSubmit } from "@/components/form/form-submit";
import { Button } from "@/components/ui/button";
import { cn, isJsonStringEditorCompatible } from "@/lib/utils";
import 'react-calendar/dist/Calendar.css';
import { Separator } from "@radix-ui/react-separator";
import { differenceInDays, format, isValid } from "date-fns";

import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';

import { ACTION, Asset, Card, Comment, ENTITY_TYPE, Tag } from "@prisma/client";
import { createAudit } from "@/actions/create-audit-log";
import { useCardIDToRefreshStore } from "@/hooks/use-refreshedCard";
import { createAsset } from "@/actions/create-asset";
import { updateAsset } from "@/actions/update-asset";
import { FormTextarea } from "@/components/form/form-textarea";



interface AssetDataProps {
  data: Asset;
  setActivityViewMode:(value:boolean) => void;
};

export const AssetData = ({
  data,
  setActivityViewMode
}: AssetDataProps) => {
  // const params = useParams();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(true);
  const formRef = useRef<ElementRef<"form">>(null);
  // const textareaRef = useRef<ElementRef<"textarea">>(null);
  
  // const formRef = useRef<ElementRef<"form">>(null);
  const textareaCapacityRef = useRef<ElementRef<"textarea">>(null);
  
  const nameInputRef = useRef<ElementRef<"input">>(null);
  const assetNumInputRef = useRef<ElementRef<"input">>(null);
  

  const [nameInput, setNameInput] = useState<string>(data?.name||''); // Initial value
  const [assetNumInput, setAssetNumInput] = useState<string>(data?.asset_num||''); // Initial value

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
  

  const { execute:executeUpdate, fieldErrors } = useAction(updateAsset, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["asset", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["asset-logs", data.id]
      });
      toast.success(`Asset "${data.id}" updated`);
      // 
      //setCardIDToRefreshState(data.id);
     disableEditing();
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  const { execute:executeCreate} = useAction(createAsset, {
    onSuccess: (data) => {
      toast.success(`Asset created for ${data.id}`);
      formRef.current?.reset();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit =  (formData: FormData) => {
        const visible = Boolean(formData.get("visible"));
        const name = formData.get("name") as string;
        const capacity = formData.get("capacity") as string;
     
        const asset_num = formData.get("asset_num") as string;
     
        try {
             if (data){
              executeUpdate({
                id: data.id,
                asset_num,
                capacity,
                name
              })
        }else{
          executeCreate({
            asset_num,
            capacity,
            name
          })
        }
          }catch(e){
              toast.message(`${e}`)
          }
  };

  const today = new Date();
   const formattedDDate =data?.sed? format(data?.sed||today, 'EEE dd MMMM yyyy'):""; // Customize format as needed
  // const daysLeft = data?.dueDate? differenceInDays(data?.dueDate, today):-1;
  // const overDuestate = data?.dueDate? daysLeft>0?"left":"overdue":"NULL"
  // const dayOrDays =Math.abs(daysLeft)==1? 'day': 'days'
   const finalStatement ='dummy' //data?.sed?data.progress=='complete'?"Completed" :`[${Math.abs(daysLeft)} ${dayOrDays} ${overDuestate}]`:"N/A"

  const [isChecked, setIsChecked] = useState(data.status||false); // Default checked
  const [progressOption, setProgressOption] = useState(data.status|| "active") // Default checked
  

  
  
  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];
  const [dtVal, onChange] = useState<Value>(data.sed)//new Date());
  const [dtValCompleted, onChangeCompleted] = useState<Value>(data.purchaseDate)//new Date());



  const handleNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value; // Parse to number
      setNameInput(name);
  };

  
  const handleAssetNumInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value; // Parse to number
      setAssetNumInput(name);
  };
  
  
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setProgressOption(event.target.value);
  };


 
  const handleClearDate = () => {
    onChange(null);
    setCurrDate('Not Set');
  };
 
  const handleClearDate2 = () => {
    onChangeCompleted(null);
    setCurrDateCompleted('Not Set');
  };
  const [showPopup, setShowPopup] = useState(false);
  const [currDate, setCurrDate] = useState(data.sed?format(data.sed, 'EEE dd MMMM yyyy'): "Not Set");
  
  const handlePopupToggle = () => {
    setShowPopup(!showPopup);
  };

  
  const [showPopupCompleted, setShowPopupCompleted] = useState(false);
  const [currCompletedDate, setCurrDateCompleted] = useState(data.purchaseDate?format(data.purchaseDate, 'EEE dd MMMM yyyy'): "Not Set");
  
  const handlePopupToggleComplete = () => {
    setShowPopupCompleted(!showPopupCompleted);
  };

  const handleDateChangeDue = (value: any, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const date = value as Date;
    const currDate= format(value, 'EEE dd MMMM yyyy')
    setCurrDate(currDate)
    onChange(date);
    setShowPopup(false)
  };
  
  
  const handleDateChangeCompleted = (value: any, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const date = value as Date;
    const currCompletedDate= format(value, 'EEE dd MMMM yyyy')
    setCurrDateCompleted(currCompletedDate)
    onChangeCompleted(date);
    setShowPopupCompleted(false)
  };
 
  return (
    <div className="flex items-start gap-x-3 w-full">
      <AlignLeft className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="w-full">
        <p className="font-semibold text-neutral-700 mb-2">
          Asset Data
        </p>
        {isEditing ? (
          <form
            id="id1"
            name= "name1"
            action={onSubmit}
            ref={formRef}
            className="flex flex-col space-y-2 min-h-[30vh]"
          >
           <div  className="flex flex-col gap-y-1">
            {/* text */}
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
                      className="border w-[70%] "
                      onChange={handleAssetNumInputChange}
                      />
                </div>

                <div className="space-x-2">
                  <FormTextarea
                      id="capacity"
                      className="w-full mt-2 min-h-[108px] "
                      placeholder="Add asset capacity"
                      defaultValue={ data?.capacity|| ''}
                      // errors={fieldErrors}
                      ref={textareaCapacityRef}
                    /> 
                </div>

                
            </div>
           <div className="flex flex-col space-x-1">
                <div className="flex md:flex-row flex-col justify-between">
                  
                  <div 
                    role='button' 
                    onClick={handlePopupToggle}
                    className={cn(
                      `hover:text-sm`,                   
                      showPopup?"text-blue-500":"text-red-400"
                    )}
                  >
                      {showPopup?"Close Calender": isValid((new Date(String(dtVal))))?"Change Due-Date":"Set Due-Date"}
                  </div>
                  <span>{currDate}</span>
                  <div 
                    role='button'
                    className={cn(
                      `text-muted-foreground hover:text-sm`,                   
                      isValid((new Date(String(dtVal))))?"text-red-500":"text-gray-400"
                    )}
                      onClick={handleClearDate}                   
                   >
                    Clear Due-Date
                  </div>
                </div>
               
               <div className="calendar-container max-w-[90vw]">
                  {showPopup && ( <Calendar  onChange={handleDateChangeDue} className="max-w-[80vw]" showWeekNumbers value={dtVal} /> )}
                  
              </div>
            </div>
            <Separator/>
            <div className="flex flex-col space-x-1">
                <div className="flex md:flex-row flex-col justify-between">
                  
                  <div 
                    role='button' 
                    onClick={handlePopupToggleComplete}
                    className={cn(
                      `hover:text-sm`,                   
                      showPopupCompleted?"text-blue-500":"text-red-400"
                    )}
                  >
                      {showPopupCompleted?"Close Calender": isValid((new Date(String(dtValCompleted))))?"Change Date Completed":"Set Date Completed"}
                  </div>
                  <span>{currCompletedDate}</span>
                  <div 
                    role='button'
                    className={cn(
                      `text-muted-foreground hover:text-sm`,                   
                      isValid((new Date(String(dtValCompleted))))?"text-red-500":"text-gray-400"
                    )}
                      onClick={handleClearDate2}                   
                   >
                    Clear Date Completed
                  </div>
                </div>
               
               <div className="calendar-container max-w-[90vw]">
                  {showPopupCompleted && ( <Calendar  onChange={handleDateChangeCompleted} className="max-w-[80vw]" showWeekNumbers value={dtValCompleted} /> )}
                  
              </div>
            </div>
            <Separator/>
         
            </div>
           
            <Separator/>
          
            <div className="flex items-center gap-x-2">
              <FormSubmit>
                Save
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
                 className="static-editor min-h-[40vh] overflow-x-hidden overflow-y-auto"
                 onClick={enableEditing} 
              >
                 
              </div>
             {/* Put asset category her  */}
{/* 
              <div className="flex md:flex-row flex-col justify-between">
                  <div className="space-x-2">
                      <input 
                          id="visible" 
                          name="visible"
                          type="checkbox" 
                          ref={checkboxRef} 
                          checked={isChecked}
                          disabled={true} />
                      <label htmlFor="checkbox">Information is public</label>
                  </div>
                  <div className="flex flex-row space-x-2">
                    <label htmlFor="progress" className="italic">Progress:</label>
                    <span className="text-rose-500">{values[data?.progress as keyof typeof values]}</span>
                  </div>
              </div> */}
              <div className="flex md:flex-row flex-col justify-between">
                <div className="space-x-2 md:flex-row ">           
                  <label htmlFor="progress">SeD Date:</label>
                  <span className="text-rose-500">{formattedDDate} </span> 
                </div>
                <span className="text-gray-400 italic">{finalStatement}</span>
              </div>
              <div  
                  onClick={enableEditing} 
                  role="button"
                  className={cn("mt-2 text-sm",
                                isChecked?  "text-rose-500": "text-black/90")
                              }>
                  {isChecked? "Information is public and anyone may access it. Click to Change":"Information is private and available only to you. Click to Change"}
              </div>
             
            </>
        )}
      </div>
    </div>
  );
};

AssetData.Skeleton = function commentSkeleton() {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="w-24 h-6 mb-2 bg-neutral-200" />
        <Skeleton className="w-full h-[98px] bg-neutral-200" />
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
    console.log("pushing", el.text)
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