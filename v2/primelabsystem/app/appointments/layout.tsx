import { ApplicationProvider } from "@/lib/ApplicationContext/useApplicationContext";
import { ThemeProvider } from "@/lib/ThemeContext/ThemeContext";
import { Suspense } from "react";
import AppSideBar from "@/components/ApplicationLayouts/AppSideBar";
import { Raleway } from 'next/font/google';
import "@/app/globals.css";

const raleway = Raleway({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-raleway',
});

export default function SMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <ApplicationProvider>
        <ThemeProvider>
          <div className={`fixed inset-0 flex ${raleway.className} 
            bg-gradient-to-br from-[#ffefe6] to-[#fff8f5] 
            dark:from-gray-900 dark:to-gray-800`}>
            <AppSideBar />
            <main className="flex-1 overflow-auto p-5 
              bg-white/50 dark:bg-gray-900/50 
              backdrop-blur-sm">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </ApplicationProvider>
    </Suspense>
  );
}
