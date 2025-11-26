import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/core/db/supabase-client.admin";

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

type FacilityStatus = "operational" | "maintenance" | "out_of_service" | "retired";

interface FacilityRow {
  id: string;
  name: string;
  type: string;
  location_identifier: string;
  image_url: string | null;
  capacity: number | null;
  status: FacilityStatus;
  created_by: string | null;
  created_at: string;
}

interface FacilityDto {
  id: string;
  name: string;
  type: string;
  location: string;
  imageUrl: string | null;
  capacity: number | null;
  status: FacilityStatus;
  createdAt: string;
}

function mapFacilityRow(row: FacilityRow): FacilityDto {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    location: row.location_identifier,
    imageUrl: row.image_url,
    capacity: row.capacity,
    status: row.status,
    createdAt: row.created_at,
  };
}

interface CreateFacilityBody {
  name?: string;
  type?: string;
  location?: string;
  imageUrl?: string;
  capacity?: number | null;
  status?: FacilityStatus;
}

function validateCreateFacilityBody(body: unknown): { value?: Required<Pick<CreateFacilityBody, "name" | "type" | "location">> & CreateFacilityBody; errors?: { field: string; message: string }[] } {
  const errors: { field: string; message: string }[] = [];
  const data = (body ?? {}) as Record<string, unknown>;

  const rawName = typeof data.name === "string" ? data.name.trim() : "";
  const rawType = typeof data.type === "string" ? data.type.trim() : "";
  const rawLocation = typeof data.location === "string" ? data.location.trim() : "";
  const rawImageUrl = typeof data.imageUrl === "string" ? data.imageUrl.trim() : "";

  if (!rawName) {
    errors.push({ field: "name", message: "Facility name is required." });
  }
  if (!rawType) {
    errors.push({ field: "type", message: "Facility type is required." });
  }
  if (!rawLocation) {
    errors.push({ field: "location", message: "Location / Identifier is required." });
  }

  let capacity: number | null = null;
  if (data.capacity != null) {
    const numeric = typeof data.capacity === "number" ? data.capacity : Number(data.capacity as unknown as string);
    if (Number.isNaN(numeric) || numeric < 0) {
      errors.push({ field: "capacity", message: "Capacity must be a non-negative number." });
    } else {
      capacity = numeric;
    }
  }

  let status: FacilityStatus = "operational";
  if (typeof data.status === "string") {
    if (["operational", "maintenance", "out_of_service", "retired"].includes(data.status)) {
      status = data.status as FacilityStatus;
    } else {
      errors.push({ field: "status", message: "Invalid facility status." });
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    value: {
      name: rawName,
      type: rawType,
      location: rawLocation,
      imageUrl: rawImageUrl || "",
      capacity,
      status,
    },
  };
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

  const { data, error } = await supabase
    .from("facilities")
    .select("id, name, type, location_identifier, image_url, capacity, status, created_by, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return formatError(500, "FACILITY_LIST_FAILED", "Unable to load facilities.", error.message ?? error);
  }

  const facilities = (data ?? []).map(mapFacilityRow);
  return formatSuccess({ facilities });
}

export async function POST(request: NextRequest) {
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

  // Verify the user exists in app_users (should already exist from login)
  const { data: appUserRow, error: appUserError } = await supabase
    .from("app_users")
    .select("id")
    .eq("id", userId)
    .single<{ id: string }>();

  if (appUserError || !appUserRow) {
    console.error("[/api/facilities] User not found in app_users", {
      userId,
      appUserError,
    });
    return formatError(
      403,
      "USER_NOT_FOUND",
      "Your account is not configured for this system.",
      appUserError?.message ?? appUserError
    );
  }

  const body = await request.json().catch(() => null);
  const { value, errors } = validateCreateFacilityBody(body);

  if (!value || errors) {
    return formatError(400, "VALIDATION_ERROR", "Invalid facility data.", errors);
  }

  const insertPayload = {
    name: value.name,
    type: value.type,
    location_identifier: value.location,
    image_url: value.imageUrl || null,
    capacity: value.capacity,
    status: value.status,
    created_by: appUserRow.id,
  };

  const { data, error } = await supabase
    .from("facilities")
    .insert(insertPayload)
    .select("id, name, type, location_identifier, image_url, capacity, status, created_by, created_at")
    .single<FacilityRow>();

  if (error || !data) {
    console.error("[/api/facilities] Failed to insert facility", {
      error,
    });
    return formatError(500, "FACILITY_CREATE_FAILED", "Unable to create facility.", error?.message ?? error);
  }

  const facility = mapFacilityRow(data);
  return formatSuccess({ facility }, 201);
}
