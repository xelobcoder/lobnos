"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { store } from "../../lib/store";
import { applyApplicationSettingsToDocument } from "../../lib/themes";

const getCachedApplicationSettings = () => {
	if (typeof window === "undefined") return null;
	try {
		const cached = localStorage.getItem("applicationsettings");
		if (!cached) return null;
		const parsed = JSON.parse(cached);
		if (!parsed || typeof parsed !== "object") return null;
		if (parsed.user?.user && (parsed.user.user.role || parsed.user.user.username)) {
			return {
				...parsed.user,
				settings: parsed.settings || parsed.user.settings,
			};
		}

		if (parsed.user?.role || parsed.user?.username) return parsed;
		if (parsed.role || parsed.username) return { user: parsed, settings: parsed.settings };
		return null;
	} catch {
		localStorage.removeItem("applicationsettings");
		return null;
	}
};

const ApplicationContext = createContext(store);

export const ApplicationProvider = ({ children }) => {
	const [applicationsettings, setApplicationSettings] = useState(getCachedApplicationSettings);

	useEffect(() => {
		applyApplicationSettingsToDocument(applicationsettings?.settings);
	}, [applicationsettings]);

	return (
		<ApplicationContext.Provider value={{ applicationsettings, setApplicationSettings }}>
			{children}
		</ApplicationContext.Provider>
	);
};

export const useApplicationSettings = () => {
	return useContext(ApplicationContext);
};

export const useApplication = () => {
	return useApplicationSettings().applicationsettings;
};
