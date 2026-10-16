export interface FacilityForm {
     companyName: string; email: string; phone: string; address: string;
     countryId: string; stateId: string; districtId: string;
     adminName: string; adminEmail: string; adminPassword: string; licenseDays: string;
     street?: string; gpsAddress?: string;
     moduleConfiguration?: ModuleConfigurationForm;
}
export const MODULE_LABELS = {
     pharmacy: "Pharmacy",
     email: "Email",
     sms: "SMS",
     inventory: "Inventory",
     deviceInterfacing: "Device interfacing",
     commissions: "Commissions",
     analytics: "Analytics",
     appointments: "Appointments",
     expenses: "Expenses",
     consultations: "Consultations",
     imaging: "Imaging",
     billing: "Billing",
     registration: "Registration",
     laboratoryOperations: "Laboratory operations",
} as const;
export type ModuleName = keyof typeof MODULE_LABELS;
const coreModules: ModuleName[] = ["pharmacy", "email", "sms", "inventory", "deviceInterfacing"];
export interface ModuleConfigurationForm {
     branchMode: "single" | "multiple"; currency: string;
     modules: Record<ModuleName, { enabled: boolean; monthlyPrice: string }>;
}
export interface ModulePricingCatalogEntry {
     currency: string;
     modules: Record<ModuleName, string>;
}
export function parseModulePricingCatalogEntry(value: unknown): ModulePricingCatalogEntry | null {
     if (!value || typeof value !== "object" || Array.isArray(value)) return null;
     const entry = value as Partial<ModulePricingCatalogEntry>;
     const modules = entry.modules;
     if (typeof entry.currency !== "string" || !/^[A-Z]{3}$/.test(entry.currency) ||
          !modules || typeof modules !== "object" || Array.isArray(modules)) return null;
     const normalizedModules = {} as Record<ModuleName, string>;
     for (const moduleName of Object.keys(MODULE_LABELS) as ModuleName[]) {
          const price = modules[moduleName];
          if (price === undefined && !coreModules.includes(moduleName)) {
               normalizedModules[moduleName] = "0.00";
          } else if (typeof price === "string" && /^(0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(price)) {
               normalizedModules[moduleName] = price;
          } else {
               return null;
          }
     }
     return { currency: entry.currency, modules: normalizedModules };
}
export function applyModuleCatalogPrices(config: ModuleConfigurationForm, pricing: ModulePricingCatalogEntry): ModuleConfigurationForm {
     const modules = { ...config.modules };
     for (const moduleName of Object.keys(MODULE_LABELS) as ModuleName[]) {
          modules[moduleName] = { ...modules[moduleName], monthlyPrice: pricing.modules[moduleName] };
     }
     return { ...config, currency: pricing.currency, modules };
}
export const defaultModuleConfiguration = (): ModuleConfigurationForm => ({
     branchMode: "single", currency: "GHS", modules: {
          pharmacy: { enabled: false, monthlyPrice: "0.00" }, email: { enabled: false, monthlyPrice: "0.00" },
          sms: { enabled: false, monthlyPrice: "0.00" }, inventory: { enabled: false, monthlyPrice: "0.00" },
          deviceInterfacing: { enabled: false, monthlyPrice: "0.00" },
          commissions: { enabled: false, monthlyPrice: "0.00" }, analytics: { enabled: false, monthlyPrice: "0.00" },
          appointments: { enabled: false, monthlyPrice: "0.00" }, expenses: { enabled: false, monthlyPrice: "0.00" },
          consultations: { enabled: false, monthlyPrice: "0.00" }, imaging: { enabled: false, monthlyPrice: "0.00" },
          billing: { enabled: false, monthlyPrice: "0.00" }, registration: { enabled: false, monthlyPrice: "0.00" },
          laboratoryOperations: { enabled: false, monthlyPrice: "0.00" },
     },
});
export function moduleMonthlyTotal(config: ModuleConfigurationForm): string {
     let total = 0;
     for (const item of Object.values(config.modules)) {
          if (!item.enabled) continue;
          if (!/^(0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(item.monthlyPrice)) return "";
          const [whole, fraction = ""] = item.monthlyPrice.split(".");
          total += Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
     }
     return `${Math.floor(total / 100)}.${String(total % 100).padStart(2, "0")}`;
}
export type FormErrors = Partial<Record<keyof FacilityForm, string>>;

export function validateFacilityForm(form: FacilityForm): FormErrors {
     const errors: FormErrors = {};
     for (const [field, label, maximum] of [
          ["companyName", "Company name", 100], ["address", "Company address", 200],
          ["adminName", "Administrator name", 100],
     ] as const) {
          if (!form[field].trim() || form[field].trim().length > maximum) errors[field] = `${label} is required and must not exceed ${maximum} characters.`;
     }
     for (const [field, maximum] of [["email", 100], ["adminEmail", 200]] as const) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form[field].trim()) || form[field].trim().length > maximum) errors[field] = "Enter a valid email address.";
     }
     if (!/^[0-9]{7,10}$/.test(form.phone.trim()) || Number(form.phone.trim()) > 4294967295) errors.phone = "Use 7 to 10 digits only, with a maximum value of 4294967295.";
     for (const field of ["countryId", "stateId", "districtId"] as const) {
          if (!/^[1-9]\d*$/.test(form[field]) || !Number.isSafeInteger(Number(form[field]))) errors[field] = "Select a location.";
     }
     if (form.adminPassword.length < 12) errors.adminPassword = "Use at least 12 characters.";
     else if (new TextEncoder().encode(form.adminPassword).length > 72) errors.adminPassword = "The password must not exceed 72 UTF-8 bytes.";
     const days = Number(form.licenseDays);
     if (!Number.isInteger(days) || days < 1 || days > 3650) errors.licenseDays = "Use a whole number between 1 and 3650 days.";
     for (const field of ["street", "gpsAddress"] as const) if ((form[field] || "").trim().length > 100) errors[field] = "Use at most 100 characters.";
     if (form.moduleConfiguration) {
          const config = form.moduleConfiguration;
          if (!/^[A-Z]{3}$/.test(config.currency) ||
               !["single", "multiple"].includes(config.branchMode) ||
               Object.values(config.modules).some(item => !/^(0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(item.monthlyPrice)) ||
               !moduleMonthlyTotal(config) || Number(moduleMonthlyTotal(config)) > 9999999999.99) {
               errors.moduleConfiguration = "Use a three-letter currency and nonnegative module prices with at most two decimal places.";
          }
     }
     return errors;
}

export function generateFacilityPassword(): string {
     const sets = ["abcdefghijkmnopqrstuvwxyz", "ABCDEFGHJKLMNPQRSTUVWXYZ", "23456789", "!@#$%^&*-_=+?"];
     const random = (maximum: number) => {
          const buffer = new Uint32Array(1);
          const limit = Math.floor(0x100000000 / maximum) * maximum;
          do { crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
          return buffer[0] % maximum;
     };
     const characters = sets.map((set) => set[random(set.length)]);
     const alphabet = sets.join("");
     while (characters.length < 16) characters.push(alphabet[random(alphabet.length)]);
     for (let index = characters.length - 1; index > 0; index--) {
          const other = random(index + 1);
          [characters[index], characters[other]] = [characters[other], characters[index]];
     }
     return characters.join("");
}
