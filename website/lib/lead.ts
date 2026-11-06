import { z } from "zod";

export const leadSchema = z.object({
  formType: z.enum(["demo", "contact"]),
  fullName: z.string().trim().min(2, "Enter your name.").max(120),
  workEmail: z.string().email("Enter a valid email address.").max(254),
  phone: z.string().trim().max(40).optional().default(""),
  organization: z.string().trim().max(160).optional().default(""),
  country: z.string().trim().max(80).optional().default(""),
  facilityType: z.string().trim().max(100).optional().default(""),
  facilitiesCount: z.string().trim().max(40).optional().default(""),
  interests: z.array(z.string().trim().max(80)).max(12).optional().default([]),
  subject: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(10, "Add a little more detail (at least 10 characters).").max(4000),
  _website: z.string().max(0, "Invalid submission.").optional().default(""),
}).superRefine((value, context) => {
  if (value.formType === "demo" && value.organization.length < 2) {
    context.addIssue({ code: "custom", path: ["organization"], message: "Enter your facility or organization." });
  }
});

export type LeadSubmission = z.infer<typeof leadSchema>;
