"use server";

import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import prisma from "@/app/libs/prismadb";
// import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateAsset } from "./schema";
import { InputType, ReturnType } from "./types";
import getCurrentUser from "@/app/actions/getCurrentUser";

const handler = async (data: InputType): Promise<ReturnType> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      error: "Unauthorized",
    };
  }
  const { name, asset_num,capacity} = data;
  let assetM;

  try {

    // const cat =await prisma.assetCategory.create({data:{
    //   name:'locomotives'
    // }})
    //const firstRow = await prisma.assetCategory.findFirst();

    // const truck1 =await prisma.truck.create({data:{
    //   loadCapacity:100
    // }})
   // const firstRow1 = await prisma.truck.findFirst();
   // console.log('sss', firstRow1)
   // if (firstRow1){
    // const newUsers = await prisma.assetCategory.createMany({
    //   data: [
    //     { name: 'DE11' },
    //     { name: 'DE10' },
    //     { name: 'DE6' },
    //     { name: 'DE9' },
    //     { name: 'DJE' },
    //     { name: 'DEJN'},
    //     { name: 'JUMBO' },
    //     { name: 'KKM' },
    //     { name: 'LATHE' },
    //     { name: 'COMPR' },
    //     { name: 'GEN' },
    //     { name: 'PNEUMATIC'},
    //   ],
    // });
    // //await prisma.asset.create({data:{}})
    assetM = await prisma.asset.create({
      data: {
       name:name,
       capacity:capacity,
       asset_num:asset_num,
       //truckId:firstRow1?.id,
       //categoryId:firstRow?.id
        // manufacturer:"",
        // type :"Excavator",
        // make: 'cat',
        // model :'cat',
        // weight :100,
        // dimensions: '70m by 70m by 800m',
        // fuelType:"diesel electric"
      },
    });
  //}
  } catch (error) {
    console.log(error)
    return {
      error: `Failed to create.${error}`
    }
  }

  revalidatePath(`/assets/`);
  return { data: assetM};
};

export const createAsset = createSafeAction(CreateAsset, handler);
