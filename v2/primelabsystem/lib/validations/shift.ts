import * as z from "zod"

export const shiftFormSchema = z.object({
  name: z.string().min(2, "Shift name must be at least 2 characters"),
  color: z.string().min(4, "Please select a color"),
  starttime: z.string().min(5, "Start time is required"),
  endtime: z.string().min(5, "End time is required"),
})

export type ShiftFormValues = z.infer<typeof shiftFormSchema>