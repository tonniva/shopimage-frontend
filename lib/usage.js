// lib/usage.js
import { createClient } from "@/utils/supabase/client";

/**
 * Log usage to server (which will save to Prisma database)
 * This should be called after successful conversion
 */
export async function logUsageOnce(bytes = 0) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      console.log("⚠️ No user logged in, skipping usage log");
      return;
    }

    // Call API route to log usage in Prisma database
    const response = await fetch("/api/usage/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        count: 1,
        bytes: bytes,
        status: "ok",
      }),
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log("✅ Usage logged successfully");
    } else {
      console.error("❌ Failed to log usage:", result.error);
    }

    return result;
  } catch (error) {
    console.error("❌ Error logging usage:", error);
  }
}