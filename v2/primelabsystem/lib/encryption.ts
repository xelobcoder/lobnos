import * as CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef";
const IV = process.env.NEXT_PUBLIC_ENCRYPTION_IV || "abcdef9876543210";

export function plsEncryption(text: string): string {
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
    const iv = CryptoJS.enc.Utf8.parse(IV);

    const encrypted = CryptoJS.AES.encrypt(text, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString();

    return encodeURIComponent(encrypted);
}

export function plsDecryption(encryptedText: string): string {
    try {
        const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
        const iv = CryptoJS.enc.Utf8.parse(IV);

        const decrypted = CryptoJS.AES.decrypt(decodeURIComponent(encryptedText), key, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        if (!decryptedText) throw new Error("Decryption failed");

        return decryptedText;
    } catch (error) {
        throw new Error("Failed to decrypt the text.");
    }
}
