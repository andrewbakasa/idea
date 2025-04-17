import { z } from "zod";
import { AssetCategory, Tag, } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { UpdateTag } from "./schema";

export type InputType = z.infer<typeof UpdateTag>;
export type ReturnType = ActionState<InputType, AssetCategory>;
