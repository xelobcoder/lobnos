"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface FormState {
    errors?: {
        email?: string[];
        password?: string[];
    };
    message?: string;
}

export const validateLoginForm = async (data: { email: string; password: string }): Promise<FormState> => {
    const errors: FormState['errors'] = {};

    if (!data.email) {
        errors.email = ['Email is required.'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errors.email = ['Please enter a valid email.'];
    }

    const password = data.password.trim();
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/.test(password)) {
        errors.password = [
            ...(password.length < 8 ? ['Password must be at least 8 characters long.'] : []),
            ...(!/[a-zA-Z]/.test(password) ? ['Password must contain at least one letter.'] : []),
            ...(!/[0-9]/.test(password) ? ['Password must contain at least one number.'] : []),
            ...(!/[^a-zA-Z0-9]/.test(password) ? ['Password must contain at least one special character.'] : []),
        ];
    }

    if (Object.keys(errors).length > 0) {
        return { errors };
    }

    const cookieStore = cookies();
    cookieStore.set("pls-session", "Tiifu Hamza is king of Tiifu Family Insha Allah By Allah might", {
        httpOnly: true,
        secure: true,
    });

    return { message: "Validation successful" };
};
