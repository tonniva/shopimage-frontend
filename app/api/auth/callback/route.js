import { NextResponse } from "next/server";
import { createServerSupabase } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * API Route to sync Supabase authenticated users to Prisma database
 * Called after successful Supabase OAuth login
 */
export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabase();
    
    // Exchange code for session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Error exchanging code:", error);
      return NextResponse.redirect(new URL("/", requestUrl.origin));
    }

    if (session?.user) {
      const supabaseUser = session.user;
      
      try {
        // Check if user already exists using $queryRawUnsafe
        const existingUsers = await prisma.$queryRawUnsafe(
          `SELECT * FROM "User" WHERE email = $1 LIMIT 1`,
          supabaseUser.email
        );

        if (!existingUsers || existingUsers.length === 0) {
          // Create new user
          await prisma.$executeRawUnsafe(
            `INSERT INTO "User" (id, email, name, image, "emailVerified", plan, "createdAt", "updatedAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'FREE', NOW(), NOW())`,
            supabaseUser.email,
            supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
            supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
            supabaseUser.email_confirmed_at ? new Date(supabaseUser.email_confirmed_at) : null
          );

          // Get the created user
          const newUsers = await prisma.$queryRawUnsafe(
            `SELECT * FROM "User" WHERE email = $1 LIMIT 1`,
            supabaseUser.email
          );
          const prismaUser = newUsers[0];

          // Create Account record
          await prisma.$executeRawUnsafe(
            `INSERT INTO "Account" (id, "userId", type, provider, "providerAccountId", access_token, refresh_token, expires_at, token_type, scope)
             VALUES (gen_random_uuid()::text, $1, 'oauth', $2, $3, $4, $5, $6, 'bearer', $7)
             ON CONFLICT ("provider", "providerAccountId") DO NOTHING`,
            prismaUser.id,
            supabaseUser.app_metadata?.provider || 'google',
            supabaseUser.id,
            session.access_token,
            session.refresh_token,
            session.expires_at ? Math.floor(session.expires_at) : null,
            supabaseUser.app_metadata?.provider === 'google' ? 'openid email profile' : null
          );

          console.log("✅ Created new user in database:", supabaseUser.email);
        } else {
          const prismaUser = existingUsers[0];

          // Update existing user
          await prisma.$executeRawUnsafe(
            `UPDATE "User"
             SET name = COALESCE($1, name),
                 image = COALESCE($2, image),
                 "emailVerified" = COALESCE($3, "emailVerified"),
                 "updatedAt" = NOW()
             WHERE id = $4`,
            supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
            supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || null,
            supabaseUser.email_confirmed_at ? new Date(supabaseUser.email_confirmed_at) : null,
            prismaUser.id
          );

          // Upsert Account record
          await prisma.$executeRawUnsafe(
            `INSERT INTO "Account" (id, "userId", type, provider, "providerAccountId", access_token, refresh_token, expires_at, token_type, scope)
             VALUES (gen_random_uuid()::text, $1, 'oauth', $2, $3, $4, $5, $6, 'bearer', $7)
             ON CONFLICT ("provider", "providerAccountId") 
             DO UPDATE SET
               access_token = EXCLUDED.access_token,
               refresh_token = EXCLUDED.refresh_token,
               expires_at = EXCLUDED.expires_at`,
            prismaUser.id,
            supabaseUser.app_metadata?.provider || 'google',
            supabaseUser.id,
            session.access_token,
            session.refresh_token,
            session.expires_at ? Math.floor(session.expires_at) : null,
            supabaseUser.app_metadata?.provider === 'google' ? 'openid email profile' : null
          );

          console.log("✅ Updated existing user in database:", supabaseUser.email);
        }
      } catch (dbError) {
        console.error("❌ Database error:", dbError);
        // Continue to redirect even if DB sync fails
      }
    }
  }

  // Redirect to the page they were on, or home
  const origin = requestUrl.origin;
  const returnTo = requestUrl.searchParams.get("returnTo") || "/";
  return NextResponse.redirect(new URL(returnTo, origin));
}
