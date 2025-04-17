
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import prisma from "@/app/libs/prismadb";
import { createSafeAction } from "@/lib/create-safe-action";

// import { ActivateCard } from "./schema";
// import { InputType, ReturnType } from "./types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";


const handler = async (data: any): Promise<any> => {
  
    const { id } = data;
    let card;
  
    try {

            // const totalCost = await prisma.workOrder.findFirst({
            //     where: { id: 123 },
            //     include: { costs: true },
            // }).then((workOrder) => {
            //     return workOrder.costs.reduce((sum, cost) => sum + cost.amount, 0);
            // });

}catch{}
}