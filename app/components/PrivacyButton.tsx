'use client';

import { AiFillCamera, AiFillEyeInvisible, AiFillSecurityScan, AiFillSketchCircle, AiOutlineCamera, AiOutlineEyeInvisible, AiOutlineSecurityScan } from "react-icons/ai";
import { SafeUser } from "@/app/types";


import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface PrivacyButtonProps {
  boardId: string,
  currentState:Boolean,
  currentUser?: SafeUser | null
}

const PrivacyButton: React.FC<PrivacyButtonProps> = ({ 
  boardId,
  currentState,
  currentUser
}) => {
 
  const [isPublic, setIsPublic] =useState(currentState)
  const router = useRouter();
  const togglePrivacy =async()=>{
  let request;
    try {
      
   
      if (currentState) {
        //if public make private
        setIsPublic(currentState=>!currentState)
        request = () => axios.delete(`/api/privacyToggle/${boardId}`);
      } else {
        setIsPublic(currentState=>!currentState)
        request = () => axios.post(`/api/privacyToggle/${boardId}`);
      }
   
      await request();
      router.refresh();
      toast.success('Privacy setup successful');
      //console.log("result:", request)
    } catch (error) {
      toast.error('Something went wrong.');
    }finally{
      
    }
   }

  return (
    <div 
      onClick={()=>togglePrivacy()}
      className="
        relative
        hover:opacity-80
        transition
        cursor-pointer
      "
    >
      <AiOutlineSecurityScan
        size={28}
        className="
          fill-white
          absolute
          -top-[2px]
          -right-[2px]
        "
      />
      <AiFillSecurityScan
        size={24}
        className={
          isPublic ? 'fill-rose-500' : 'fill-neutral-500/70'
        }
      />
      <div className="opacity-0 hover:opacity-100 
                        duration-300 absolute inset-0  top-[20px] left-[-20px]  z-10 
                        flex text-[11px] text-white font-semibold"> {isPublic ? 'Public' : 'Private'} 
      </div>
    </div>
   );
}
 
export default PrivacyButton;