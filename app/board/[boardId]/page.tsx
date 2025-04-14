
import prisma from "@/app/libs/prismadb";
import { ListContainer } from "./_components/list-container";
import getCurrentUser from "../../actions/getCurrentUser";
import EmptyState from "@/app/components/EmptyState";
import ClientOnly from "@/app/components/ClientOnly";

interface BoardIdPageProps {
  params: {
    boardId: string;
  };
};

const BoardIdPage = async ({
  params,
}: BoardIdPageProps) => {
 
   const currentUser = await getCurrentUser();
   if (!currentUser) {
  
    return (
      <ClientOnly>
        <EmptyState
          title="Unauthorized"
          subtitle="Please login"
        />
      </ClientOnly>
    );
  }
 
  try {
      const lists = await prisma.list.findMany({
        where: {
          boardId: params.boardId,
        },
        include: {
          cards: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      });

      
      const board = await prisma.board.findUnique({
        where: {
          id: params.boardId,
          // orgId,
        },
      });

      if (!board) {
        //redirect(`/projects`);
    
        return (
          <ClientOnly>
            <EmptyState
              title="Not Ready"
              subtitle="Please wait"
            />
          </ClientOnly>
        );
      }
     

      const isOwner = board?.userId ==currentUser.id 
      const isOwnerOrAdmin =isOwner || currentUser.isAdmin
      // console.log('page', isOwner)
      
        //filter().map() function
        const lists_filter =   lists.filter(list =>{ 
          // if the is is visible show it
          //if its private but its the owner show it
          // if its private but user is Admin show it
          return ((list.visible == true || (list.userId==currentUser.id) || isOwnerOrAdmin) && list.active); 
        }).map((x)=>({
              ...x,
              //change cards
              userId:x.userId || "",
              cards: x.cards.filter(card => {
              
              return ((card.visible == true || (card.userId==currentUser.id)|| isOwnerOrAdmin) && card.active)
            
              }).map((card)=>({
                  ...card,
                  userId:card.userId || ""
                })
              ),
          })
        )
      return (
         <div className="p-4  h-full overflow-x-auto">
            <ListContainer
              boardId={params.boardId}
              data={lists_filter}
              dragMode={board.dragMode}
              isOwnerOrAdmin={isOwnerOrAdmin}
              currentUserId={currentUser.id}
              cardReadMode={currentUser?.cardReadMode? currentUser?.cardReadMode:false}
              cardYscroll={currentUser?.cardYscroll?currentUser?.cardYscroll:false}
              cardShowTitle={currentUser?.cardShowTitle?currentUser?.cardShowTitle:false}
              recentDays={currentUser?.recentDays?currentUser?.recentDays:7}
            />
          </div>
      );

    }catch (err) {
      //console.log(err)
      return {
        error: "Something went wrong!" 
      }
    };
};

export default BoardIdPage;
