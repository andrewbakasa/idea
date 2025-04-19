"use server";
import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import prisma from "@/app/libs/prismadb";
import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateEnquiry } from "./schema";
import { InputType, ReturnType } from "./types";
import getCurrentUser from "@/app/actions/getCurrentUser";

const handler = async (data: InputType): Promise<ReturnType> => {
  // const currentUser = await getCurrentUser();

  // if (!currentUser) {
  //   return {
  //     error: "Unauthorized",
  //   };
  // }
  const { ...values } = data;
  let enquiry;

  try {
    

    enquiry = await prisma.enquiry.create({
      data: {
        ...values
      },
    });

    await createAuditLog({
      entityId: enquiry.id,
      entityTitle: 'Enquiry',
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.CREATE,
    });
    
    
  } catch (error) {
    return {
      error: "Failed to create."
    }
  }

  //revalidatePath(`/board/${boardId}`);
  return { data: enquiry };
};

export const createEnquiry = createSafeAction(CreateEnquiry, handler);
