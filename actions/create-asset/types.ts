import { z } from "zod";
import { Asset} from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { CreateAsset } from "./schema";

export type InputType = z.infer<typeof CreateAsset>;
export type ReturnType = ActionState<InputType, Asset>;
