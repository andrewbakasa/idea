import { z } from "zod";

export const CreateFailure = z.object({
  description: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title is required",
  }).min(3, {
    message: "Title is too short",
  }),
  assetId: z.string(),

  occurrenceDate: z.optional(
    z.date({
      required_error: "Date is required",
      invalid_type_error: "Date is required",
    }),
  ),
  resolutionDate: z.optional(
    z.date({
      required_error: "Date is required",
      invalid_type_error: "Date is required",
    }),
  ),
});


// assetId         String @db.ObjectId
// description String
// occurrenceDate DateTime?
// resolutionDate DateTime?