import prisma from "../libs/prismadb";

import getCurrentUser from "./getCurrentUser";

export default async function updateCardUserId() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }
 

    const cards = await prisma.card.findMany({
      include: { 
          list:{
            include:{
              board:{
                include:{
                  user:true
                }
              } 
            } 
          }
      }
    });

    //Update all list
  const transaction = cards.map((card) => 
      prisma.card.update({
            where: {
                id: card.id,
            },
            data: {
                userId: card.list.board?.userId,
            }
      }))

 const updateCards = await prisma.$transaction(transaction);
 //console.log("???????????????????????????????????????")
   //console.log(updateCards)
    return updateCards;
  } catch (error: any) {
    throw new Error(error);
  }
}
