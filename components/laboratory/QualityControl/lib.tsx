import { customFetch } from "../../Auth/customFetch";

interface FetchDevicesArgumentsProps {
    setDevices: React.Dispatch<React.SetStateAction<any>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    toast: {
        error: (message: string) => void;
    };
}

export const fetchDevices = async (data?: FetchDevicesArgumentsProps) => {
    try {
        if (data?.setLoading) {
            data.setLoading(true);
        }

        const response = await customFetch('devices');
        if (!response.data) throw new Error('Failed to fetch devices');

        if (!data) {
            return response.data;
        }

        data.setDevices(response.data);
        return response.data;
    } catch (error) {
        if (data?.toast) {
            data.toast.error('Failed to load devices');
        }
        console.error(error);
        throw error;
    } finally {
        if (data?.setLoading) {
            data.setLoading(false);
        }
    }
};