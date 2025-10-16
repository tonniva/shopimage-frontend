// components/LogoutButton.js
"use client";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        router.replace("/login");
      }}
      className="text-sm underline"
    >
      Logout
    </button>
  );
}