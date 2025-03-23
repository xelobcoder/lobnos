import React from 'react';
import Link from 'next/link';

export interface BreadcrumbLink {
    href: string;
    label: string;
}

interface BreadcrumbProps {
    links: BreadcrumbLink[];
}

export default function PrimeBreadcrumb({ links }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className="text-sm">
            <div className="d-flex align-items-center my-2 gap-2">
                {links.map((link, index) => (
                    <div key={link.href} className="d-flex align-items-center gap-2">
                        {index === 0 ? (
                            <i className="ri-home-3-line text-primary fs-sm"></i>
                        ) : (
                            <i className="ri-arrow-right-s-line text-muted fs-xs"></i>
                        )}
                        <Link
                            href={link.href}
                            className={`text-decoration-none ${
                                index === links.length - 1 
                                    ? 'text-muted fw-medium' 
                                    : 'text-primary hover-underline'
                            }`}
                        >
                            {link.label}
                        </Link>
                    </div>
                ))}
            </div>
        </nav>
    );
}