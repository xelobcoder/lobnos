import { createContext, useContext, useState } from "react";
import { ToastContainer, toast } from "react-bootstrap";

const templateSchema = { runningTemplates: [], testpanels: [], stocks: [], runningTemplatesIdx: [] }
const LimsConnectionCreationContext = createContext(templateSchema);

export function LimsConnectionCreationProvider({ children }) {
    const [templates, setTemplates] = useState(templateSchema);

    return (
        <LimsConnectionCreationContext.Provider value={{ templates, setTemplates, toast }}>
            <ToastContainer theme="colored" position="top-right" className={'text-sm'} />
            {children}
        </LimsConnectionCreationContext.Provider>
    );
}

export function UseLimsConnectionCreationContext() {
    return useContext(LimsConnectionCreationContext);
}
