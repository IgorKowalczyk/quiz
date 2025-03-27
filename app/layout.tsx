import { RotateCwIcon } from "lucide-react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import FullScreen from "@/components/fullscreen";
import SocketStatus from "@/components/socket-status";
import ThemeSwitcher from "@/components/theme-switcher";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = localFont({
 src: "./fonts/GeistVF.woff",
 variable: "--font-geist-sans",
 weight: "100 900",
});
const geistMono = localFont({
 src: "./fonts/GeistMonoVF.woff",
 variable: "--font-geist-mono",
 weight: "100 900",
});

export const metadata: Metadata = {
 title: "Quiz App",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <html lang="en" suppressHydrationWarning>
   <body className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-mono)] antialiased`}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange enableColorScheme>
     <FullScreen />
     <SocketStatus />
     <ThemeSwitcher />
     <Toaster
      theme="dark"
      icons={{
       loading: <RotateCwIcon className="size-4 animate-spin" />,
      }}
     />

     <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
      <main className="row-start-2 flex w-full max-w-2xl flex-col items-center gap-4">{children}</main>
     </div>
    </ThemeProvider>
   </body>
  </html>
 );
}
