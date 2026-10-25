import type { ReactNode } from 'react';

// Login responses depend on session cookies and must not be statically cached.
export const dynamic = 'force-dynamic';

export default function LoginLayout({ children }: { children: ReactNode }) {
    return children;
}
