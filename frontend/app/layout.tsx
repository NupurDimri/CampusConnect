import { AuthProvider } from "@/context/AuthContext";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campus Connect | Your Career Starts Here",
  description:
    "Campus Connect helps students discover placement opportunities, track applications, and connect with recruiters.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
         <AuthProvider>

         
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}