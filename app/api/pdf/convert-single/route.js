// app/api/pdf/convert-single/route.js
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract headers for forwarding
    const userId = request.headers.get("x-user-id") || "anon";
    const plan = request.headers.get("x-plan") || "free";
    
    // Create new FormData for backend
    const backendFormData = new FormData();
    
    // Copy file
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }
    backendFormData.append("file", file);
    
    // Copy parameters
    const page = formData.get("page") || "0";
    const format = formData.get("format") || "jpeg";
    const target_w = formData.get("target_w");
    const target_h = formData.get("target_h");
    
    backendFormData.append("page", page);
    backendFormData.append("format", format);
    if (target_w) backendFormData.append("target_w", target_w);
    if (target_h) backendFormData.append("target_h", target_h);
    
    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/convert-pdf`, {
      method: "POST",
      body: backendFormData,
      headers: {
        "x-user-id": userId,
        "x-plan": plan,
      },
    });
    
    const result = await response.json();
    
    // Forward response with proper status
    return NextResponse.json(result, { 
      status: response.ok ? 200 : response.status 
    });
    
  } catch (error) {
    console.error("PDF convert-single error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
