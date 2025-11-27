"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Calendar as CalendarIcon, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ScannerEventItem {
  id: string;
  title: string;
  date: string;
  timeRange: string;
  venue: string;
  role: string;
  status: "live" | "upcoming" | "completed";
  expectedAttendees: number;
  checkedIn: number;
}

const MOCK_SCANNER_EVENTS: ScannerEventItem[] = [
  {
    id: "evt-1",
    title: "Morning Assembly",
    date: "Today",
    timeRange: "07:00 - 08:00 AM",
    venue: "Main Grounds",
    role: "Lead Scanner",
    status: "live",
    expectedAttendees: 500,
    checkedIn: 432,
  },
  {
    id: "evt-2",
    title: "Grade 10 Science Fair",
    date: "Today",
    timeRange: "09:00 - 11:00 AM",
    venue: "Science Wing",
    role: "Entrance Scanner",
    status: "upcoming",
    expectedAttendees: 150,
    checkedIn: 0,
  },
  {
    id: "evt-3",
    title: "Faculty Assembly",
    date: "Tomorrow",
    timeRange: "02:00 - 03:00 PM",
    venue: "AV Room",
    role: "Backup Scanner",
    status: "upcoming",
    expectedAttendees: 60,
    checkedIn: 0,
  },
];

export default function ScannerEventsPage() {
  const router = useRouter();

  const stats = useMemo(() => {
    const total = MOCK_SCANNER_EVENTS.length;
    const live = MOCK_SCANNER_EVENTS.filter((e) => e.status === "live").length;
    const upcoming = MOCK_SCANNER_EVENTS.filter((e) => e.status === "upcoming").length;
    const completed = MOCK_SCANNER_EVENTS.filter((e) => e.status === "completed").length;

    return { total, live, upcoming, completed };
  }, []);

  return (
    <div className="flex-1 flex flex-col space-y-6 min-h-0">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900">
              Scanner Events
            </h1>
            <p className="mt-1 text-sm text-gray-600 max-w-2xl">
              View events where you are registered as a scanner. This is a scanner-focused view
              so you can quickly see what you need to scan today and what&apos;s coming up next.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Input
            type="search"
            placeholder="Search events by title or venue..."
            className="h-9 w-full sm:w-64 bg-white"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-emerald-100 bg-emerald-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-emerald-800 uppercase tracking-wide">
              Today&apos;s scanner events
            </CardTitle>
            <CardDescription className="text-[11px] text-emerald-700">
              Events assigned to you today
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold text-emerald-900">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Live check-ins
            </CardTitle>
            <CardDescription className="text-[11px] text-gray-500">
              Across your live events
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold text-gray-900">432</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Upcoming assignments
            </CardTitle>
            <CardDescription className="text-[11px] text-gray-500">
              Later today and tomorrow
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold text-gray-900">{stats.upcoming}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Total scanner events
            </CardTitle>
            <CardDescription className="text-[11px] text-gray-500">
              Where you are assigned as scanner
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">
              Events you will scan
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              This is a UI-only view for now. Later, this table will be populated from SEMS event
              assignments where you are configured as a scanner.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
              {stats.live} live
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
              {stats.upcoming} upcoming
            </Badge>
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              {stats.completed} completed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 pt-0">
          <div className="mt-3 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="max-h-[480px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow className="border-gray-100">
                    <TableHead className="w-[40%] text-xs font-semibold text-gray-500">
                      Event
                    </TableHead>
                    <TableHead className="w-[20%] text-xs font-semibold text-gray-500">
                      Schedule
                    </TableHead>
                    <TableHead className="w-[20%] text-xs font-semibold text-gray-500">
                      Venue
                    </TableHead>
                    <TableHead className="w-[10%] text-xs font-semibold text-gray-500 text-center">
                      Role
                    </TableHead>
                    <TableHead className="w-[10%] text-xs font-semibold text-gray-500 text-right">
                      Attendance
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_SCANNER_EVENTS.map((event) => (
                    <TableRow
                      key={event.id}
                      onClick={() => router.push(`/sems/scan/${event.id}`)}
                      className="border-gray-100 hover:bg-emerald-50/40 cursor-pointer transition-colors"
                    >
                      <TableCell className="align-top py-3">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 h-7 w-7 inline-flex items-center justify-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <QrCode className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">
                              {event.title}
                            </p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {event.date}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.expectedAttendees.toLocaleString()} expected
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-3 text-sm text-gray-700">
                        {event.timeRange}
                      </TableCell>
                      <TableCell className="align-top py-3 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {event.venue}
                        </span>
                      </TableCell>
                      <TableCell className="align-top py-3 text-center">
                        <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                          {event.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top py-3 text-right text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">
                          {event.checkedIn.toLocaleString()}
                        </span>
                        <span className="ml-1 text-xs text-gray-500">
                          / {event.expectedAttendees.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
