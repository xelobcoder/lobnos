import { z } from "zod";
import type { FacilityForm } from "./provisioningForm";

export const marketplaceApplicationSchema = z.object({
     id: z.coerce.number().int().positive(),
     slug: z.string(),
     name: z.string(),
     region: z.string(),
     locality: z.string(),
     address: z.string(),
     phone: z.string(),
     contact_email: z.string(),
     admin_email: z.string().optional(),
     description: z.string(),
     currency: z.string(),
     status: z.enum(["pending", "approved", "suspended"]),
     integration_state: z.enum(["independent", "linked", "provisioning", "provision_failed"]),
     linked_tenant_id: z.coerce.number().int().positive().nullable(),
     created_at: z.string(),
});
export const marketplaceApplicationsSchema = z.object({ facilities: z.array(marketplaceApplicationSchema) })
     .transform(result => result.facilities);
export type MarketplaceApplication = z.infer<typeof marketplaceApplicationSchema>;

export function applicationProvisioningForm(application: MarketplaceApplication, defaults: FacilityForm): FacilityForm {
     return {
          ...defaults,
          companyName: application.name,
          email: application.contact_email,
          phone: application.phone,
          address: application.address,
          adminName: "",
          adminEmail: application.admin_email || application.contact_email,
          adminPassword: "",
          countryId: "",
          stateId: "",
          districtId: "",
          moduleConfiguration: defaults.moduleConfiguration && {
               ...defaults.moduleConfiguration, currency: application.currency,
          },
     };
}
