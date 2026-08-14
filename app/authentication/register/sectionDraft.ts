export type SectionKey =
     | "emergency-contacts"
     | "documents"
     | "employment-history"
     | "certifications"
     | "education"
     | "licenses"
     | "bank-accounts"
     | "attendance";

export type SectionFieldType = "text" | "date" | "time" | "textarea";

export interface SectionField {
     key: string;
     label: string;
     type: SectionFieldType;
     placeholder?: string;
}

export interface SectionConfig {
     title: string;
     payloadKey:
     | "contacts"
     | "documents"
     | "employmentHistory"
     | "certifications"
     | "education"
     | "licenses"
     | "bankAccounts"
     | "attendance";
     itemLabel: string;
     fields: SectionField[];
}

export const SECTION_CONFIGS: Record<SectionKey, SectionConfig> = {
     "emergency-contacts": {
          title: "Emergency Contacts",
          payloadKey: "contacts",
          itemLabel: "Contact",
          fields: [
               { key: "fullName", label: "Full Name", type: "text", placeholder: "Contact full name" },
               { key: "relationship", label: "Relationship", type: "text", placeholder: "e.g. spouse" },
               { key: "mobile", label: "Mobile", type: "text", placeholder: "Contact mobile" },
               { key: "address", label: "Address", type: "textarea", placeholder: "Contact address" },
          ],
     },
     documents: {
          title: "Documents",
          payloadKey: "documents",
          itemLabel: "Document",
          fields: [
               { key: "documentType", label: "Document Type", type: "text", placeholder: "passport, cv, certificate" },
               { key: "filePath", label: "File Path / Reference", type: "text" },
          ],
     },
     "employment-history": {
          title: "Employment History",
          payloadKey: "employmentHistory",
          itemLabel: "Job",
          fields: [
               { key: "organization", label: "Organization", type: "text" },
               { key: "position", label: "Position", type: "text" },
               { key: "startDate", label: "Start Date", type: "date" },
               { key: "endDate", label: "End Date", type: "date" },
               { key: "responsibilities", label: "Responsibilities", type: "textarea" },
          ],
     },
     certifications: {
          title: "Certifications",
          payloadKey: "certifications",
          itemLabel: "Certification",
          fields: [
               { key: "certificationName", label: "Certification Name", type: "text" },
               { key: "organization", label: "Organization", type: "text" },
               { key: "issueDate", label: "Issue Date", type: "date" },
               { key: "expiryDate", label: "Expiry Date", type: "date" },
          ],
     },
     education: {
          title: "Education",
          payloadKey: "education",
          itemLabel: "Education",
          fields: [
               { key: "institution", label: "Institution", type: "text" },
               { key: "degree", label: "Degree", type: "text" },
               { key: "fieldOfStudy", label: "Field of Study", type: "text" },
               { key: "startDate", label: "Start Date", type: "date" },
               { key: "endDate", label: "End Date", type: "date" },
               { key: "grade", label: "Grade", type: "text" },
               { key: "certificateNumber", label: "Certificate Number", type: "text" },
          ],
     },
     licenses: {
          title: "Licenses",
          payloadKey: "licenses",
          itemLabel: "License",
          fields: [
               { key: "licenseName", label: "License Name", type: "text" },
               { key: "licenseNumber", label: "License Number", type: "text" },
               { key: "issuingAuthority", label: "Issuing Authority", type: "text" },
               { key: "issueDate", label: "Issue Date", type: "date" },
               { key: "expiryDate", label: "Expiry Date", type: "date" },
          ],
     },
     "bank-accounts": {
          title: "Bank Accounts",
          payloadKey: "bankAccounts",
          itemLabel: "Account",
          fields: [
               { key: "bankName", label: "Bank Name", type: "text" },
               { key: "accountName", label: "Account Name", type: "text" },
               { key: "accountNumber", label: "Account Number", type: "text" },
               { key: "branchName", label: "Branch Name", type: "text" },
               { key: "mobileMoneyNumber", label: "Mobile Money Number", type: "text" },
          ],
     },
     attendance: {
          title: "Attendance",
          payloadKey: "attendance",
          itemLabel: "Attendance",
          fields: [
               { key: "attendanceDate", label: "Date", type: "date" },
               { key: "checkIn", label: "Check In", type: "time" },
               { key: "checkOut", label: "Check Out", type: "time" },
          ],
     },
};

type DraftRows = Array<Record<string, string>>;

type DraftStore = Record<SectionKey, DraftRows>;

