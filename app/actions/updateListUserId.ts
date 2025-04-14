import prisma from "../libs/prismadb";

import getCurrentUser from "./getCurrentUser";

export default async function updateListUserId() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }
 
    const lists = await prisma.list.findMany({
      include: {
          cards: true, 
          board:{
            include:{
              user:true
            }
          }  
      }
    });

   
    //Update all list
  const transaction = lists.map((list) => 
   prisma.list.update({
            where: {
                id: list.id,
            },
            data: {
                userId: list.board?.userId,
            }
       }));

 const updateList = await prisma.$transaction(transaction);
  //  console.log("???????????????????????????????????????")
  //  console.log(updateList)
    return updateList;
  } catch (error: any) {
    throw new Error(error);
  }
}
