"use client";

import { useState } from "react";
import { 
  Users,
  Wallet,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/shared/hooks/useAuth";

// Mock Data for Analytics
const ANALYTICS_DATA = {
  overview: [
    {
      label: "Total Students",
      value: "1,248",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      cardBg: "bg-gradient-to-br from-emerald-50 via-white to-white",
    },
    {
      label: "Event Attendance",
      value: "92%",
      change: "+4.5%",
      trend: "up",
      icon: Calendar,
      color: "text-sky-700",
      bg: "bg-sky-50",
      cardBg: "bg-gradient-to-br from-sky-50 via-white to-white",
    },
    {
      label: "System Alerts",
      value: "3",
      change: "Low",
      trend: "neutral",
      icon: AlertCircle,
      color: "text-amber-700",
      bg: "bg-amber-50",
      cardBg: "bg-gradient-to-br from-amber-50 via-white to-white",
    },
    {
      label: "Revenue (YTD)",
      value: "$425k",
      change: "+8%",
      trend: "up",
      icon: Wallet,
      color: "text-violet-700",
      bg: "bg-violet-50",
      cardBg: "bg-gradient-to-br from-violet-50 via-white to-white",
    },
  ],
  recentEvents: [
    { id: 1, name: "Morning Assembly", time: "07:30 AM", attendees: 450, status: "Completed", type: "Assembly" },
    { id: 2, name: "Grade 10 Science Fair", time: "09:00 AM", attendees: 120, status: "Live", type: "Academic" },
    { id: 3, name: "Staff Meeting", time: "02:00 PM", attendees: 45, status: "Scheduled", type: "Internal" },
    { id: 4, name: "Sports Practice", time: "04:00 PM", attendees: 85, status: "Scheduled", type: "Extracurricular" },
  ],
  recentLogins: [
    { user: "Admin User", role: "Super Admin", time: "2 mins ago", ip: "192.168.1.1" },
    { user: "Sarah Teacher", role: "Faculty", time: "15 mins ago", ip: "192.168.1.45" },
    { user: "Gate Guard", role: "Scanner", time: "1 hour ago", ip: "192.168.1.102" },
  ]
};
export default function AdminDashboardPage() {
  const { user, loading } = useAuth();

  // Show loading state while validating session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4D3E] mx-auto"></div>
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // RBAC Guard - check if user has admin or super_admin role
  const hasAccess = user?.roles.some(role => role === "ADMIN" || role === "SUPER_ADMIN");
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 p-8 bg-white rounded-xl shadow-lg border border-red-100 max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500">You do not have permission to view the Analytics Dashboard. Please contact your system administrator.</p>
          <Button onClick={() => window.history.back()} variant="outline" className="w-full">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 1. Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ANALYTICS_DATA.overview.map((item, idx) => (
          <Card
            key={idx}
            className={`border border-gray-100 border-t-4 border-t-[#F4B400] shadow-sm hover:shadow-md hover:border-gray-200 transform transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] ${item.cardBg}`}
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{item.value}</h3>
                <div className="flex items-center mt-1 gap-1">
                  {item.trend === "up" ? (
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      item.trend === "up" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {item.change}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. Recent Event Activity + 3. System Health / Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Event Activity Table */}
        <Card className="col-span-1 lg:col-span-2 border-gray-200 shadow-sm transform transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.01]">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Live Event Status</CardTitle>
                <CardDescription>Real-time tracking of school events and assemblies.</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-[#F4B400] text-[#1B4D3E] bg-[#FFF9D7]/60 hover:bg-[#FFF9D7]"
              >
                View All Reports
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto px-6 pb-6">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-bold text-[#1B4D3E]">Event Name</TableHead>
                    <TableHead className="font-bold text-[#1B4D3E]">Type</TableHead>
                    <TableHead className="font-bold text-[#1B4D3E]">Time</TableHead>
                    <TableHead className="text-right font-bold text-[#1B4D3E]">Attendees</TableHead>
                    <TableHead className="text-right font-bold text-[#1B4D3E]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ANALYTICS_DATA.recentEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-900">{event.name}</TableCell>
                      <TableCell className="text-gray-500">{event.type}</TableCell>
                      <TableCell className="text-gray-500">{event.time}</TableCell>
                      <TableCell className="text-right font-medium">{event.attendees}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.status === "Live"
                              ? "bg-emerald-100 text-emerald-800 animate-pulse"
                              : event.status === "Completed"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {event.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* System Health / Quick Actions */}
        <div className="space-y-6">
          {/* System Status */}
          <Card className="border-gray-200 shadow-sm transform transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-gray-900">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-gray-600">Database</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-gray-600">API Gateway</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-gray-600">Sync Service</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  Synced 2m ago
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Logins */}
          <Card className="border-gray-200 shadow-sm flex-1 transform transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-base font-bold text-gray-900">Recent Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ANALYTICS_DATA.recentLogins.map((login, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                    {login.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{login.user}</p>
                    <p className="text-xs text-gray-500">
                      {login.role} • {login.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
