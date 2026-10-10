import { z } from "zod";

export const websiteEnquirySchema = z.object({
     id: z.number().int().positive(),
     formType: z.enum(["demo", "contact"]),
     fullName: z.string(),
     workEmail: z.string().email(),
     phone: z.string(),
     organization: z.string(),
     country: z.string(),
     facilityType: z.string(),
     facilitiesCount: z.string(),
     interests: z.array(z.string()),
     subject: z.string(),
     message: z.string(),
     status: z.string(),
     submittedAt: z.string().datetime(),
     receivedAt: z.string().datetime(),
});
export const websiteEnquiriesSchema = z.object({
     enquiries: z.array(websiteEnquirySchema),
     page: z.number().int().positive(),
     hasMore: z.boolean(),
});
export type WebsiteEnquiry = z.infer<typeof websiteEnquirySchema>;
