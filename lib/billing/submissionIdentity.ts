import CryptoJS from "crypto-js";

const pendingKeys = new Map<string, string>();
export class BillingSubmissionIdentityError extends Error {
     constructor(message: string) { super(message); this.name = "BillingSubmissionIdentityError"; }
}
export function billingSubmissionIdentity(payload: unknown) {
     const fingerprint = CryptoJS.SHA256(JSON.stringify(payload)).toString();
     const storageKey = `pls:billing:submission:${fingerprint}`;
     let storage: Storage | null, key: string;
     try {
          storage = typeof sessionStorage === "undefined" ? null : sessionStorage;
          key = storage?.getItem(storageKey) || pendingKeys.get(fingerprint) || CryptoJS.lib.WordArray.random(16).toString();
          storage?.setItem(storageKey, key);
     } catch {
          throw new BillingSubmissionIdentityError("A safe retry identity could not be preserved. Allow browser session storage before submitting this transaction.");
     }
     pendingKeys.set(fingerprint, key);
     return {
          key,
          complete() {
               if (storage && storage.getItem(storageKey) === key) storage.removeItem(storageKey);
               if (pendingKeys.get(fingerprint) === key) pendingKeys.delete(fingerprint);
          },
     };
}
