import * as yup from "yup";

export function buildPersonalInformationSchema(config) {
    return yup.object({
        designation: config?.designation?.visible
            ? config?.designation?.compulsory
                ? yup.string().required("Designation is required")
                : yup.string()
            : yup.mixed().notRequired(),
        firstname: config?.firstname?.visible
            ? config?.firstname?.compulsory
                ? yup.string().required("First Name is required")
                : yup.string()
            : yup.mixed().notRequired(),
        lastname: config?.lastname?.visible
            ? config?.lastname?.compulsory
                ? yup.string().required("Last Name is required")
                : yup.string()
            : yup.mixed().notRequired(),
        middlename: config?.middlename?.visible
            ? yup.string()
            : yup.mixed().notRequired(),
        days: config?.days?.visible
            ? config?.days?.compulsory
                ? yup
                    .number("A numeric value is required")
                    .min(1, "Day must be at least 1")
                    .max(31, "Day must be at most 31")
                    .required("Day is required")
                : yup
                    .number("A numeric value is required")
                    .min(1, "Day must be at least 1")
                    .max(31, "Day must be at most 31")
            : yup.mixed().notRequired(),
        months: config?.months?.visible
            ? config?.months?.compulsory
                ? yup
                    .number()
                    .min(1, "Month must be at least 1")
                    .max(12, "Month must be at most 12")
                    .required("Month is required")
                : yup
                    .number()
                    .min(1, "Month must be at least 1")
                    .max(12, "Month must be at most 12")
            : yup.mixed().notRequired(),
        years: config?.years?.visible
            ? config?.years?.compulsory
                ? yup
                    .number()
                    .min(1900, "Year must be at least 1900")
                    .max(new Date().getFullYear(), "Year is invalid")
                    .required("Year is required")
                : yup
                    .number()
                    .min(1900, "Year must be at least 1900")
                    .max(new Date().getFullYear(), "Year is invalid")
            : yup.mixed().notRequired(),
        age: config?.age?.visible
            ? yup.number().min(0).max(150)
            : yup.mixed().notRequired(),
        ageType: config?.ageType?.visible
            ? config?.ageType?.compulsory
                ? yup.string().required("Age type is required")
                : yup.string()
            : yup.mixed().notRequired(),
        gender: config?.gender?.visible
            ? config?.gender?.compulsory
                ? yup.string().required("Gender is required")
                : yup.string()
            : yup.mixed().notRequired(),
        mobile: config?.mobile?.visible
            ? config?.mobile?.compulsory
                ? yup
                    .string()
                    .matches(/^\d{10}$/, "Mobile number must be 10 digits")
                    .required("Mobile number is required")
                : yup.string().matches(/^\d{10}$/, "Mobile number must be 10 digits")
            : yup.mixed().notRequired(),
        whatAppcontact: config?.whatAppcontact?.visible
            ? yup.string().matches(/^\d{10}$/, "WhatsApp number must be 10 digits")
            : yup.mixed().notRequired(),
        email: config?.email?.visible
            ? config?.email?.compulsory
                ? yup.string().email("Invalid email").required("Email is required")
                : yup.string().email("Invalid email")
            : yup.mixed().notRequired(),
        occupation: config?.occupation?.visible
            ? config?.occupation?.compulsory
                ? yup.string().required("Occupation is required")
                : yup.string()
            : yup.mixed().notRequired(),
        patientOrganization: config?.patientOrganization?.visible
            ? config?.patientOrganization?.compulsory
                ? yup.string().required("Patient Organization is required")
                : yup.string()
            : yup.mixed().notRequired(),
        maritalstatus: config?.maritalstatus?.visible
            ? config?.maritalstatus?.compulsory
                ? yup.string().required("Marital status is required")
                : yup.string()
            : yup.mixed().notRequired(),
    });
}
