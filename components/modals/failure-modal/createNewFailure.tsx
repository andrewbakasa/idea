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

import { ACTION, Card, Comment, ENTITY_TYPE, Tag } from "@prisma/client";
import { SafeCard } from "@/app/types";
import { createAudit } from "@/actions/create-audit-log";

import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import { createFailure } from "@/actions/create-failure";



interface FailureProps {
  setActivityViewMode:(value:boolean) => void;
  assetId:string
};

export const NewFailureData = ({
  setActivityViewMode,
  assetId
}: FailureProps) => {
  // const params = useParams();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(true);
  const formRef = useRef<ElementRef<"form">>(null);
  const textareaDescriptionRef = useRef<ElementRef<"textarea">>(null);
  
  const nameInputRef = useRef<ElementRef<"input">>(null);
  const assetNumInputRef = useRef<ElementRef<"input">>(null);
  

  const [nameInput, setNameInput] = useState<string>(); // Initial value
  const [assetNumInput, setAssetNumInput] = useState<string>(); // Initial value

  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];
  
  const [dtFail, onChange] = useState<Value>(new Date())//(data.dueDate)//;
  const [dtFailCompleted, onChangeCompleted] = useState<Value>(new Date())//(data.completedDate)//;
  

  
  const enableEditing = () => {
    setIsEditing(true);
    setActivityViewMode(false)
    setTimeout(() => {
      textareaDescriptionRef.current?.focus();
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
  

  const { execute:executeCreate} = useAction(createFailure, {
    onSuccess: (data) => {
      toast.success(`Failure created for ${data.id}`);
      formRef.current?.reset();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit =  (formData: FormData) => {
    const description = formData.get("description") as string;
    const occurrenceDate = new Date(String(dtFail))
    const resolutionDate = new Date(String(dtFailCompleted))


     try {
        if (isValid(occurrenceDate)) {
          if (isValid(resolutionDate)){
              executeCreate({
                description,
                occurrenceDate,
                resolutionDate,
                assetId
              })
          }else{
              executeCreate({
                description,
                occurrenceDate,
               // resolutionDate,
                assetId
 
              })
          }
        }else {
          if (isValid(resolutionDate)){
              executeCreate({
                description,
                resolutionDate,
                assetId
 
              })
          }else{
              executeCreate({
                description,
                assetId

              })
          }
        }

    
        }catch(e){
              toast.message(`${e}`)
        }
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
  // const [currDate, setCurrDate] = useState(data.dueDate?format(data.dueDate, 'EEE dd MMMM yyyy'): "Not Set");
  const [currDate, setCurrDate] = useState( "Not Set");
  
  const handlePopupToggle = () => {
    setShowPopup(!showPopup);
  };

  
  const [showPopupCompleted, setShowPopupCompleted] = useState(false);
  // const [currCompletedDate, setCurrDateCompleted] = useState(data.completedDate?format(data.completedDate, 'EEE dd MMMM yyyy'): "Not Set");
  const [currCompletedDate, setCurrDateCompleted] = useState("Not Set");
  
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
          New Failure
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
            <div className="flex md:flex-col flex-col">
            
                <label htmlFor="name">Failure Mode</label>
                <div className="space-x-2">
                  <FormTextarea
                      id="description"
                      className="w-full mt-2 min-h-[108px] "
                      placeholder="Add Failure description"
                      defaultValue={""}// data.name|| ''
                      // errors={fieldErrors}
                      ref={textareaDescriptionRef}
                    /> 
                </div>

                
            </div>
        
           </div>
           <Separator />
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
                      {showPopup?"Close Calender": isValid((new Date(String(dtFail))))?"Change Occurence-Date":"Set Occurence-Date"}
                  </div>
                  <span>{currDate}</span>
                  <div 
                    role='button'
                    className={cn(
                      `text-muted-foreground hover:text-sm`,                   
                      isValid((new Date(String(dtFail))))?"text-red-500":"text-gray-400"
                    )}
                      onClick={handleClearDate}                   
                   >
                    Clear Occurence-Date
                  </div>
                </div>
               
               <div className="calendar-container max-w-[90vw]">
                  {showPopup && ( <Calendar  onChange={handleDateChangeDue} className="max-w-[80vw]" showWeekNumbers value={dtFail} /> )}
                  
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
                      {showPopupCompleted?"Close Calender": isValid((new Date(String(dtFailCompleted))))?"Change Resolved-Date":"Set Resolved-Date"}
                  </div>
                  <span>{currCompletedDate}</span>
                  <div 
                    role='button'
                    className={cn(
                      `text-muted-foreground hover:text-sm`,                   
                      isValid((new Date(String(dtFailCompleted))))?"text-red-500":"text-gray-400"
                    )}
                      onClick={handleClearDate2}                   
                   >
                    Clear Resolved-Date
                  </div>
                </div>
               
               <div className="calendar-container max-w-[90vw]">
                  {showPopupCompleted && ( <Calendar  onChange={handleDateChangeCompleted} className="max-w-[80vw]" showWeekNumbers value={dtFailCompleted} /> )}
                  
              </div>
            </div>
           
          
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
