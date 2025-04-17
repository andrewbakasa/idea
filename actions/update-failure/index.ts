"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/app/libs/prismadb";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateFailure } from "./schema";
import { InputType, ReturnType } from "./types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION,  Asset,  ENTITY_TYPE, Failure } from "@prisma/client";
import getCurrentUser from "@/app/actions/getCurrentUser";

const handler = async (data: InputType): Promise<ReturnType> => { 

  const { id,failureTagIDs,...values } = data;
  let failureM;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      error: "Unauthorized",
    };
  }
  const owner_id = currentUser.id
  try {

    const child = await prisma.failure.findUnique({ 
      where: { id },
      
    });

    // console.log("child.....", child)
    //Admin has express write
    //B
    if (child  ){

                    /* 
                     Owner of Board , owner of List, owner of failure, and admin have right to deleted or update failure
                    
                    */
                             
      // Update child data
    
      const keys = Object.keys(values);
      if (failureTagIDs!==undefined){
        // console.log('i am here')
         // updata failure taggs onlyy anr return
           await updateFailureWithTags({failure:child, updatedFailureData:failureTagIDs||[]}).then(x=>{                
              revalidatePath(`/assets`);
               //failure ={...x}          
                return { data: x };
   
           })
       }else {
      
       //update  general content
          failureM=  await prisma.failure.update({
              where: { id: child?.id },
              data: {  ...values, },
          });

        }
          
    } else {
      revalidatePath(`/assets`);
      return {
        error: `Record can't be updated. See record creator or Admin`
      }
    }
   
  } catch (error) {
    return {
      error: `Failed to update.${error}`
    }
  }

  revalidatePath(`/assets`);
  return { data: failureM };
};





export const updateFailure = createSafeAction(UpdateFailure, handler);


interface Props {
  //   boardId: string;
    failure:Failure,
    updatedFailureData:string []
  };
  
  interface Props2 {
    //   boardId: string;
      failure:Failure,
      updatedFailureData:string [];
      failureId:string
    };
  export const updateFailureWithTags= async(props: Props)=> {
      const {failure, updatedFailureData}= props
     
      if (!failure) {
        throw new Error('failure not found');
      }
    
      const oldTagIds = failure?.failureTagIDs||[];
      const newTagIds = updatedFailureData//.tagIDs;
    
      const tagsToAdd = newTagIds?.filter((id)=> !oldTagIds.includes(id));
      const tagsToRemove = oldTagIds?.filter(id => !newTagIds?.includes(id));

      await prisma.$transaction([
        ...tagsToAdd?.map(tagId => prisma.failureTag.update({
          where: { id: tagId },
          data: { failureIDs: { push: failure.id } }
        })),
      
      ]);
      
      const promises = tagsToRemove?.map(async (tagId) => {
          return removefailureIdFromTag(tagId,failure.id);
        });
  
      await Promise.all(promises)
      
      const updatedfailure = await prisma.failure.update({
        where: { id: failure.id },
        data: {failureTagIDs:updatedFailureData}
      });
  
      
       return reorderTagIds(failure.id)
      // return updatedfailure;
    }
    async function removefailureIdFromTag(tagId:string, failureId:string) {
      const tag = await prisma.failureTag.findUnique({
        where: { id: tagId },
       // include: { failures: true }, // Include failures for potential optimization
      });
    
      if (!tag) {
        throw new Error('Tag not found');
      }
      // console.log('get data1', tag.failureIDs)
      const updatedfailureIds = tag.failureIDs?.filter(id => id !== failureId);
      // console.log('get data2', updatedfailureIds)
     
      const updatedTag = await prisma.failureTag.update({
        where: { id: tagId },
        data: {failureIDs: updatedfailureIds.length > 0 ? updatedfailureIds : [], },
      });
    
      return updatedTag;
    }
    
async function reorderTagIds(failureId:string) {
  try {
    // Fetch the failure and its associated tags
    const failure = await prisma.failure.findUnique({
      where: { id: failureId },
      include: {
        failureTags: true,
      },
    });
  
    if (!failure) {
      throw new Error('failure not found');
    }
  
    // Sort tags by name
    const sortedTags = failure.failureTags?.sort((a, b) => a.name.localeCompare(b.name));
  
    // Create a new array of tagIDs based on the sorted tags
    const reorderedTagIds = sortedTags?.map((tag) => tag.id);
  
    // Update the failure with the reordered tagIDs
    const updatedfailure = await prisma.failure.update({
      where: { id: failureId },
      data: { failureTagIDs: reorderedTagIds },
    });
  
    return updatedfailure;
  } catch (error) {
    console.error('Error reordering tagIDs:', error);
    throw error;
  }
  }

/* 
List owner should be able to update a failure he doesnt own 



*/
