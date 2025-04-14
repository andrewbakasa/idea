"use client";

import { Card } from "@prisma/client";
import { Draggable } from "@hello-pangea/dnd";
import { cn, getTextAreaHeight, getTextAreaRow} from "@/lib/utils";
import {checkStringFromStringArray} from "@/lib/utils";
import { useCardModal } from "@/hooks/use-card-modal";
import { useEffect, useState } from "react";
import { AiFillEdit, AiOutlineEdit } from "react-icons/ai";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { getTextFromEditor, getTextFromEditor2 } from "@/components/modals/card-modal/description";
// import { CompositeDecorator, Editor, EditorState, convertFromRaw } from 'draft-js';
import { CompositeDecorator, DraftDecorator, Editor, EditorState } from "draft-js";

import { useStringVarStore } from "@/hooks/use-search-value";
import moment from "moment";
import { actionAsyncStorage } from "next/dist/client/components/action-async-storage.external";
import { relative } from "path";
//import Tooltip from "./ToolTip";
interface CardItemProps {
  data: Card;
  index: number;
  dragMode:boolean;
  listOwner:string;
  isOwnerOrAdmin:boolean
  currentUserId:string;
  cardReadMode:  boolean;
  cardYscroll:  boolean;
  cardShowTitle: boolean;
};

