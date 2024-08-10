import { InfoRounded } from "@mui/icons-material"

export default function AlertInmportantInformation() {
    return <div className="alert alert-warning border-warning border-2">
        <div style={{ textDecoration: 'underline' }}><InfoRounded /> Important Information</div>Use the plain field to set the reference range for male and female individuals if the references vary between genders. Additionally, you can set up a general reference range applicable to both males and females, adults and children. If the reference ranges for children differ, please specify the limits for children in the plain field.
        <br />
        <div style={{ textDecoration: 'underline' }}>Example</div>
        Female: 2003-83838;
        <br />
        Male:8383-83883;
        <br />
        General: 383-7373;
        <br />
        Children: 8494-8484
    </div>
}