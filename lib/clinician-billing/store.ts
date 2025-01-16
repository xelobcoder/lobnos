export interface ClinicianBilling {
     concessionMode: 'absolute' | 'percentage',
     validity: string | Date,
     isOrganizationLimited: boolean,
     organizationList: number[],
     hasPackages: boolean,
     hasOrganization: boolean,
     referenceReferalOrganization: number[]
}




export class ClinicianBill {
     static calculate_test_price(concessionMode: 'absolute' | 'percentage', discount: number, testprice: number) {
          if (concessionMode !== "absolute" && concessionMode !== "percentage")
               return testprice;
          if (discount > testprice) return 0;

          if (concessionMode === "absolute") {
               return testprice - discount;
          }

          const discountAmount = (discount / 100) * testprice;
          return testprice - discountAmount;
     }


     addRereferenceOrganization(organizationId: number, referenceOrganization: number[]) {
          if (Array.isArray(referenceOrganization)) {
               const hasReferenceOrganization = referenceOrganization.find((ref: number) => ref === organizationId);

               if (hasReferenceOrganization) return referenceOrganization
               return [...referenceOrganization, organizationId];
          }
     }

} 