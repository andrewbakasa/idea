"use client";

import { useEffect, useState } from "react";
import { MediaModal } from "@/components/modals/media-modal";
import { CardModal } from "@/components/modals/card-modal";
import { ProModal } from "@/components/modals/pro-modal";
import { CommentModal } from "../modals/comment-modal";
import { AssetModal } from "../modals/asset-modal";
import { FailureModal } from "../modals/failure-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <> 
      <FailureModal/>
      <AssetModal/>
      <CommentModal/>
      <MediaModal />
      <CardModal />
      <ProModal />
      {/* <UserSettingsModal /> */}
    </>
  )
}