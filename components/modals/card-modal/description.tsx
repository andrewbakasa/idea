"use client";

import { toast } from "sonner";
import { AlignLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useRef, ElementRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

import { useAction } from "@/hooks/use-action";
import { updateCard } from "@/actions/update-card";
import { CardWithList } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSubmit } from "@/components/form/form-submit";
import { Button } from "@/components/ui/button";
import { cn, isJsonStringEditorCompatible } from "@/lib/utils";
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import { Separator } from "@radix-ui/react-separator";
import { differenceInDays, format, isValid } from "date-fns";

import { Editor as Editor2, EditorState, convertToRaw,
  convertFromRaw ,
  ContentState,
  convertFromHTML,
  //ContentBlock,
  //genKey
  //RichUtils
} from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';


import dynamic from "next/dynamic";
import { ACTION, Card, ENTITY_TYPE } from "@prisma/client";
import { SafeCard } from "@/app/types";
import { createAuditLog } from "@/lib/create-audit-log";
import { createAudit } from "@/actions/create-audit-log";


// const values:{
//  "not_started": "Not Started",
//  "wip":"WIP",
//  "stabbled":"Stabbled",
//  "complete":"Complete"
// }

type ProgressStatus = "not_started" | "wip" | "stabbled" | "complete";
type ProgressLabel = "Not Started" | "WIP" | "Stabbled" | "Complete";

const values: Record<ProgressStatus, ProgressLabel> = {
    "not_started": "Not Started",
    "wip": "WIP",
    "stabbled": "Stabbled",
    "complete": "Complete"
};

const Editor = dynamic(() => import('react-draft-wysiwyg').then(mod => mod.Editor), { ssr: false });



interface DescriptionProps {
  data: CardWithList;
  setActivityViewMode:(value:boolean) => void;
};

