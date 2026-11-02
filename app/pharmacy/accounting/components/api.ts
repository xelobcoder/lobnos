'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { customFetch, customFetchMutation } from '../../../../components/Auth/customFetch';
import { decodeAccounts, decodeInventoryControl, decodeSettings, errorMessage, record } from '../../../../lib/pharmacyAccounting';
import { decodeTax } from '../../../../lib/pharmacyTax';

export async function request<T>(path: string, method?: 'POST' | 'PUT', body?: unknown, external = false): Promise<T> {
  const endpoint = external ? path : `pharmacy/accounting/${path}`;
  const response: unknown = method ? await customFetchMutation(endpoint, method, body) : await customFetch(endpoint);
  const envelope = record(response);
  if (envelope.success !== true) throw new Error(errorMessage(response));
  if (!('data' in envelope)) throw new Error('The accounting API did not return a data envelope.');
  const data = !method && !external && path === 'accounts' ? decodeAccounts(envelope.data)
    : !method && !external && path === 'settings' ? decodeSettings(envelope.data)
      : !method && !external && path.split('?')[0] === 'tax' ? decodeTax(envelope.data)
        : !method && !external && path === 'inventory/reconciliation' ? decodeInventoryControl(envelope.data) : envelope.data;
  return data as T;
}
export function useResource<T>(path: string, external = false, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled), [error, setError] = useState('');
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const id = ++generation.current; setLoading(enabled); setError(''); setData(null);
    if (!enabled) return;
    try { const result = await request<T>(path, undefined, undefined, external); if (generation.current === id) setData(result); }
    catch (e) { if (generation.current === id) setError(e instanceof Error ? e.message : 'Unable to load accounting data.'); }
    finally { if (generation.current === id) setLoading(false); }
  }, [path, external, enabled]);
  useEffect(() => { void refresh(); return () => { generation.current++; }; }, [refresh]);
  return { data, loading, error, refresh };
}
export function useMutation() {
  const [pending, setPending] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const lock = useRef(false);
  // Retain a key after ambiguous failures, so retrying the same payload cannot duplicate a posting.
  const keys = useRef(new Map<string, string>());
  async function mutate(path: string, body: Record<string, unknown>, method: 'POST' | 'PUT' = 'POST', external = false, onSuccess?: (data: unknown) => void) {
    if (lock.current) return false;
    lock.current = true; setPending(true); setError(''); setNotice('');
    const signature = JSON.stringify([path, body]);
    const key = keys.current.get(signature) || crypto.randomUUID(); keys.current.set(signature, key);
    try {
      const data = await request<unknown>(path, method, { ...body, idempotencyKey: key }, external);
      onSuccess?.(data);
      keys.current.delete(signature); setNotice('Saved successfully.'); return true;
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save.'); return false; }
    finally { lock.current = false; setPending(false); }
  }
  return { mutate, pending, error, notice };
}
