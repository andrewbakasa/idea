import { z } from "zod";
import { Asset, Failure} from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { CreateFailure } from "./schema";

export type InputType = z.infer<typeof CreateFailure>;
export type ReturnType = ActionState<InputType, Failure>;
