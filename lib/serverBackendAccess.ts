export function getBackendAuthorization(): string | undefined {
	const token = process.env.PLS_BACKEND_ACCESS_TOKEN?.trim();
	if (!token) return undefined;

	return `Bearer ${token}`;
}
