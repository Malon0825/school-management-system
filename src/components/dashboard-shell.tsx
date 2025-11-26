"use client";

import { useEffect, useState } from "react";
import {
  Users,
  School,
  ClipboardCheck,
  GraduationCap,
  Wallet,
  Briefcase,
  Bus,
  Library,
  MessageSquare,
  QrCode,
  TrendingUp,
  Menu,
  X,
  ChevronLeft,
  Bell,
  Building2,
  LogOut,
  User,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import appSettings from "@/appsettings.json";
import PageTransition from "@/components/page-transition";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/shared/hooks/useAuth";

type PhaseId = "phase1" | "phase2" | "phase3" | "phase4" | "phase5";

interface ModuleConfig {
  id: string;
  name: string;
  shortName: string;
  phase: PhaseId;
  icon: React.ElementType;
  href: string;
  status: "active" | "upcoming";
}

const MODULES: ModuleConfig[] = [
  { id: "dashboard", name: "Dashboard", shortName: "Dashboard", phase: "phase1", icon: TrendingUp, href: "/dashboard", status: "active" },
  { id: "sems", name: "Events", shortName: "Events", phase: "phase1", icon: QrCode, href: "/sems", status: "active" },
  { id: "sis", name: "Registry", shortName: "Registry", phase: "phase1", icon: Users, href: "/sis", status: "active" },
  { id: "facilities", name: "Facilities & Assets", shortName: "Facilities", phase: "phase4", icon: Building2, href: "/facilities", status: "active" },
  { id: "academic", name: "Academic Structure", shortName: "Academics", phase: "phase2", icon: School, href: "/dashboard/academic", status: "upcoming" },
  { id: "attendance", name: "Daily Attendance", shortName: "Attendance", phase: "phase2", icon: ClipboardCheck, href: "/dashboard/attendance", status: "upcoming" },
  { id: "exams", name: "Examination & Grading", shortName: "Exams", phase: "phase2", icon: GraduationCap, href: "/dashboard/exams", status: "upcoming" },
  { id: "finance", name: "Finance & Fees", shortName: "Finance", phase: "phase3", icon: Wallet, href: "/dashboard/finance", status: "upcoming" },
  { id: "hr", name: "HR & Payroll", shortName: "HR", phase: "phase3", icon: Briefcase, href: "/dashboard/hr", status: "upcoming" },
  { id: "transport", name: "Transport & Fleet", shortName: "Transport", phase: "phase4", icon: Bus, href: "/dashboard/transport", status: "upcoming" },
  { id: "library", name: "Library Management", shortName: "Library", phase: "phase4", icon: Library, href: "/dashboard/library", status: "upcoming" },
  { id: "portal", name: "Parent Portal", shortName: "Portal", phase: "phase5", icon: MessageSquare, href: "/dashboard/portal", status: "upcoming" },
];

type DashboardShellProps = {
  children: React.ReactNode;
  mobileTitle: string;
  mobileDescription: string;
};

export default function DashboardShell({ children, mobileTitle, mobileDescription }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#F9FAFB] via-[#FDFBF7] to-[#F3F4F6] flex font-sans text-gray-900">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-[#F4F6FB] border-r border-gray-200 transform transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } w-64 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div
          className={`h-16 flex items-center border-b border-gray-100  ${
            isCollapsed ? "px-2 lg:px-0 lg:justify-center" : "px-4"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              if (isCollapsed) {
                setIsCollapsed(false);
              }
            }}
            className={`flex items-center gap-3 focus:outline-none ${
              isCollapsed ? "cursor-pointer hover:opacity-90" : ""
            }`}
            aria-label={isCollapsed ? "Expand sidebar" : appSettings.appName}
          >
            <div className="relative w-8 h-8">
              <Image src="/basic-ed-logo.png" alt="Logo" fill className="object-contain" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-[#1B4D3E] text-lg tracking-tight">{appSettings.appName}</span>
            )}
          </button>
          <div
            className={`ml-auto flex items-center gap-2 ${
              isCollapsed ? "lg:hidden" : ""
            }`}
          >
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="hidden lg:inline-flex items-center justify-center h-7 px-3 rounded-full border border-gray-300 bg-white/80 text-gray-600 hover:text-[#1B4D3E] hover:bg-white shadow-sm transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-2 hide-scrollbar transition-all duration-300 ease-in-out ${
            isCollapsed ? "px-2" : "px-3"
          }`}
        >
          <div
            className={`px-3 text-xs font-bold text-gray-400 uppercase tracking-wider transition-all duration-300 origin-left ${
              isCollapsed
                ? "mt-0 h-0 py-0 opacity-0 -translate-x-2 overflow-hidden"
                : "h-6 py-2 opacity-100 translate-x-0"
            }`}
          >
            Modules
          </div>
          {MODULES.map((module) => {
            const isActive = pathname === module.href;

            return (
              <button
                key={module.id}
                onClick={() => {
                  if (module.status === "active") {
                    router.push(module.href);
                  }
                }}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isCollapsed ? "justify-center gap-0" : "gap-3"
                } ${
                  module.status === "active"
                    ? `group border ${
                        isActive
                          ? "bg-white text-[#1B4D3E] shadow-sm border-[#1B4D3E]/10"
                          : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-[#1B4D3E]"
                      }`
                    : "text-gray-400 cursor-not-allowed opacity-60"
                }`}
              >
                <module.icon
                  className={`w-4 h-4 transition-colors ${
                    module.status === "active"
                      ? isActive
                        ? "text-[#1B4D3E]"
                        : "text-gray-400 group-hover:text-[#1B4D3E]"
                      : ""
                  }`}
                />
                <span
                  className={`overflow-hidden text-left whitespace-nowrap transition-all duration-300 origin-left ml-0 ${
                    isCollapsed
                      ? "max-w-0 opacity-0 translate-x-2"
                      : "max-w-[80px] opacity-100 translate-x-0 ml-2"
                  }`}
                >
                  {module.shortName}
                </span>
                {module.status === "upcoming" && !isCollapsed && (
                  <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md font-semibold border border-gray-200">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-3 pb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`w-full rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center transition-all duration-300 ease-in-out hover:border-[#1B4D3E]/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 ${
                  isCollapsed ? "justify-center px-2 py-2" : "px-3 py-3 gap-3"
                }`}
              >
                <Avatar className="h-9 w-9 border border-gray-200">
                  <AvatarImage
                    src={user && "avatarUrl" in user ? (user as any).avatarUrl ?? undefined : undefined}
                    alt={user?.fullName ?? "User"}
                  />
                  <AvatarFallback className="bg-[#1B4D3E] text-white text-sm font-semibold">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {user?.fullName ?? "User"}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {user?.email ?? "signed in"}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              className="w-56 rounded-xl border border-gray-200 bg-white shadow-lg"
              sideOffset={8}
            >
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.fullName ?? "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email ?? "signed in"}
                </p>
              </div>
              <div className="p-1">
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-gray-700 hover:bg-[#1B4D3E]/5 hover:text-[#1B4D3E] focus:bg-[#1B4D3E]/5 focus:text-[#1B4D3E]"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/users")}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-gray-700 hover:bg-[#1B4D3E]/5 hover:text-[#1B4D3E] focus:bg-[#1B4D3E]/5 focus:text-[#1B4D3E]"
                >
                  <UsersRound className="w-4 h-4" />
                  <span className="text-sm font-medium">Manage Users</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-gray-100" />
              <div className="p-1">
                <DropdownMenuItem
                  onClick={() => void logout()}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {!isCollapsed && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="w-full text-[11px] leading-snug text-gray-400 text-center">
              <p className="font-medium text-gray-500">
                @ 2025 {appSettings.appName} v{appSettings.version}
              </p>
              <p className="mt-0.5">
                Initiated by <span className="font-semibold text-[#1B4D3E]">SSC</span>
              </p>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col h-screen min-w-0 bg-transparent">
        <PageTransition>
          <main className="flex-1 py-4 lg:py-8 px-3 lg:px-4 overflow-y-auto flex flex-col space-y-6 min-h-0">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <div>
                <h1 className="text-lg font-bold text-gray-900">{mobileTitle}</h1>
                <p className="text-xs text-gray-500">{mobileDescription}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 border border-gray-200 text-gray-600 shadow-sm hover:bg-white"
                  aria-label="Open navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/70 border border-gray-200 text-gray-500 hover:text-gray-700"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </div>
            {children}
          </main>
        </PageTransition>
      </div>

      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
