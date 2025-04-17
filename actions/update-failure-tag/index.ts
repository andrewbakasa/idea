"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/app/libs/prismadb";
import { createSafeAction } from "@/lib/create-safe-action";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { InputType, ReturnType } from "./types";
import { UpdateTag } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, ...values } = data;
  let tag;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      error: "Unauthorized",
    };
  }
const owner_id = currentUser.id
  try {
    const child = await prisma.failureTag.findUnique({ 
      where: { id },
    });

    //console.log("child", child)
    //Admin has express write
    //B
    if (child && 
      //boarder creator is allowed updating rights
          ( //adminis allowed updating rights or owner
            currentUser.isAdmin || owner_id==id)){
      // Update child data
      tag=  await prisma.failureTag.update({
          where: { id: child.id },
          data: {  ...values, },
      });

     
    } else {
      revalidatePath(`/failureTag/${id}`);
      return {
        error: `Record can't be updated. See record creator or Admin`
      }
    }
   
  } catch (error) {
    return {
      error: "Failed to update."
    }
  }

  revalidatePath(`/failureTag/${id}`);
  return { data: tag };
};

export const updateFailureTag = createSafeAction(UpdateTag, handler);
