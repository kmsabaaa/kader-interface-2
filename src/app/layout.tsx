import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import CustomCursor from "./components/CustomCursor";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "Kader | AI-Powered Video Production Ecosystem",
  description: "The premier integrated marketplace for video production talent, equipment, and locations in the Middle East.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#030303] text-white antialiased overflow-x-hidden font-sans">
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#f59e0b",
              colorBackground: "#0a0a0a",
              colorText: "#ffffff",
              borderRadius: "0.75rem",
            }
          }}
        >
          {/* 1. Main Content Base */}
          <main className="relative z-1">{children}</main>
          
          {/* 2. Overlays - Cursor is z-[9999] */}
          <CustomCursor />
          
          {/* 3. Global UI - Navbar is now z-[10000] and rendered last */}
          <Navbar />
        </ClerkProvider>
      </body>
    </html>
  );
}