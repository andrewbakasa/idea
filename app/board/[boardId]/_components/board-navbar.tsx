import { Board } from "@prisma/client";
import { SafeBoard } from "@/app/types";
import getCurrentUser from "@/app/actions/getCurrentUser";

import { cn } from "@/lib/utils";
import { BoardTitleOptions } from "./board-title-board-options";
interface BoardNavbarProps {
  data: Board,
  data2: SafeBoard,
  useremail:string
};

export const BoardNavbar = async ({
  data,
  data2,
  useremail
}: BoardNavbarProps) => {
  const currentUser = await getCurrentUser()
  return (
    <div 
      className={cn(
        "w-full h-14 fixed top-14 flex  items-center px-6 gap-x-4 text-white",
        data2.userId==currentUser?.id ? "border-[1px] border-fuchsia-500" : "border-[1px] border-green-100",
        data2.public? " bg-black/40" : " bg-black/70",
      )}
    >     
      <BoardTitleOptions
          data={data}
          data2={data2}
          isOwner={(currentUser?.id == data2.userId) || false}
          useremail= {useremail}
          userId={currentUser?.id||'Swera!'} 
      />     
    </div>
  );
};