export const CardItem = ({
  data,
  index,
  dragMode,
  listOwner,
  isOwnerOrAdmin,
  currentUserId,
  cardReadMode,
  cardYscroll,
  cardShowTitle
}: CardItemProps) => {

  let hoverdummy = false;
  const cardModal = useCardModal();
 // Gett user setting
  const [toggle, setToggle] = useState(cardReadMode);
  const {stringVar,setStringVar}=useStringVarStore()
  
  const [compositeDecorator,setCompositeDecorator] = useState(new CompositeDecorator([]))
  const actionText =cardShowTitle==true? data.title: "[Drag-drop to re-order. Click to collapse]"

  const formattedDDate =data?.dueDate? format(data?.dueDate, 'dd MMM yyy'):""; 

  const editable= (listOwner==currentUserId) //list creator
                  ||(data.userId==currentUserId)  //card creator
                  || isOwnerOrAdmin // board creator or admin

  const editableIcon= <span>
                        <AiFillEdit  
                            size={10} 
                            className="cursor-pointer h-4 w-4 hover:h-[18px] hover:w-[18px] hover:text-blue-600"
                        /> 
                      </span>

    const editableIconStatic= editable && 
    <span>
      <AiFillEdit  size={10} className="h-4 w-4 "/> 
    </span>               

  const descript = data?.description !== null? getTextFromEditor(data):null
  // const editorState = EditorState.createWithContent(getTextFromEditor2(data)) 

  useEffect(()=>{
    // let arrFirst =searchTerm.split(';');
    let arrFirst =stringVar.split(';');
      
    const subLists = arrFirst.filter(element => element);  // Using arrow function (ES6)
    // Combine elements from sub-lists into a single list
    const highlightText = subLists.flatMap(subList => subList.split(','));  
    const customHighlightDecorator: DraftDecorator = {
      strategy: (block, callback, contentState) => {
        const text = block.getText();
        const currentSelection = contentState.getSelectionBefore();
    
        for (let i = 0; i < highlightText.length; i++) {
          const word = highlightText[i];
          const startIndex = text.toLocaleLowerCase().indexOf(word.toLocaleLowerCase());
    
          if (startIndex !== -1) {
            const endIndex = startIndex + word.length;
            // console.log('nnn', word, text)
            // Check if the highlighted word overlaps with the current selection
            const isWithinSelection = currentSelection.getStartOffset() <= startIndex &&
                                      currentSelection.getEndOffset() >= endIndex;
    
            const style = isWithinSelection ? 'HIGHLIGHTED_SELECTED' : 'HIGHLIGHTED';
    
            callback(startIndex, endIndex);
          }
        }
      },
    
      component: ({ children, style }) => {
        return <span style={style} className="bg-yellow-400 ">{children}</span>;
      },
      
    };
    setCompositeDecorator(new CompositeDecorator([customHighlightDecorator]));
  },[stringVar])

  const relativeCreatedDate =moment(data.updatedAt).fromNow();
  
  //console.log("dragMode state here:", dragMode)  
  return (
    //make toggle based on user
    <Draggable isDragDisabled={!dragMode}  draggableId={data.id} index={index}>
      {(provided) => (
        <div
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
              role="button"
             
              onClick={() => setToggle(!toggle)}

              className={cn(
                `border-2 border-transparent py-2 px-3 text-sm rounded-md shadow-sm
                transition duration-200 ease-in-out`,
                toggle ? 'border-black w-full' : '',
                !toggle? "truncate":"",// truncate text only when not scrolling
                checkStringFromStringArray(data?.progress || "",['complete', 'release','done']) ? "text-green-500" : 
                        checkStringFromStringArray(data?.progress || "",['wip', 'work in progress']) ? "text-blue-600":'"text-pink-600"',
                        descript && toggle ?  `h-[${getTextAreaHeight(Number(descript.length))}px]`: 
                        data?.title?.length > 0 &&  toggle ?`h-[${getTextAreaHeight(Number(data?.title.length))}px]`:"",
                        data.visible?"bg-white": "bg-rose-200"// // if card is private make darker
                )}
         
        >
         {/* First Option  closed card*/}
          {!toggle &&  
              <div 
                className="flex flex-row"
              > 
                  <div>{editableIconStatic}</div> 
                    <div className="relative bg-gray-100  w-full hover:bg-gray-200  font-sans truncate flex flex-row gap-1">
                        <span className="absolute top-[-7px] right-1 text-[8px] text-blue-500">{relativeCreatedDate}</span>
                      <span className="bg-gray-100 text-[14px] truncate">{data.title}</span>
                    </div> 
                  {/* </div> */}
              </div>
          }
          {/* Second Option open with description */}
          {toggle && descript!==null &&
              <div className ='flex flex-col h-full'>
                  <div className ='flex flex-row justify-between'>
                     
                      <div className="relative bg-gray-100  w-full hover:bg-gray-200 text-rose-500 italic font-sans truncate flex flex-row gap-1">
                        <span className="absolute top-[-7px] right-1 text-[8px] text-blue-500">{relativeCreatedDate}</span>
                        <span className="absolute bg-gray-100 top-2 text-[11px] truncate">{actionText}</span>
                      </div>
                      
                     
                     { editable &&  <div className="text-[11px]">
                        <Button
                          onClick={() => cardModal.onOpen(data.id)}
                          className="h-auto px-2 py-1.5 w-full justify-end text-muted-foreground text-[11px] hover:text-sm"
                          size="sm"
                          variant="ghost"
                      >
                       { editableIcon}                   
                        </Button>
                      </div>
                    }
                  </div>
                  
                 
                  <div 
                      className={cn(
                        "static-editor max-h-[50vh] overflow-x-hidden ",
                         cardYscroll? "overflow-y-auto" : "overflow-y-hidden" 
                      )}
                  >
                       <Editor 
                        editorState={EditorState.createWithContent(getTextFromEditor2(data),compositeDecorator)} 
                        readOnly 
                        onChange={() => {}} // Empty dummy function
                      />
                  </div>
              </div>
            }
            {/* Third Option */}
          {toggle && descript==null && 
         
            <div className ='flex flex-col h-full'>
                <div className ='flex flex-row justify-between'>
                      {/* <div className="bg-gray-100 text-[11px] w-full hover:bg-gray-200 text-rose-500 italic font-sans truncate">
                          {actionText}
                      </div> */}
                      <div className="relative bg-gray-100 text-[11px] w-full hover:bg-gray-200 text-rose-500 italic font-sans truncate">
                        <span className="absolute top-[-7px] right-1 text-[8px] text-blue-500">{relativeCreatedDate}</span>
                        <span className="absolute bg-gray-100 top-2 text-[11px] truncate">{actionText}</span>
                      </div>
                     
                      { editable && <div className="text-[11px]">
                        <Button
                          onClick={() => cardModal.onOpen(data.id)}
                          className="h-auto px-2 py-1.5 w-full justify-end text-muted-foreground text-[11px] hover:text-sm"
                          size="sm"
                          variant="ghost"
                      >
                          {editableIcon}
                        </Button>
                      </div>
                     }
                  </div>
                <textarea  disabled={true}  style={{ resize: 'none' }}
                  className={cn(
                    "w-full  h-full outline-width: 0px;",
                  )}
                >
                  { data?.title}
                </textarea>
              
            </div>
            
            }
           
        </div>
      )}
    </Draggable>

    
  );
};
