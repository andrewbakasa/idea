"use server";

//import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import prisma from "@/app/libs/prismadb";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateCard } from "./schema";
import { InputType, ReturnType } from "./types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import getCurrentUser from "@/app/actions/getCurrentUser";

const handler = async (data: InputType): Promise<ReturnType> => {
 

  const { id, boardId,  ...values } = data;
  let card;
  //console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      error: "Unauthorized",
    };
  }

//var givenId = ObjectId("given_id_here");
const owner_id = currentUser.id



  try {

    const child = await prisma.card.findUnique({ 
      where: { id },
        include: {
          list: {
              include: {
                board: true,
              },
          },
       },
    });

    //console.log("child", child)
    //Admin has express write
    //B
    if (child && 
      //boarder creator is allowed updating rights
          ((child.list.board.userId==owner_id) 
             ||
             //Listowner is allowed updating rights
               (child.list.userId==owner_id)  
               ||
               //card owner is allowed updating rights
               (child.userId==owner_id)  
                 || 
                 //adminis allowed updating rights
                 currentUser.isAdmin)){
      // Update child data
      card=  await prisma.card.update({
          where: { id: child.id },
          data: {  ...values, },
      });
      await createAuditLog({
        entityTitle: card.title ,
        entityId: card.id ,
        entityType: ENTITY_TYPE.CARD,
        action: ACTION.UPDATE,
      })

    } else {
      revalidatePath(`/board/${boardId}`);
      return {
        error: `Record can't be updated. See record creator or Admin`
      }
    }
   
  } catch (error) {
    return {
      error: "Failed to update."
    }
  }

  revalidatePath(`/board/${boardId}`);
  return { data: card };
};

export const updateCard = createSafeAction(UpdateCard, handler);

/* 
List owner should be able to update a card he doesnt own 



*/
