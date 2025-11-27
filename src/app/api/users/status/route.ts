import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/core/db/supabase-client.admin";
import type { UserRole } from "@/core/auth/types";

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

type ActingUserRow = {
  id: string;
  roles: string[] | null;
  primary_role: string | null;
  is_active: boolean | null;
};

interface AppUserRow {
  id: string;
  email: string;
  full_name: string;
  roles: string[] | null;
  primary_role: string | null;
  is_active: boolean;
  created_at: string;
}

type UserListItemDto = {
  id: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  primaryRole: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

function normalizeRoles(roles: string[] | null | undefined): UserRole[] {
  if (!Array.isArray(roles)) return [];
  const upper = roles
    .map((role) => (typeof role === "string" ? role.toUpperCase() : ""))
    .filter(Boolean);

  const allowed: UserRole[] = [
    "SUPER_ADMIN",
    "ADMIN",
    "SCANNER",
    "TEACHER",
    "STAFF",
    "PARENT",
  ];

  return Array.from(new Set(upper)).filter((role): role is UserRole =>
    allowed.includes(role as UserRole)
  );
}

function mapRowToDto(row: AppUserRow): UserListItemDto {
  const roles = normalizeRoles(row.roles);
  const primaryRole = row.primary_role
    ? normalizeRoles([row.primary_role])[0] ?? roles[0] ?? "STAFF"
    : roles[0] ?? "STAFF";

  if (!roles.length) {
    roles.push(primaryRole);
  }

  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    roles,
    primaryRole,
    isActive: row.is_active,
    createdAt: row.created_at,
    lastLoginAt: null,
  };
}

async function requireAdminUser(request: NextRequest): Promise<
  | { actingUser: ActingUserRow; error?: never }
  | { actingUser?: never; error: NextResponse }
> {
  const accessToken = getAccessTokenFromRequest(request);

  if (!accessToken) {
    return {
      error: formatError(401, "UNAUTHENTICATED", "Not authenticated."),
    };
  }

  const supabase = getAdminSupabaseClient();

  const { data: userResult, error: tokenError } = await supabase.auth.getUser(accessToken);

  if (tokenError || !userResult?.user) {
    return {
      error: formatError(401, "INVALID_TOKEN", "Session is invalid or expired."),
    };
  }

  const userId = userResult.user.id;

  const { data: appUser, error: appUserError } = await supabase
    .from("app_users")
    .select("id, roles, primary_role, is_active")
    .eq("id", userId)
    .single<ActingUserRow>();

  if (appUserError || !appUser) {
    return {
      error: formatError(
        403,
        "USER_NOT_FOUND",
        "Your account is not configured for this system.",
        appUserError?.message ?? appUserError
      ),
    };
  }

  if (appUser.is_active === false) {
    return {
      error: formatError(403, "ACCOUNT_INACTIVE", "Your account is inactive."),
    };
  }

  const roles = normalizeRoles(appUser.roles);
  if (!roles.includes("SUPER_ADMIN") && !roles.includes("ADMIN")) {
    return {
      error: formatError(403, "FORBIDDEN", "You are not allowed to manage users."),
    };
  }

  return { actingUser: appUser };
}

interface ToggleStatusBody {
  userId?: string;
  isActive?: boolean;
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const authResult = await requireAdminUser(request);
  if (authResult.error) {
    return authResult.error;
  }

  const supabase = getAdminSupabaseClient();
  const body = (await request.json().catch(() => null)) as ToggleStatusBody | null;
  const userId = body?.userId?.trim();
  const isActive = body?.isActive;

  if (!userId || typeof isActive !== "boolean") {
    return formatError(400, "VALIDATION_ERROR", "userId and isActive are required.");
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return formatError(400, "INVALID_USER_ID", "User ID must be a valid UUID.");
  }

  if (userId === authResult.actingUser.id) {
    return formatError(400, "SELF_TOGGLE_NOT_ALLOWED", "You cannot change your own status.");
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from("app_users")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
      updated_by: authResult.actingUser.id,
    })
    .eq("id", userId)
    .select("id, email, full_name, roles, primary_role, is_active, created_at");

  if (updateError) {
    return formatError(
      500,
      "USER_STATUS_UPDATE_FAILED",
      "Unable to update user status.",
      updateError.message ?? updateError
    );
  }

  const updatedUser = (updatedRows as AppUserRow[] | null)?.[0];

  if (!updatedUser) {
    return formatError(
      404,
      "USER_NOT_FOUND",
      "User not found after update."
    );
  }

  return formatSuccess({ user: mapRowToDto(updatedUser) });
}
