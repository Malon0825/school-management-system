import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/core/db/supabase-client.admin";
import type { AuthUser, UserRole } from "@/core/auth/types";

function formatSuccess<T>(data: T) {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

function formatError(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

interface SisUserRow {
  id: string;
  email: string;
  full_name: string | null;
  roles: UserRole[] | null;
  primary_role: UserRole | null;
  is_active: boolean | null;
  school_id: string | null;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;

  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? "";

  if (!email || !password) {
    return formatError(400, "VALIDATION_ERROR", "Email and password are required.");
  }

  const supabase = getAdminSupabaseClient();

  let authResult;
  let authError;
  try {
    const authResponse = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    authResult = authResponse.data;
    authError = authResponse.error;
  } catch (err) {
    console.error("[/api/auth/login] Supabase signInWithPassword failed", err);
    return formatError(
      503,
      "AUTH_SERVICE_UNAVAILABLE",
      "Authentication service is temporarily unavailable. Please try again in a few minutes.",
      err instanceof Error
        ? { name: err.name, message: err.message }
        : err
    );
  }

  if (authError || !authResult?.session || !authResult.user) {
    return formatError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  const { data: sisUser, error: sisError } = await supabase
    .from("sis_users")
    .select("id, email, full_name, roles, primary_role, is_active, school_id")
    .eq("email", email)
    .single<SisUserRow>();

  if (sisError || !sisUser) {
    return formatError(403, "ACCOUNT_NOT_FOUND", "Your account is not configured for this system. Contact the Super Admin.");
  }

  if (!sisUser.is_active) {
    return formatError(403, "ACCOUNT_INACTIVE", "Your account is inactive. Contact the Super Admin.");
  }

  const roles = (Array.isArray(sisUser.roles) ? sisUser.roles : []).filter(Boolean) as UserRole[];
  if (!roles.length) {
    roles.push("STAFF");
  }

  const primaryRole: UserRole = sisUser.primary_role ?? roles[0];

  const user: AuthUser = {
    id: sisUser.id,
    email: sisUser.email,
    fullName: sisUser.full_name ?? sisUser.email,
    roles,
    primaryRole,
    schoolId: sisUser.school_id,
    isActive: Boolean(sisUser.is_active),
  };

  const accessToken = authResult.session.access_token;
  const refreshToken = authResult.session.refresh_token;

  const response = NextResponse.json(
    formatSuccess({
      user,
      session: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    })
  );

  const twelveHoursInSeconds = 60 * 60 * 12;
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set("auth-token", accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: twelveHoursInSeconds,
  });

  response.cookies.set("user-id", user.id, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: twelveHoursInSeconds,
  });

  response.cookies.set("user-roles", JSON.stringify(user.roles), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: twelveHoursInSeconds,
  });

  if (user.schoolId) {
    response.cookies.set("school-id", user.schoolId, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: twelveHoursInSeconds,
    });
  }

  return response;
}