const DEFAULT_DRAFTS: DraftStore = {
     "emergency-contacts": [{ fullName: "", relationship: "", mobile: "", address: "" }],
     documents: [{ documentType: "", filePath: "" }],
     "employment-history": [{ organization: "", position: "", startDate: "", endDate: "", responsibilities: "" }],
     certifications: [{ certificationName: "", organization: "", issueDate: "", expiryDate: "" }],
     education: [{ institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", grade: "", certificateNumber: "" }],
     licenses: [{ licenseName: "", licenseNumber: "", issuingAuthority: "", issueDate: "", expiryDate: "" }],
     "bank-accounts": [{ bankName: "", accountName: "", accountNumber: "", branchName: "", mobileMoneyNumber: "" }],
     attendance: [{ attendanceDate: "", checkIn: "", checkOut: "" }],
};

const getStorageKey = (scope: string) => `register-section-draft-${scope}`;

const cloneDefault = (): DraftStore => JSON.parse(JSON.stringify(DEFAULT_DRAFTS));

const isClient = () => typeof window !== "undefined";

export const loadDraftStore = (scope: string): DraftStore => {
     if (!isClient()) {
          return cloneDefault();
     }

     const raw = window.localStorage.getItem(getStorageKey(scope));
     if (!raw) {
          return cloneDefault();
     }

     try {
          const parsed = JSON.parse(raw) as Partial<DraftStore>;
          const merged = cloneDefault();
          (Object.keys(DEFAULT_DRAFTS) as SectionKey[]).forEach((key) => {
               const rows = parsed[key];
               if (Array.isArray(rows) && rows.length > 0) {
                    merged[key] = rows.map((row) => {
                         const next: Record<string, string> = {};
                         Object.keys(DEFAULT_DRAFTS[key][0]).forEach((fieldKey) => {
                              next[fieldKey] = typeof row[fieldKey] === "string" ? row[fieldKey] : "";
                         });
                         return next;
                    });
               }
          });
          return merged;
     } catch {
          return cloneDefault();
     }
};

export const saveDraftStore = (scope: string, store: DraftStore) => {
     if (!isClient()) {
          return;
     }
     window.localStorage.setItem(getStorageKey(scope), JSON.stringify(store));
};

export const loadSectionDraft = (scope: string, section: SectionKey): DraftRows => {
     return loadDraftStore(scope)[section];
};

export const saveSectionDraft = (scope: string, section: SectionKey, rows: DraftRows) => {
     const store = loadDraftStore(scope);
     store[section] = rows.length > 0 ? rows : cloneDefault()[section];
     saveDraftStore(scope, store);
};

export const clearSectionDrafts = (scope: string) => {
     if (!isClient()) {
          return;
     }
     window.localStorage.removeItem(getStorageKey(scope));
};

const filterEmptyRows = (rows: DraftRows): DraftRows =>
     rows.filter((row) => Object.values(row).some((value) => String(value || "").trim()));

export const loadAllSectionPayloads = (scope: string) => {
     const store = loadDraftStore(scope);
     return {
          contacts: filterEmptyRows(store["emergency-contacts"]),
          documents: filterEmptyRows(store.documents),
          employmentHistory: filterEmptyRows(store["employment-history"]),
          certifications: filterEmptyRows(store.certifications),
          education: filterEmptyRows(store.education),
          licenses: filterEmptyRows(store.licenses),
          bankAccounts: filterEmptyRows(store["bank-accounts"]),
          attendance: filterEmptyRows(store.attendance),
     };
};

export const hydrateSectionDraftsFromUser = (user: any, scope: string) => {
     if (!isClient()) {
          return;
     }

     const store = cloneDefault();
     const sourceMap: Record<SectionKey, any[]> = {
          "emergency-contacts": Array.isArray(user.contacts) ? user.contacts : [],
          documents: Array.isArray(user.documents) ? user.documents : [],
          "employment-history": Array.isArray(user.employmentHistory) ? user.employmentHistory : [],
          certifications: Array.isArray(user.certifications) ? user.certifications : [],
          education: Array.isArray(user.education) ? user.education : [],
          licenses: Array.isArray(user.licenses) ? user.licenses : [],
          "bank-accounts": Array.isArray(user.bankAccounts) ? user.bankAccounts : [],
          attendance: Array.isArray(user.attendance) ? user.attendance : [],
     };

     (Object.keys(store) as SectionKey[]).forEach((section) => {
          const rows = sourceMap[section];
          if (!rows || rows.length === 0) {
               return;
          }

          const templateKeys = Object.keys(store[section][0]);
          store[section] = rows.map((row) => {
               const normalized: Record<string, string> = {};
               templateKeys.forEach((key) => {
                    normalized[key] = typeof row?.[key] === "string" ? row[key] : row?.[key] != null ? String(row[key]) : "";
               });
               return normalized;
          });
     });

     saveDraftStore(scope, store);
};
