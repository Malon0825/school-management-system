import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/core/db/supabase-client.admin";
import { EventService, EventRepository } from "@/modules/sems";

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

async function authenticateRequest(
  request: NextRequest
): Promise<
  | { userId: string; error?: never }
  | { userId?: never; error: ReturnType<typeof NextResponse.json> }
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
  return { userId };
}

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (authResult.error) {
    return authResult.error;
  }

  const { userId } = authResult;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "50", 10)));
  const facilityId = searchParams.get("facilityId") ?? undefined;
  const searchTerm = searchParams.get("search") ?? undefined;

  const supabase = getAdminSupabaseClient();
  const eventRepository = new EventRepository(supabase);
  const eventService = new EventService(eventRepository);

  try {
    const result = await eventService.listScannerEvents(userId, {
      page,
      pageSize,
      facilityId,
      searchTerm,
    });

    return formatSuccess(result);
  } catch (error) {
    console.error("[GET /api/sems/events/scanner] Unexpected error:", error);
    return formatError(
      500,
      "SCANNER_EVENT_LIST_FAILED",
      "Unable to load scanner events.",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
