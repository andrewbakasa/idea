
import prisma from "../libs/prismadb";
import getCurrentUser from "./getCurrentUser";

export default async function getAssetCategoryNames() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return [];
    }
    const owner_id = currentUser.id
    let catNames

    
      //admin can view all
      catNames = await prisma.assetCategory.findMany({
        // where: {
        //   active:true,
        // },
        orderBy: { name: "asc" },
        // include: {
        //   lists: {
        //     include: {
        //       cards: true,
        //     },
        //   },
        //   user:true,
        // },
      });
//  console.log('hhhh',tagNames)
     if (catNames) {
        const result = catNames?.map(x=>({label:x.name,value:x.id}))
        return result;
     }else{
        return []
     }
  } catch (error: any) {
    throw new Error(error);
  }
}