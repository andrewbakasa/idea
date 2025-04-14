"use client";
import { useState} from "react";
import { Board } from "@prisma/client";
import { BoardTitleForm } from "./board-title-form";
import { BoardOptions } from "./board-options";
import { SafeBoard } from "@/app/types";

interface BoardTitleOptionsProps {
  data: Board,
  data2: SafeBoard,
  useremail:string,
  userId:string,
  isOwner:boolean
};

export const BoardTitleOptions = ({
  data,
  data2,
  useremail,
  isOwner,
  userId
}: BoardTitleOptionsProps) => {
  
  const [percent, setPercent] = useState(0);
  return (
    // If List in private show darker handle
    
    
    <>
         {/* First div */}
            <BoardTitleForm 
                data={data}  
                percent={percent} 
                setPercent={setPercent}
            /> 
         {/* Second div */}
          <div className="ml-auto">
              <BoardOptions id={data.id} 
                  data={data2} data2={data} 
                  isOwner={isOwner}
                  useremail= {useremail}
                  percent={percent} 
                  setPercent={setPercent} 
                  userId={userId}
              />
          </div>
    </>
  );
};
