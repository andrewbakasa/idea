"use server";

import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import prisma from "@/app/libs/prismadb";
// import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateFailure } from "./schema";
import { InputType, ReturnType } from "./types";
import getCurrentUser from "@/app/actions/getCurrentUser";

const handler = async (data: InputType): Promise<ReturnType> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      error: "Unauthorized",
    };
  }
  const { description, assetId, resolutionDate, occurrenceDate} = data;
  let failureM;

  try {

    failureM = await prisma.failure.create({
      data: {
        description,
        assetId,
        occurrenceDate, 
        resolutionDate 
      },
    });
  
  } catch (error) {
    console.log(error)
    return {
      error: `Failed to create.${error}`
    }
  }

  revalidatePath(`/assets`);
  return { data: failureM};
};

export const createFailure = createSafeAction(CreateFailure, handler);
