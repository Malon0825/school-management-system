"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Zap,
  ZapOff,
  User,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock event data
const MOCK_EVENT = {
  id: "evt-1",
  title: "Morning Assembly",
  venue: "Main Grounds",
  timeRange: "07:00 - 08:00 AM",
};

// Mock scanned student data (simulates last scan result)
interface ScannedStudent {
  id: string;
  name: string;
  lrn: string;
  grade: string;
  section: string;
  avatarUrl: string | null;
  status: "success" | "late" | "already_scanned" | "not_allowed";
  message: string;
  scannedAt: string;
}

const MOCK_SCANNED_STUDENT: ScannedStudent = {
  id: "stu-1",
  name: "Juan Dela Cruz",
  lrn: "123456789012",
  grade: "Grade 10",
  section: "Section A",
  avatarUrl: null,
  status: "success",
  message: "Check-in recorded",
  scannedAt: "7:32 AM",
};

export default function EventScannerPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const [flashOn, setFlashOn] = useState(false);
  const [lastScan, setLastScan] = useState<ScannedStudent | null>(MOCK_SCANNED_STUDENT);

  // Status styling
  const getStatusStyles = (status: ScannedStudent["status"]) => {
    switch (status) {
      case "success":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          icon: CheckCircle2,
          iconColor: "text-emerald-600",
          badgeBg: "bg-emerald-100 text-emerald-800",
        };
      case "late":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          icon: Clock,
          iconColor: "text-amber-600",
          badgeBg: "bg-amber-100 text-amber-800",
        };
      case "already_scanned":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: AlertCircle,
          iconColor: "text-blue-600",
          badgeBg: "bg-blue-100 text-blue-800",
        };
      case "not_allowed":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: XCircle,
          iconColor: "text-red-600",
          badgeBg: "bg-red-100 text-red-800",
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#052019] via-[#020817] to-[#020817]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => router.push("/sems/scan")}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center px-4">
          <h1 className="text-sm font-semibold text-white truncate">
            {MOCK_EVENT.title}
          </h1>
          <p className="text-[11px] text-white/70">{MOCK_EVENT.venue}</p>
        </div>

        <button
          type="button"
          onClick={() => setFlashOn(!flashOn)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm transition-colors",
            flashOn
              ? "bg-amber-400 text-amber-900"
              : "bg-[#1B4D3E]/90 text-emerald-50 hover:bg-[#16352A]"
          )}
        >
          {flashOn ? <Zap className="w-3.5 h-3.5" /> : <ZapOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{flashOn ? "Flash on" : "Flash off"}</span>
        </button>
      </div>

      {/* Camera Viewfinder Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Simulated camera background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#031B14] via-[#020817] to-[#020817]" />

        {/* Scan frame */}
        <div className="relative z-10 w-64 h-64 sm:w-72 sm:h-72">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-2xl" />

          {/* Scanning line animation */}
          <div className="absolute inset-x-4 top-1/2 h-0.5 bg-emerald-400 animate-pulse opacity-90 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />

          {/* Center crosshair */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/40 rounded-lg" />
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-sm text-white/80 font-medium">
            Point camera at student&apos;s QR code
          </p>
          <p className="text-xs text-white/50 mt-1">
            Position QR code within the frame
          </p>
        </div>
      </div>

      {/* Bottom Student Info Card - floating panel */}
      <div className="pointer-events-none px-4 pb-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 max-w-md mx-auto w-full pointer-events-auto">
        {lastScan ? (
          <div className="p-4 sm:p-5">
            {/* Drag handle */}
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {(() => {
              const styles = getStatusStyles(lastScan.status);
              const StatusIcon = styles.icon;

              return (
                <div
                  className={cn(
                    "rounded-2xl border p-4 transition-all",
                    styles.bg,
                    styles.border
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Student Avatar */}
                    <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-white shadow-md">
                      <AvatarImage src={lastScan.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-[#1B4D3E] text-white text-lg font-semibold">
                        {lastScan.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                            {lastScan.name}
                          </h2>
                          <p className="text-xs text-gray-500 mt-0.5">
                            LRN: {lastScan.lrn}
                          </p>
                        </div>
                        <Badge className={cn("shrink-0 text-[10px] sm:text-xs", styles.badgeBg)}>
                          <StatusIcon className={cn("w-3 h-3 mr-1", styles.iconColor)} />
                          {lastScan.status === "success" && "Recorded"}
                          {lastScan.status === "late" && "Late"}
                          {lastScan.status === "already_scanned" && "Duplicate"}
                          {lastScan.status === "not_allowed" && "Denied"}
                        </Badge>
                      </div>

                      {/* Grade & Section */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                          <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                          {lastScan.grade}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {lastScan.section}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {lastScan.scannedAt}
                        </span>
                      </div>

                      {/* Status Message */}
                      <p className={cn("text-xs mt-2 font-medium", styles.iconColor)}>
                        {lastScan.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg sm:text-xl font-bold text-gray-900">127</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Scanned</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg sm:text-xl font-bold text-amber-600">12</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Late</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg sm:text-xl font-bold text-gray-900">373</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Remaining</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            {/* Drag handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 font-medium">
                Waiting for scan...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Student info will appear here after scanning
              </p>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg sm:text-xl font-bold text-gray-900">0</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Scanned</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg sm:text-xl font-bold text-amber-600">0</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Late</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg sm:text-xl font-bold text-gray-900">500</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Remaining</p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
