const commonWords = ["password", "qwerty", "qwertyuiop", "asdfghjkl", "letmein", "welcome", "welcomehome", "admin", "administrator", "changeme", "iloveyou", "abcdefgh", "abcd", "abc", "ab", "primelab", "laboratory", "trustno", "monkey", "dragon", "football", "baseball", "basketball", "sunshine", "princess", "superman", "batman", "master", "secret", "login", "testing", "test", "computer", "internet", "passw", "pass", "default", "temporary", "temp", "guest", "root", "access", "security", "michael", "jennifer", "charlie", "donald", "freedom", "whatever", "hello", "helloworld", "godbless", "blessed", "christian", "jesus", "ghana", "accra", "tamale", "genesis", "hospital", "pharmacy", "merlin", "mustang", "starwars", "pokemon", "zaqwsx", "qazwsx", "qweasd", "zxcvbnm"];
export function passwordProblem(password: unknown): string | null {
    if (typeof password !== 'string' || password.length < 12) return 'Use at least 12 characters.';
    if (new TextEncoder().encode(password).length > 72) return 'Use at most 72 UTF-8 bytes.';
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return 'Include a letter and a number.';
    const normalized = password.toLowerCase().replace(/[\d\W_]+$/g, '').replace(/[@]/g, 'a').replace(/[0]/g, 'o').replace(/[!1]/g, 'i').replace(/[3]/g, 'e').replace(/[$5]/g, 's').replace(/[^a-z]/g, '');
    if (commonWords.some(word => normalized === word || normalized === word + word) || /^(.)\1+$/.test(password) || /^(0123456789|1234567890|123456789012|abcdefghijkl)/i.test(password)) return 'Choose a less common password. Avoid predictable words and sequences.';
    return null;
}
export function suggestPassword(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(20));
    return 'Aa7!' + Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
