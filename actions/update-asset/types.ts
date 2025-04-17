import { z } from "zod";
import {  Asset } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { UpdateAsset } from "./schema";

export type InputType = z.infer<typeof UpdateAsset>;
export type ReturnType = ActionState<InputType, Asset>;
