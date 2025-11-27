import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/core/db/supabase-client.admin";
import type { UserRole } from "@/core/auth/types";

interface ScannerUserDto {
  id: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  primaryRole: UserRole;
  isActive: boolean;
}

function formatSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
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

function getAccessTokenFromRequest(request: NextRequest): string | null {
  const authHeader =
    request.headers.get("authorization") ?? request.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    if (token) return token;
  }

  const cookieToken = request.cookies.get("auth-token")?.value;
  return cookieToken ?? null;
}

function normalizeRoles(roles: string[] | null | undefined): UserRole[] {
  if (!Array.isArray(roles)) return [];

  const upper = roles
    .map((r) => (typeof r === "string" ? r.toUpperCase() : ""))
    .filter(Boolean) as string[];

  const unique = Array.from(new Set(upper));

  const allowed: UserRole[] = [
    "SUPER_ADMIN",
    "ADMIN",
    "SCANNER",
    "TEACHER",
    "STAFF",
    "PARENT",
  ];

  return unique.filter((r): r is UserRole => allowed.includes(r as UserRole));
}

export async function GET(request: NextRequest) {
  const accessToken = getAccessTokenFromRequest(request);

  if (!accessToken) {
    return formatError(401, "UNAUTHENTICATED", "Not authenticated.");
  }

  const supabase = getAdminSupabaseClient();

  const { data: userResult, error: tokenError } = await supabase.auth.getUser(accessToken);

  if (tokenError || !userResult?.user) {
    return formatError(401, "INVALID_TOKEN", "Session is invalid or expired.");
  }

  const userId = userResult.user.id;

  const { data: appUser, error: appUserError } = await supabase
    .from("app_users")
    .select("id, roles, primary_role, is_active")
    .eq("id", userId)
    .single<{ id: string; roles: string[] | null; primary_role: string | null; is_active: boolean | null }>();

  if (appUserError || !appUser) {
    return formatError(
      403,
      "ACCOUNT_NOT_FOUND",
      "Your account is not configured for this system.",
      appUserError?.message ?? appUserError
    );
  }

  if (appUser.is_active === false) {
    return formatError(403, "ACCOUNT_INACTIVE", "Your account is inactive.");
  }

  const actingRoles = normalizeRoles(appUser.roles);

  if (!actingRoles.some((role) => ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(role))) {
    return formatError(403, "FORBIDDEN", "You are not allowed to view scanner assignments.");
  }

  const { data: rows, error: scannersError } = await supabase
    .from("app_users")
    .select("id, email, full_name, roles, primary_role, is_active")
    .order("full_name", { ascending: true });

  if (scannersError || !rows) {
    return formatError(
      500,
      "SCANNER_LIST_FAILED",
      "Unable to load scanner users.",
      scannersError?.message ?? scannersError
    );
  }

  const scanners: ScannerUserDto[] = [];

  for (const row of rows as Array<{
    id: string;
    email: string;
    full_name: string | null;
    roles: string[] | null;
    primary_role: string | null;
    is_active: boolean | null;
  }>) {
    const roles = normalizeRoles(row.roles);
    let primaryRole: UserRole =
      (row.primary_role && normalizeRoles([row.primary_role])[0]) || roles[0] || "STAFF";

    if (!roles.length) {
      roles.push(primaryRole);
    }

    if (!roles.some((r) => ["SCANNER", "ADMIN", "SUPER_ADMIN"].includes(r))) {
      continue;
    }

    if (row.is_active === false) {
      continue;
    }

    scanners.push({
      id: row.id,
      email: row.email,
      fullName: row.full_name ?? row.email,
      roles,
      primaryRole,
      isActive: Boolean(row.is_active ?? true),
    });
  }

  return formatSuccess({ scanners });
}
