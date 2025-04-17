import { z } from "zod";

export const UpdateAsset = z.object({
  
  assetCatIDs: z.optional(
    z.array(z.string())
  ),
  name: z.optional(
    z.string({
      required_error: "Title is required",
      invalid_type_error: "Title is required",
    }).min(3, {
      message: "Title is too short",
    })
  ),

  asset_num: z.optional(
    z.string()
  ),
  capacity: z.optional(
    z.string()
  ),
  availability: z.optional(
    z.string()
  ),
  id: z.string(),
  
});
