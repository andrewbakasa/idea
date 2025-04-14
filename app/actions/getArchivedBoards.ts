import prisma from "../libs/prismadb";

import getCurrentUser from "./getCurrentUser";

export default async function getArchivedBoards() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const boards = await prisma.board.findMany({
      where: {
        active:false
      },
      include: {
        lists: {
          include: {
            cards: true,
          },
        },
        user:true,
      },
    });
    //24 January 2024
    const safeBoards = boards.map((board) => ({
        ...board,
        //Change lists
        lists:board.lists.map((x)=>({
              ...x,
              //change cards
              cards: x.cards.map((card)=>({
                  ...card,
                  createdAt: card.createdAt.toString(),
                  updatedAt: card.updatedAt.toString(),
                })
              ),
              createdAt: x.createdAt.toString(),
              updatedAt: x.updatedAt.toString(),
          })
        ),
        createdAt: board.createdAt.toString(),
        updatedAt: board.updatedAt.toString(),
        user:"",
        user_image:board.user.image || ""
      })
    );

    return safeBoards;
  } catch (error: any) {
    throw new Error(error);
  }
}

