"use client";

import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

export default function LayoutContent({ children }) {
  return (
    <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
      <AppHeader />
      <main>{children}</main>
      <AppFooter />
    </div>
  );
}
