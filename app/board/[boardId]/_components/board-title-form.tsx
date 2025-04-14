"use client";

import { toast } from "sonner";
import { ElementRef, useRef, useState } from "react";
import { Board } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/form/form-input";
import { updateBoard } from "@/actions/update-board";
import { useAction } from "@/hooks/use-action";

interface BoardTitleFormProps {
  data: Board;
  setPercent:(value:number) => void;
  percent:number
};

export const BoardTitleForm = ({
  data,
  setPercent,
  percent
}: BoardTitleFormProps) => {
  const { execute } = useAction(updateBoard, {
    onSuccess: (data) => {
      toast.success(`Board "${data.title}" updated!`);
      setTitle(data.title);
      setPercent(data.percent);
      disableEditing();
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const [title, setTitle] = useState(data.title);

  setPercent(data.percent)// initial
  const [isEditing, setIsEditing] = useState(false);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
     inputRef.current?.focus();
     inputRef.current?.select(); 
    })
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;

    if (title === data.title) {
      return disableEditing();
    }
    execute({
      title,
      id: data.id,
    });
  };

  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  if (isEditing) {
    return (
      <form action={onSubmit} ref={formRef} className="flex items-center gap-x-2">
        <FormInput
          ref={inputRef}
          id="title"
          onBlur={onBlur}
          defaultValue={title}
          className="text-lg font-bold px-[7px] py-1 h-auto w-auto bg-transparent focus-visible:outline-none focus-visible:ring-transparent border-none"
        />
      </form>
    )
  }
  
  return (
   
  <div className="truncate flex flex-row justify-between gap-1">
     {/* First div--- */}
     <div className="truncate">
      <Button
          onClick={enableEditing}
          variant="transparent"
          className="truncate font-bold text-lg h-auto w-auto p-1 px-2"
        >
          <div  className="truncate">{title}</div> 
        </Button>
    </div>
      {/* Second div */}
    <span className="flex-shrink relative top-2 text-sm text-zinc-200">{percent}%</span>
  </div>
  );
};
