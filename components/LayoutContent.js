"use client";

import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

export default function LayoutContent({ children }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AppHeader />
      <main className="pt-6 md:pt-8">{children}</main>
      <AppFooter />
    </div>
  );
}
