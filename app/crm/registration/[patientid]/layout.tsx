'use client';

export default function RegistrationSectionLayout({
     children,
}: {
     children: React.ReactNode;
}) {
     return (
          <div className="w-100 p-2">
               {children}
          </div>
     );
}
