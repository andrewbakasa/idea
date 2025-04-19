"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/app/libs/prismadb";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateEnquiry } from "./schema";
import { InputType, ReturnType } from "./types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION,  ENTITY_TYPE } from "@prisma/client";
import getCurrentUser from "@/app/actions/getCurrentUser";

const handler = async (data: InputType): Promise<ReturnType> => { 

  const { id, ...values } = data;
  let enquiry;
  const currentUser = await getCurrentUser();

 
  try {

    const child = await prisma.enquiry.findUnique({ 
      where: { id },
      
    });

   
    if (child ){ 
     
      const keys = Object.keys(values);
       //update  general content
       enquiry=  await prisma.enquiry.update({
              where: { id: child?.id },
              data: {                
                ...values, 
                },
          });

          
          
    } else {
      //revalidatePath(`/board/${boardId}`);
      return {
        error: `Record can't be updated. See record creator or Admin`
      }
    }
   
  } catch (error) {
    return {
      error: `Failed to update.${error}`
    }
  }

  //revalidatePath(`/board/${boardId}`);
  return { data: enquiry };
};





export const updateEnquiry= createSafeAction(UpdateEnquiry, handler);

/* 
List owner should be able to update a card he doesnt own 



*/