export const Description = ({
  data,
  setActivityViewMode
}: DescriptionProps) => {
  const params = useParams();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<"form">>(null);
  const textareaRef = useRef<ElementRef<"textarea">>(null);
  const checkboxRef = useRef<ElementRef<"input">>(null);
  
  let [note, setNote] = useState("")
  const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
   
  const enableEditing = () => {
    setIsEditing(true);
    setActivityViewMode(false)
    setTimeout(() => {
      textareaRef.current?.focus();
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
  //useOnClickOutside(formRef, disableEditing);
  let getNote = () => {
    if (data.description !==undefined && data.description !==null) {
        if (isJsonStringEditorCompatible(data?.description||"")){
            try {
                const DBEditorState = convertFromRaw(JSON.parse(data?.description||""));  
                setEditorState(EditorState.createWithContent(DBEditorState)); 
                setNote(JSON.stringify(DBEditorState))
            } catch {


                const placeholder= ''
                //toast.error("Your data has corrupt format. Please rewrite")
                // console.log('Data with errors:', data?.description)
                const { contentBlocks, entityMap } = convertFromHTML(placeholder);
                const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
                setEditorState(EditorState.createWithContent(contentState)); 
                setNote(JSON.stringify(contentState)) 
             /* 
              const obj={
                  "blocks":
                  [
                    {
                      "key":"4qp8q","text":"Induction conducted on 17 January in Workshop engineer offoce. ",
                      "type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}
                    },
                    {
                        "key":"3u2et","text":"Actvity now complete. CUT Mechantronics 2023","type":"unstyled","depth":0,
                        "inlineStyleRanges":[],"entityRanges":[],"data":{}
                    }
                  ],
                  "entityMap":{}
              } 
              */

                // try { 
                //     const obj2 =JSON.parse(data?.description||""); 
                //     //toast.error(`Check......${data?.description}`)
                //     const recoveredText= getAllTextEntriesA(obj2['blocks'])
                //     console.log('Recovered Text:', recoveredText)
                //     const { contentBlocks, entityMap } = convertFromHTML(recoveredText);
                //     const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
                //     setEditorState(EditorState.createWithContent(contentState)); 
                //     setNote(JSON.stringify(contentState))
                //     toast.error("Your data has corrupt format. Please recovering all your text unformated")
                //     console.log('Data with errors:', data?.description)

                // }catch (e) {
                //   const placeholder= ''
                //   //toast.error("Your data has corrupt format. Please rewrite")
                //   console.log('Data with errors:', data?.description)
                //   const { contentBlocks, entityMap } = convertFromHTML(placeholder);
                //   const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
                //   setEditorState(EditorState.createWithContent(contentState)); 
                //   setNote(JSON.stringify(contentState)) 
                // }
            }
           
        }else{
            //const processedHTML = DraftPasteProcessor.processHTML(data.description);
            const { contentBlocks, entityMap } = convertFromHTML(data.description);
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);    
            setEditorState(EditorState.createWithContent(contentState)); 
            setNote(JSON.stringify(contentState)) 
        }

    }else {
        const placeholder= ''
       
     
        const { contentBlocks, entityMap } = convertFromHTML(placeholder);
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        setEditorState(EditorState.createWithContent(contentState)); 
        setNote(JSON.stringify(contentState)) 
        
    }

  }
  useEffect(()=>{
    getNote()
  },[])
  
  const { execute:executeAudit, isLoading } = useAction(createAudit, {
    onSuccess: (data) => {
      toast.success(`Update AuditLog`);
      //console.log(data)
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  
  const { execute, fieldErrors } = useAction(updateCard, {
    onSuccess: (data: { id: string; title: string; visible: boolean; }) => {
      queryClient.invalidateQueries({
        queryKey: ["card", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["card-logs", data.id]
      });
      toast.success(`Card "${data.title}" updated`);
      disableEditing();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit =  (formData: FormData) => {
    const content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
    if (!isValidJSON(content)){
      toast.error('Note is no Valid Json')
      executeAudit({title:`${data.title} : Note is no Valid JSON`,id:data.id})
      return
    }

    const visible = Boolean(formData.get("visible"));
    const progress = formData.get("progress") as string;
    const boardId = params?.boardId as string;
    const dueDate = new Date(String(dtVal))
    const completedDate = new Date(String(dtValCompleted))
   
    if (isValid(dueDate)) {
       if (isValid(completedDate)){
              execute({
                id: data.id,
                description:content,
                progress,
                visible,
                boardId,
                dueDate,
                completedDate
              })
      }else{
            execute({
              id: data.id,
              description:content,
              progress,
              visible,
              boardId,
              dueDate 
            })
      }

    }else {
      if (isValid(completedDate)){
            execute({
              id: data.id,
              description:content,
              progress,
              visible,
              boardId,
              completedDate
            })
      }else{
          execute({
            id: data.id,
            description:content,
            progress,
            visible,
            boardId,
          })
      }
    }
   

  }
  const today = new Date();
  const formattedDDate =data?.dueDate? format(data?.dueDate||today, 'EEE dd MMMM yyyy'):""; // Customize format as needed
  const daysLeft = data?.dueDate? differenceInDays(data?.dueDate, today):-1;
  const overDuestate = data?.dueDate? daysLeft>0?"left":"overdue":"NULL"
  const dayOrDays =Math.abs(daysLeft)==1? 'day': 'days'
  const finalStatement =data?.dueDate?data.progress=='complete'?"Completed" :`[${Math.abs(daysLeft)} ${dayOrDays} ${overDuestate}]`:"N/A"

  const [isChecked, setIsChecked] = useState(data.visible||false); // Default checked
  const [progressOption, setProgressOption] = useState(data.progress|| "not_started") // Default checked
  
  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];
  const [dtVal, onChange] = useState<Value>(data.dueDate)//new Date());
  const [dtValCompleted, onChangeCompleted] = useState<Value>(data.completedDate)//new Date());
  
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setProgressOption(event.target.value);
  };

  const onEditorStateChange = (editorState: EditorState): void => {
    setEditorState(editorState);
    const content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
    setNote(content)
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
  const [currDate, setCurrDate] = useState(data.dueDate?format(data.dueDate, 'EEE dd MMMM yyyy'): "Not Set");
  
  const handlePopupToggle = () => {
    setShowPopup(!showPopup);
  };

  
  const [showPopupCompleted, setShowPopupCompleted] = useState(false);
  const [currCompletedDate, setCurrDateCompleted] = useState(data.completedDate?format(data.completedDate, 'EEE dd MMMM yyyy'): "Not Set");
  
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
          Description
        </p>
        {isEditing ? (
          <form
            id="id1"
            name= "name1"
            action={onSubmit}
            ref={formRef}
            className="flex flex-col space-y-2 min-h-[70vh]"
          >
           <div  className="flex flex-col gap-y-1">
              <div className="min-h-[40vh]   overflow-x-hidden     overflow-y-auto ">
                <Editor
                  editorStyle={{ minHeight: '40vh', 
                                 maxWidth:"90vw", 
                                 //maxHeight: '50vh', 
                                 border: "1px solid #ccc",  
                                 borderRadius: '7px',
                                 padding:'11px',
                                }}
                  editorState={editorState}
                  onEditorStateChange={onEditorStateChange}
                  wrapperClassName="wrapper-class"
                  editorClassName="editor-class"
                  toolbarClassName="toolbar-class"
                  toolbarStyle={{border: '1px solid #ccc', borderRadius: '7px'}}
                  wrapperStyle={{ padding: '1rem', border: '1px solid #ccc',  borderRadius: '7px' } }
                />
              </div>
              <div className="flex md:flex-row flex-col justify-between space-y-1">
                  <div className="space-x-2">
                    <input 
                        id="visible" 
                        name="visible"
                        type="checkbox" 
                        ref={checkboxRef} 
                        checked={isChecked}
                        onChange={handleCheckboxChange} />
                    <label htmlFor="checkbox">Information is public</label>
                  </div>
              
                  <div className="flex flex-row space-x-1">
                    <label htmlFor="progress" className="italic">Progress:</label>
                    <select id="progress" name="progress" value={progressOption} onChange={handleSelectChange}>
                        {/* Dynamically populate options based on your data model */}
                        <option value="not_started">Not Started</option>
                        <option value="wip">WIP</option>
                        <option value="stabbled">Stabbled</option>
                        <option value="complete">Complete</option>
                        {/* ...other options */}
                    </select>
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
                    <Editor2 
                     customStyleMap ={{
                      editor: {
                        border: '1px solid #ccc',
                        padding: '11px', // Concatenate with unit
                        borderRadius:'5px',
                        minHeight: '40vh',
                        backgroundColor:'#ddd',
                        margin:"5px"
                      },
                      toolbar:{
                        border: '1px solid #ccc', 
                        borderRadius: '7px'
                      },
                      wrapper: { 
                        //padding: '1rem', 
                        border: '1px solid #ccc',  
                        borderRadius: '7px' 
                      }
                      
                    }}
                   
                      editorState={EditorState.createWithContent(getTextFromEditor2(data))} 
                      readOnly 
                      onChange={() => {}} // Empty dummy function
                    />
              </div>
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
              </div>
              <div className="flex md:flex-row flex-col justify-between">
                <div className="space-x-2 md:flex-row ">           
                  <label htmlFor="progress">Due Date:</label>
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

Description.Skeleton = function DescriptionSkeleton() {
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


export function getTextFromEditor( data: Card ) {
  //console.log('data', data)
  if (data.description !==undefined && data.description !==null && data.description!=="") {
       //console.log('data', data)
      if (isJsonStringEditorCompatible(data?.description||"")){
          //console.log('NotePage:::', data.description)
          try{
             const DBEditorState = convertFromRaw(JSON.parse(data?.description||""));
             return(JSON.stringify(DBEditorState.getPlainText()))
          }catch(e){
            // console.log("ERROR A:", e)
            const { contentBlocks, entityMap } = convertFromHTML('');
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            return(JSON.stringify(contentState.getPlainText())) 
            /*  try{

                const obj2 =JSON.parse(data?.description||""); 
                //toast.error(`Check......${data?.description}`)
                const recoveredText= getAllTextEntriesA(obj2['blocks'])
                console.log('Recovered Text:', recoveredText)
                console.log('Data with errors:', data?.description)
                const { contentBlocks, entityMap } = convertFromHTML(recoveredText);
                const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
                toast.error("Your data has corrupt format. Unformated text have been recovered")
                return(JSON.stringify(contentState.getPlainText())) 

             }catch (e){
              toast.error(`Getting data: ${e}`)
              console.log("ERROR B:", e)
         
              const placeholder= ''
              const { contentBlocks, entityMap } = convertFromHTML(placeholder);
              const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
              return(JSON.stringify(contentState.getPlainText())) 
             }
            */

          }
         
          
      }else{
            //const processedHTML = DraftPasteProcessor.processHTML(data.description);
            const { contentBlocks, entityMap } = convertFromHTML(data.description);
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            //const contentState = ContentState.createFromBlockArray(processedHTML);  
            return(JSON.stringify(contentState.getPlainText())) 
      }

  }else {
      const placeholder= ''
      //const processedHTML = DraftPasteProcessor.processHTML(data.description);
      const { contentBlocks, entityMap } = convertFromHTML(placeholder);
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      //const contentState = ContentState.createFromBlockArray(processedHTML);     
      return(JSON.stringify(contentState.getPlainText()))
  }

}
export function removeTags(input:string, newlineReplacement = ' ') {
  const plainText = input.replace(/\n/g, newlineReplacement);
  // console.log('bbbb', plainText)
  return plainText.trim(); // Remove leading/trailing whitespace
}
export function getTextFromEditorSafe( data: SafeCard ) {
  //console.log('data', data)
  if (data?.description !==undefined && data?.description !==null && data?.description!=="") {
       //console.log('data', data)
      if (isJsonStringEditorCompatible(data?.description||"")){
          //console.log('NotePage:::', data.description)
          try{
             const DBEditorState = convertFromRaw(JSON.parse(data?.description||""));
             return(removeTags(JSON.stringify(DBEditorState.getPlainText())))
          }catch(e){
                // toast.error(`Trying to recover you data.${e}`)
                const placeholder= ''
                // console.log('Data with errors:', data?.description)
                const { contentBlocks, entityMap } = convertFromHTML(placeholder);
                const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
                return(removeTags(JSON.stringify(contentState.getPlainText()))) 
              // try { 
              //     const obj2 =JSON.parse(data?.description||""); 
              //     //toast.error(`Check......${data?.description}`)
              //     const recoveredText= getAllTextEntriesA(obj2['blocks'])
              //     console.log('Recovered Text:', recoveredText)
              //     console.log('Data with errors:', data?.description)
              //     const { contentBlocks, entityMap } = convertFromHTML(recoveredText);
              //     const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
              //     toast.error("Your data has corrupt format. Unformated text have been recovered")
              //     return(JSON.stringify(contentState.getPlainText())) 

              // }catch (e) {
              //   toast.error(`Trying to recover you data.${e}`)
              //   const placeholder= ''
              //   console.log('Data with errors:', data?.description)
              //   const { contentBlocks, entityMap } = convertFromHTML(placeholder);
              //   const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
              //   return(JSON.stringify(contentState.getPlainText())) 
              // }

          }
         
          
      }else{
            const { contentBlocks, entityMap } = convertFromHTML(data.description);
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            return(removeTags(JSON.stringify(contentState.getPlainText()))) 
      }

  }else {
      const placeholder= ''
      const { contentBlocks, entityMap } = convertFromHTML(placeholder);
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      return(JSON.stringify(contentState.getPlainText()))
  }

}
export function getTextFromEditor2( data: Card ) {
  if (data.description !==undefined && data.description !==null) {
      if (isJsonStringEditorCompatible(data?.description||"")){
          try{
             const DBEditorState = convertFromRaw(JSON.parse(data?.description||""));   
            // JSON.stringify(DBEditorState.getPlainText())       
             return (DBEditorState)
          }catch(e){
            //toast.error(`Last resort failure.${e}`)
            const placeholder= ''
            // console.log('Data with errors:', data?.description)
            const { contentBlocks, entityMap } = convertFromHTML(placeholder);
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);   
            return (contentState) 
          
           
          }
         

      }else{
          const { contentBlocks, entityMap } = convertFromHTML(data?.description);
          const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            return(contentState) 
      }

  }else {
      const placeholder= ''
       const { contentBlocks, entityMap } = convertFromHTML(placeholder);
       const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      return (contentState) 
  }

}
export function getTextFromEditor3( data: SafeCard ) {
  if (data?.description !==undefined && data?.description !==null) {
      if (isJsonStringEditorCompatible(data?.description||"")){
          try{
             const DBEditorState = convertFromRaw(JSON.parse(data?.description||""));   
            // JSON.stringify(DBEditorState.getPlainText())       
             return (DBEditorState)
          }catch(e){
            //toast.error(`Last resort failure.${e}`)
            const placeholder= ''
            // console.log('Data with errors:', data?.description)
            const { contentBlocks, entityMap } = convertFromHTML(placeholder);
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);   
            return (contentState) 
          
           
          }
         

      }else{
          const { contentBlocks, entityMap } = convertFromHTML(data?.description);
          const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            return(contentState) 
      }

  }else {
      const placeholder= ''
       const { contentBlocks, entityMap } = convertFromHTML(placeholder);
       const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      return (contentState) 
  }

}

export function getAllTextEntries(editorState: { getCurrentContent: () => any; }) {
  const content = editorState.getCurrentContent();
  const blockMap = content.getBlockMap();

  const textEntries: any[] = [];

  blockMap.forEach((block: { getText: () => any; }) => {
    const text = block.getText();
    textEntries.push(text);
  });

  return textEntries;
}

interface Data {
  text: string;
  // Add other properties as needed
}
interface UserData {
  blocks: Data[];
  // Add other properties as needed
}
export function getAllTextEntriesA(json_string: string) {

  let c : string []=[]
 
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