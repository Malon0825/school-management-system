import type { UserRole } from "@/core/auth/types";

interface RouteAccessRule {
  pathPrefix: string;
  allowedRoles: UserRole[];
}

const ROUTE_ACCESS_RULES: RouteAccessRule[] = [
  { pathPrefix: "/sis", allowedRoles: ["SUPER_ADMIN", "ADMIN", "STAFF", "TEACHER"] },
  { pathPrefix: "/facilities", allowedRoles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
  { pathPrefix: "/sems", allowedRoles: ["SUPER_ADMIN", "ADMIN", "STAFF"] },
  { pathPrefix: "/dashboard/teacher", allowedRoles: ["TEACHER", "ADMIN", "SUPER_ADMIN"] },
  { pathPrefix: "/dashboard", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { pathPrefix: "/scanner", allowedRoles: ["SCANNER", "ADMIN", "SUPER_ADMIN"] },
  { pathPrefix: "/parent", allowedRoles: ["PARENT"] },
];

export function canAccessRoute(pathname: string, roles: UserRole[]): boolean {
  const rule = ROUTE_ACCESS_RULES.find((r) => pathname.startsWith(r.pathPrefix));

  if (!rule) {
    return roles.length > 0;
  }

  return roles.some((role) => rule.allowedRoles.includes(role));
}

export function getDefaultRouteForRoles(roles: UserRole[]): string | null {
  if (roles.includes("SUPER_ADMIN") || roles.includes("ADMIN")) {
    return "/dashboard";
  }

  if (roles.includes("TEACHER")) {
    return "/dashboard/teacher";
  }

  if (roles.includes("SCANNER")) {
    return "/scanner";
  }

  if (roles.includes("PARENT")) {
    return "/parent";
  }

  return "/";
}
