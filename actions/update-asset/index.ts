"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/app/libs/prismadb";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateAsset } from "./schema";
import { InputType, ReturnType } from "./types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION,  Asset,  ENTITY_TYPE } from "@prisma/client";
import getCurrentUser from "@/app/actions/getCurrentUser";

const handler = async (data: InputType): Promise<ReturnType> => { 

  const { id,assetCatIDs,...values } = data;
  let asset;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      error: "Unauthorized",
    };
  }
  const owner_id = currentUser.id
  try {

    const child = await prisma.asset.findUnique({ 
      where: { id },
      
    });

    if (child  ){
      const keys = Object.keys(values);
      if (assetCatIDs!==undefined){
           await updateAssetWithTags({asset:child, updatedAssetData:assetCatIDs||[]}).then(x=>{                
                return { data: x };
   
           })
       }else {
       //update  general content
       const testVal ='{ "hours-avail":"200", "reliab":"45%", "util":"70%" }'
          asset=  await prisma.asset.update({
              where: { id: child?.id },
              data: {  ...values,availability:testVal },
          });

        }
          
    } else {
      revalidatePath(`/assets/`);
      return {
        error: `Record can't be updated. See record creator or Admin`
      }
    }
   
  } catch (error) {
    return {
      error: `Failed to update.${error}`
    }
  }

  revalidatePath(`/assets/`);
  return { data: asset };
};





export const updateAsset = createSafeAction(UpdateAsset, handler);


interface Props {
  //   boardId: string;
    asset:Asset,
    updatedAssetData:string []
  };
  
  interface Props2 {
    //   boardId: string;
      asset:Asset,
      updatedAssetData:string [];
      assetId:string
    };
  export const updateAssetWithTags= async(props: Props)=> {
      const {asset, updatedAssetData}= props
     
      if (!asset) {
        throw new Error('asset not found');
      }
    
      const oldTagIds = asset?.assetCatIDs||[];
      const newTagIds = updatedAssetData//.tagIDs;
    
      const tagsToAdd = newTagIds?.filter((id)=> !oldTagIds.includes(id));
      const tagsToRemove = oldTagIds?.filter(id => !newTagIds?.includes(id));

    
      // // Handle tag relations
      await prisma.$transaction([
        ...tagsToAdd?.map(tagId => prisma.assetCategory.update({
          where: { id: tagId },
          data: { assetIDs: { push: asset.id } }
        })),
      
      ]);
      
      const promises = tagsToRemove?.map(async (tagId) => {
          return removeAssetIdFromTag(tagId,asset.id);
        });
  
      await Promise.all(promises)
      
      const updatedasset = await prisma.asset.update({
        where: { id: asset.id },
        data: {assetCatIDs:updatedAssetData}
      });
  
      
       return reorderTagIds(asset.id)
      // return updatedasset;
    }
    async function removeAssetIdFromTag(tagId:string, assetId:string) {
      const tag = await prisma.assetCategory.findUnique({
        where: { id: tagId },
       // include: { assets: true }, // Include assets for potential optimization
      });
    
      if (!tag) {
        throw new Error('Tag not found');
      }
      // console.log('get data1', tag.assetIDs)
      const updatedassetIds = tag.assetIDs?.filter(id => id !== assetId);
      // console.log('get data2', updatedassetIds)
     
      const updatedTag = await prisma.assetCategory.update({
        where: { id: tagId },
        data: { assetIDs: updatedassetIds.length > 0 ? updatedassetIds : [], },
      });
    
      return updatedTag;
    }
    
async function reorderTagIds(assetId:string) {
  try {
    // Fetch the asset and its associated tags
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        assetCategories: true,
      },
    });
  
    if (!asset) {
      throw new Error('asset not found');
    }
  
    // Sort tags by name
    const sortedTags = asset.assetCategories?.sort((a, b) => a.name.localeCompare(b.name));
  
    // Create a new array of tagIDs based on the sorted tags
    const reorderedTagIds = sortedTags?.map((tag) => tag.id);
  
    // Update the asset with the reordered tagIDs
    const updatedasset = await prisma.asset.update({
      where: { id: assetId },
      data: { assetCatIDs: reorderedTagIds },
    });
  
    return updatedasset;
  } catch (error) {
    console.error('Error reordering tagIDs:', error);
    throw error;
  }
  }

/* 
List owner should be able to update a asset he doesnt own 



*/
