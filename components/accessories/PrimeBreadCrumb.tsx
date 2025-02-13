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
            <div className="flex space-x-2 d-flex my-2 pls-color">
                {links.map((link, index) => (
                    <div key={link.href} className="flex items-center">
                        {index > 0 && (
                            <span className="text-gray-400 mx-2" aria-hidden="true">
                                &gt;
                            </span>
                        )}
                        {index === links.length - 1 ? (
                            <Link
                                href={link.href}
                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                                {link.label}
                            </Link>
                        ) : (
                            <Link
                                href={link.href}
                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                                {link.label}
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </nav>
    );
}