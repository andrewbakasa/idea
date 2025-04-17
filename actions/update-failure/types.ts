import { z } from "zod";
import {Failure } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { UpdateFailure } from "./schema";

export type InputType = z.infer<typeof UpdateFailure>;
export type ReturnType = ActionState<InputType, Failure>;
