import { z } from "zod";

export const CreateAsset = z.object({
  name: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title is required",
  }).min(3, {
    message: "Title is too short",
  }),
  asset_num: z.string(),
  capacity: z.string(),
});
