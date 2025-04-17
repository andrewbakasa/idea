import { truncate } from "fs";
import prisma from "../libs/prismadb";

import getCurrentUser from "./getCurrentUser";

export default async function getAssets() {
  try {
    const currentUser = await getCurrentUser();
    // updateCardUserId()
    // updateListUserId()
    if (!currentUser) {
      return [];
    }
    // console.log("it seems code is ending up here")

    const owner_id = currentUser.id

    const assets = await prisma.asset.findMany({
       where: {
         AND: [ 
               { active:true },
             //  { userId :owner_id },
             ],
       },
      orderBy: { sed: "desc" },
       include: {
         failures: true, 
         breakdowns:true,
         preventiveMaintenancePlans:{
            include:{
              maintenanceTasks:{
                include:{
                    partsUsed:true
                }
              }
            }
         },
         disposalHistory:true,
         idleTimes:true,
        //  truck:{
        //     include:{
        //       trips:true
        //     }
        //  },
        // // machinery:true,
        // equipment:true,
         calibrations:true,
         workorders:{
            include:{
              activities:true,
              assignments:true


            }
         }
        },
       
      
    });
  
    const safeAssets = assets.map((asset) => ({
      ...asset,
      workorders:asset.workorders.map(x=>({
          ...x,
          createdAt:x.createdAt.toString(),
          updatedAt: asset.updatedAt.toString(),
        })
      ),
      failures:asset.failures.map(x=>({
          ...x,
          createdAt:x.createdAt.toString(),
          updatedAt: asset.updatedAt.toString(),
        })
      ),
        breakdowns:asset.breakdowns.map(x=>({
          ...x,
          createdAt:x.createdAt.toString(),
          updatedAt: asset.updatedAt.toString(),
        })
      ),
      preventiveMaintenancePlans:asset.preventiveMaintenancePlans.map(x=>({
          ...x,
          createdAt:x.createdAt.toString(),
          updatedAt: asset.updatedAt.toString(),
        })
      ),

      createdAt: asset.createdAt.toString(),
      updatedAt: asset.updatedAt.toString(),
     
    })
  );
   // console.log(("---------------------------------safe boards"))
   // console.log(safeAssets)
    return safeAssets;
  } catch (error: any) {
    throw new Error(error);
  }
}



