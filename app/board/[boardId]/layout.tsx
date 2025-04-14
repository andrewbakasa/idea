import { notFound, redirect } from "next/navigation";

import prisma from "@/app/libs/prismadb";

import { BoardNavbar } from "./_components/board-navbar";
import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";

export async function generateMetadata({ 
  params
 }: {
  params: { boardId: string; };
 }) {

  

  const board = await prisma.board.findUnique({
    where: {
      id: params.boardId,
    }
  });

  return {
    title: board?.title || "Board",
  };
}

const BoardIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { boardId: string; };
}) => {
  
  const currentUser = await getCurrentUser();

  // if (!currentUser) {
  //   return [];
  // }
 
  if (!currentUser) {
   //redirect(`/projects`);

   return (
     <ClientOnly>
       <EmptyState
         title="Unauthorized"
         subtitle="Please login"
       />
     </ClientOnly>
   )
  }
  const board = await prisma.board.findUnique({
    where: {
      id: params.boardId,
    },
  });
  // console.log("here.......")
  if (!board) {
    notFound();
  }

  const board2 = await prisma.board.findUnique({
    where: {
      id: params.boardId,
    },
    include: {
        lists: {
            orderBy: {
              order: 'asc',
            },
            include: {
                cards:{
                    orderBy: {
                      order: 'asc',
                    },
                }
            },
        },
        user:true,
    },
  });



  if (!board2) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: {
      id: board?.userId,
      // orgId,
    },
  });

 const safeData = {
  ...board2,
  //check if user has access roles list inside of project
  lists:board2.lists.filter(list =>{ 
    const isOwner =(board.userId ==currentUser.id)
    const isAdminOrOwner = isOwner || currentUser.isAdmin
    const listCreator =(list.userId ==currentUser.id)
    return (list.visible == true ||isAdminOrOwner || listCreator); 
  }).map((x)=>({
        ...x,
        //change cards
        userId:x.userId || "",//reference added after
        cards: x.cards.filter(card => {
          //check if user has access role card of list
          const isOwner =(board.userId ==currentUser.id)
          const isAdminOrOwner = isOwner || currentUser.isAdmin
          const cardCreator = (card.userId ==currentUser.id)
          return (card.visible == true || isAdminOrOwner || cardCreator)
        }).map((card)=>({
            ...card,
            userId:card.userId ||"",//reference added after
            createdAt: card.createdAt.toString(),
            updatedAt: card.updatedAt.toString(),
          })
        ),
        createdAt: x.createdAt.toString(),
        updatedAt: x.updatedAt.toString(),
    })
  ),
  createdAt: board2.createdAt.toString(),
  updatedAt: board2.updatedAt.toString(),
  user:"",
  user_image:board2.user.image || ""
};
// console.log('safe data',safeData)
  return (
    <div
      className="relative h-full bg-no-repeat bg-cover bg-center "
      style={{ backgroundImage: `url(${board.imageFullUrl})` }}
    >
      {/* why data and data2: data2 is right data */}
      <BoardNavbar data={board} data2={safeData}  useremail ={user?.email || ""} />
      <div 
        className="absolute inset-0 bg-black/10"
      
      />
        <main className="relative h-full pt-1">
          {children}
        </main>
      </div>
  );
};

export default BoardIdLayout;
