"use client";

import { useQuery } from "@tanstack/react-query";

import { CardWithList } from "@/types";
import { fetcher } from "@/lib/fetcher";
import { AuditLog } from "@prisma/client";
import { useCardModal } from "@/hooks/use-card-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { Header } from "./header";
import { Description } from "./description";
import { Actions } from "./actions";
import { Activity } from "./activity";
import { useState } from "react";

export const CardModal = () => {
  //id not avialable insert a dummy id
  const id = useCardModal((state) => {return state.id? state.id:"65c91a9a001eefed4bdacc62" });
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);
  const [activityViewMode,setActivityViewMode]=useState(true)
  const { data: cardData } = useQuery<CardWithList>({
    queryKey: ["card", id],
    queryFn: () => fetcher(`/api/cards/${id}`),
  });

  const { data: auditLogsData } = useQuery<AuditLog[]>({
    queryKey: ["card-logs", id],
    queryFn: () => fetcher(`/api/cards/${id}/logs`),
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        {!cardData
          ? <Header.Skeleton />
          : <Header data={cardData} />
        }
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4 max-h-[100vh] overflow-x-hidden overflow-y-auto">
          <div className="col-span-3">
            <div className="w-full space-y-2">
              {!cardData
                ? <Description.Skeleton />
                : <Description data={cardData} setActivityViewMode={setActivityViewMode} />
              }
              {/* Hidden if in mobile */}
              {/*show Log only if not editing  */}
              {activityViewMode  && <div className="hidden md:block ">
                {!auditLogsData
                  ? <Activity.Skeleton />
                  : <Activity items={auditLogsData} />
                }
              </div>}
            </div>
          </div>
          {!cardData
            ? <Actions.Skeleton />
            : <Actions data={cardData} />
          }
        </div>
      </DialogContent>
    </Dialog>
  );
};
