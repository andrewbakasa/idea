"use client";

import { ElementRef, useEffect, useRef, useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";

import { cn } from "@/lib/utils";
import { ListWithCards } from "@/types";

import { CardForm } from "./card-form";
import { CardItem } from "./card-item";
import { ListHeader } from "./list-header";
import { useCardReadModeStore } from "@/hooks/use-cardReadMode";
import { toast } from "sonner";
//import { useEventListener } from "usehooks-ts";

interface ListItemProps {
  data: ListWithCards;
  index: number;
  dragMode:boolean;
  isOwnerOrAdmin:boolean,
  currentUserId:string
  cardReadMode:boolean;
  cardYscroll:boolean;
  cardShowTitle:boolean;
  // setCardReadMode: () => void;
};

export const ListItem = ({
  data,
  index,
  dragMode,
  isOwnerOrAdmin,
  currentUserId,
  cardReadMode,
  cardYscroll,
  cardShowTitle,
  // setCardReadMode
}: ListItemProps) => {
  const textareaRef = useRef<ElementRef<"textarea">>(null);

  const timeoutId = useRef<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // const {readMode,setReadModeState}= useCardReadModeStore();

  const disableEditing = () => {
    setIsEditing(false);
  };

  const cancelDisableEditing= () => {
    setIsEditing(true);
  };

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };
// useEffect(()=>{toast.message('nnnnn')},[readMode])
  return (
    <Draggable isDragDisabled={!dragMode}  draggableId={data.id} index={index}>
      {(provided) => (
        <li 
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="shrink-0 h-full w-[272px] select-none"
         // style={disabled ? {pointerEvents: "none", opacity: "0.4"} : {}}
        >
          <div 
            {...provided.dragHandleProps}
            className="w-full rounded-md bg-[#f1f2f4] shadow-md pb-2"
          >
            <ListHeader 
              onAddCard={enableEditing}
              data={data}
            />
            {/* A very long card list make it cumbersome to track.... */}
            <CardForm
              listId={data.id}
              ref={textareaRef}
              isEditing={isEditing}
              enableEditing={enableEditing}
              disableEditing={disableEditing}
              cancelDisableEditing={cancelDisableEditing}
              timeoutId={timeoutId}
            />
            <Droppable droppableId={data.id} type="card">
              {(provided) => (
                <ol
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "mx-1 px-1 py-0.5 flex flex-col gap-y-2",
                    data.cards.length > 0 ? "mt-2" : "mt-0",
                  )}
                >
                  {data.cards.map((card, index) => (
                    <CardItem
                      index={index}
                      key={card.id}
                      dragMode={dragMode}
                      data={card}
                      listOwner ={data.userId}
                      isOwnerOrAdmin={isOwnerOrAdmin}
                      currentUserId={currentUserId}
                      cardReadMode={cardReadMode}
                      // setCardReadMode={setCardReadMode}
                      cardYscroll={cardYscroll}
                      cardShowTitle={cardShowTitle}
                    />
                  ))}
                  {provided.placeholder}
                </ol>
              )}
            </Droppable>
            
          </div>
        </li>
      )}
    </Draggable>
  );
};
