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

import { ACTION, Asset, Card, Comment, ENTITY_TYPE, Failure, Tag } from "@prisma/client";
import { createAudit } from "@/actions/create-audit-log";
import { FormTextarea } from "@/components/form/form-textarea";
import { createFailure } from "@/actions/create-failure";
import { updateFailure } from "@/actions/update-failure";



interface FailureDataProps {
  data: Failure;
  assetId:string
  setActivityViewMode:(value:boolean) => void;
};

export const FailureData = ({
  data,
  assetId,
  setActivityViewMode
}: FailureDataProps) => {
  // const params = useParams();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(true);
  const formRef = useRef<ElementRef<"form">>(null);

  const textareaDescriptionRef = useRef<ElementRef<"textarea">>(null);
  
  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];
  
  const today = new Date();
  const formattedDDate =data?.occurrenceDate? format(data?.occurrenceDate||today, 'EEE dd MMMM yyyy'):""; // Customize format as needed
  const daysLeft = data?.resolutionDate? differenceInDays(data?.resolutionDate, today):-1;
  const overDuestate = data?.resolutionDate? daysLeft>0?"left":"overdue":"NULL"
  const dayOrDays =Math.abs(daysLeft)==1? 'day': 'days'
  const formatedResolutionDate =data?.resolutionDate?format(data?.resolutionDate, 'EEE dd MMMM yyyy'):"N/A"

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
  

  const { execute:executeUpdate, fieldErrors } = useAction(updateFailure, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["asset", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["asset-logs", data.id]
      });
      toast.success(`Failure "${data.id}" updated`);
      // 
      //setCardIDToRefreshState(data.id);
     disableEditing();
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  const { execute:executeCreate} = useAction(createFailure, {
    onSuccess: (data) => {
      toast.success(`Failure record created for ${data.id}`);
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
              executeUpdate({
                id: data.id,
                description,
                occurrenceDate,
                resolutionDate,
                assetId
              })
          }else{
              executeUpdate({
                id: data.id,         
                description,
                occurrenceDate,
                assetId
 
              })
          }
        }else {
          if (isValid(resolutionDate)){
              executeUpdate({
                id: data.id,
                description,
                resolutionDate,
                assetId
 
              })
          }else{
              executeUpdate({
                id: data.id,
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
  const [currDate, setCurrDate] = useState(data.occurrenceDate?format(data.occurrenceDate, 'EEE dd MMMM yyyy'): "Not Set");
  // const [currDate, setCurrDate] = useState( "Not Set");
  
  const handlePopupToggle = () => {
    setShowPopup(!showPopup);
  };

  
  const [showPopupCompleted, setShowPopupCompleted] = useState(false);
   const [currCompletedDate, setCurrDateCompleted] = useState(data.resolutionDate?format(data.resolutionDate, 'EEE dd MMMM yyyy'): "Not Set");
  // const [currCompletedDate, setCurrDateCompleted] = useState("Not Set");
  
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
       
       
       
          

              {/* 1 */}
            <div className="flex md:flex-col flex-col">
            
                <label htmlFor="name">Failure Mode</label>
                <div className="space-x-2">
                  <FormTextarea
                      id="description"
                      className="w-full mt-2 min-h-[108px] "
                      placeholder="Add Failure description"
                      defaultValue={data?.description|| ''}
                      // errors={fieldErrors}
                      ref={textareaDescriptionRef}
                    /> 
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
              <div className="flex md:flex-col flex-col">
                <label htmlFor="name">Failure Mode</label>
                <div className="space-x-2">
                  <FormTextarea
                      id="description"
                      className="w-full mt-2 min-h-[108px] "
                      placeholder="Add Failure description"
                      defaultValue={data?.description|| ''}
                      disabled={true}
                    /> 
                </div>
            </div>
        
              <div className="flex  flex-col justify-between">
                <div className="space-x-2 md:flex-row ">           
                  <label htmlFor="progress">Occurence Date</label>
                  <span className="text-rose-500">{formattedDDate} </span> 
                </div>

                <div className="space-x-2 md:flex-row ">           
                  <label htmlFor="progress">Resolution Date</label>
                  <span className="text-rose-500">{formattedDDate} </span> 
                </div>
            
             </div>
              
              <div  
                  onClick={enableEditing} 
                  role="button"
                  className={cn("mt-2 text-sm",
                                "text-rose-500")
                              }>
                  { "Click here to edit"}
              </div>
             
            </>
        )}
      </div>
    </div>
  );
};

FailureData.Skeleton = function commentSkeleton() {
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