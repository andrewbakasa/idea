'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import useLoginModal from "../../../app/hooks/useLoginModal";
import useRegisterModal from "../../../app/hooks/useRegisterModal";
import useRentModal from "../../../app/hooks/useRentModal";
import { SafeUser } from "../../../app/types";

import MenuItem from "./MenuItem";
import Avatar from "../Avatar";
import { useIsClickOut } from "./useIsClickOut";
import { cn} from "@/lib/utils";
interface UserMenuProps {
  currentUser?: SafeUser | null
}

const UserMenu: React.FC<UserMenuProps> = ({
  currentUser
}) => {
  const router = useRouter();

  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const rentModal = useRentModal();

  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  const onRent = useCallback(() => {
    if (!currentUser  ) {
      return loginModal.onOpen();
    }
    if (currentUser && currentUser?.isAdmin) { 
      rentModal.onOpen();
    }else {
      //nothing
      return
    }
  }, [loginModal, rentModal, currentUser]);


  //-------Implement click way trigger---------------------
  const [eleCallBack] = useIsClickOut(setIsOpen)
  //---------------------------------------------------------

  return ( 
    <div ref={eleCallBack} className="relative">
      <div className="flex flex-row items-center gap-3 ">
        {<div 
            onClick={onRent}
            className={
              cn("hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition ",
              currentUser?.isAdmin  ? "cursor-pointer" : "cursor-not-allowed opacity-50 aria-disabled",
            )}
          >
         {currentUser?.isAdmin? " Project Management" :"Project Management"}
          </div>
        }
        <div 
        //----
        onClick={toggleOpen}
        className="
          p-4
          md:py-1
          md:px-2
          border-[1px] 
          border-neutral-200 
          flex 
          flex-row 
          items-center 
          gap-3 
          rounded-full 
          cursor-pointer 
          hover:shadow-md 
          transition
          "
        >
          <AiOutlineMenu />
          <div className="hidden md:block">
            <Avatar classList= {""} src={currentUser?.image} />
          </div>
        </div>
      </div>
      {isOpen && (
        <div 
          className="
            absolute 
            rounded-xl 
            shadow-md
            w-[40vw]
            md:w-3/4 
            bg-white 
            overflow-hidden 
            right-0 
            top-12 
            text-sm
          "
        >
          <div className="flex flex-col cursor-pointer ">
            {currentUser ? (
              <>
                 <MenuItem 
                  label="All projects" 
                  onClick={() =>router.push('/')}
                />
                <MenuItem 
                  label="My projects" 
                  onClick={() =>router.push('/myprojects')}
                />
               
                {currentUser?.isAdmin && 
                  <MenuItem 
                    label="Archived Projects" 
                    onClick={() =>router.push('/archived-projects')}
                  />}

                 {currentUser?.isAdmin && 
                  <MenuItem 
                    label="Archived Lists" 
                    onClick={() =>router.push('/archived-lists')}
                  />}
                 {currentUser?.isAdmin && 
                  <MenuItem 
                    label="Archived Cards" 
                    onClick={() =>router.push('/archived-cards')}
                  />}  

                {currentUser && 
                  <MenuItem  
                        label="Profile Settings" 
                        onClick={() =>router.push(`/user/${currentUser.id}`)}
                  />}  

                 {currentUser?.isAdmin && 
                  <MenuItem 
                    label="Users" 
                    onClick={() =>router.push('/users')}
                  />}     
                <hr />
                <MenuItem 
                  label="Logout" 
                  onClick={() => signOut()}
                />
              </>
            ) : (
              <>
                <MenuItem 
                  label="Login" 
                  onClick={loginModal.onOpen}
                />
                <MenuItem 
                  label="Sign up" 
                  onClick={registerModal.onOpen}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
   );
}
 
export default UserMenu;