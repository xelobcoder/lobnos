'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { loadPatientImage } from '../../lib/patientImages';

export default function usePatientImage(patientId?: number | null) {
    const [state, setState] = useState({ patientId, imageUrl: null as string | null, loading: false, error: '' });
    const request = useRef(0);
    const controller = useRef<AbortController | null>(null);
    const objectUrl = useRef<string | null>(null);
    const refresh = useCallback(async () => {
        const generation = ++request.current;
        controller.current?.abort();
        const abort = new AbortController();
        controller.current = abort;
        if (!patientId || !Number.isSafeInteger(patientId) || patientId <= 0) {
            if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
            objectUrl.current = null;
            setState({ patientId, imageUrl: null, loading: false, error: '' });
            return;
        }
        setState(previous => ({ patientId, imageUrl: previous.patientId === patientId ? previous.imageUrl : null, loading: true, error: '' }));
        try {
            const image = await loadPatientImage(patientId, { signal: abort.signal });
            if (abort.signal.aborted || request.current !== generation) return;
            const nextUrl = image ? URL.createObjectURL(image.blob) : null;
            if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
            objectUrl.current = nextUrl;
            setState({ patientId, imageUrl: nextUrl, loading: false, error: '' });
        } catch (error: any) {
            if (abort.signal.aborted || request.current !== generation) return;
            setState(previous => ({ ...previous, patientId, loading: false, error: error?.message || 'Unable to load patient photo.' }));
            throw error;
        }
    }, [patientId]);

    useEffect(() => {
        void refresh().catch(() => undefined);
        return () => {
            ++request.current;
            controller.current?.abort();
            if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
            objectUrl.current = null;
        };
    }, [refresh]);

    const current = state.patientId === patientId ? state : { imageUrl: null, loading: !!patientId, error: '' };
    return { imageUrl: current.imageUrl, loading: current.loading, error: current.error, refresh };
}
