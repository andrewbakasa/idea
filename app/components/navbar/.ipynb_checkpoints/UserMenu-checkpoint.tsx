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
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface UserMenuProps {
  currentUser?: SafeUser | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
  const router = useRouter();
  const path = usePathname();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const rentModal = useRentModal();

  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  const onLogin = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }
    if (currentUser && currentUser?.isAdmin) {
      rentModal.onOpen();
    } else {
      return;
    }
  }, [loginModal, rentModal, currentUser]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [eleCallBack] = currentUser ? useIsClickOut(setIsOpen) : [null];

  return (
    <div ref={eleCallBack} className="relative">
      <div className="flex flex-row items-center gap-3 ">
        {
          <div
            onClick={onLogin}
            className={cn(
              "shadow-lg hidden md:block text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition ",
              currentUser?.isAdmin
                ? "cursor-pointer bg-orange-100"
                : "cursor-not-allowed opacity-50 aria-disabled"
            )}
          >
            {currentUser?.isAdmin ? currentUser.email : currentUser?.email}
          </div>
        }
        <div
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
            <Avatar classList={""} src={currentUser?.image} />
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
                <MenuItem label="All projects" onClick={() => router.push("/")} />
                <MenuItem label="Media" onClick={() => router.push("/media")} />
                <MenuItem label="Assets" onClick={() => router.push("/assets")} />
                <MenuItem label="My projects" onClick={() => router.push("/myprojects")} />

                <div className="relative px-4" onClick={() => router.push("/tagged")}>
                  <div className="flex flex-row">
                    <span>{' Tagged Cards'}</span>
                    <Image
                      src={path == '/tagged' ? '/mailB.svg' : '/mailA.svg'}
                      width={35}
                      height={35} alt='likes'
                      className={cn("h-auto px-1 ")}
                    />
                  </div>

                  <div
                    className="absolute top-[-14px] left-[118px] p-2 bg-inherit text-red-700 rounded-full"
                  >
                    <span className='text-sm '
                      onClick={() => router.push('/tagged')}

                    >{currentUser?.taggedInboxIds.length}</span>
                  </div>
                </div>

                {currentUser?.isAdmin && (
                  <MenuItem
                    label="Archived Projects"
                    onClick={() => router.push("/archived-projects")}
                  />
                )}

                {currentUser?.isAdmin && (
                  <MenuItem
                    label="Archived Lists"
                    onClick={() => router.push("/archived-lists")}
                  />
                )}
                {currentUser?.isAdmin && (
                  <MenuItem
                    label="Archived Cards"
                    onClick={() => router.push("/archived-cards")}
                  />
                )}

                {currentUser && (
                  <MenuItem
                    label="Profile Settings"
                    onClick={() => router.push(`/user/${currentUser.id}`)}
                  />
                )}

                {currentUser?.isAdmin && (
                  <MenuItem label="Users" onClick={() => router.push("/users")} />
                )}
                <hr />
                {currentUser?.isAdmin && (
                  <MenuItem label="General Tags" onClick={() => router.push("/tags")} />
                )}
                {currentUser?.isAdmin && (
                  <MenuItem label="Failure Tags" onClick={() => router.push("/failureTags")} />
                )}
                {currentUser?.isAdmin && (
                  <MenuItem label="Asset Tags" onClick={() => router.push("/assetTags")} />
                )}
                <hr />
                <MenuItem label="Logout" onClick={() => signOut()} />
              </>
            ) : (
              <>
                <MenuItem label="Login" onClick={loginModal.onOpen} />
                <MenuItem label="Sign up" onClick={registerModal.onOpen} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;