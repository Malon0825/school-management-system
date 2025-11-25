"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ShieldAlert, X, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import { useAuth } from "@/shared/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EVENTS_DATA = {
  overview: [
    {
      label: "Today's Events",
      value: "3",
      description: "Events scheduled today",
    },
    {
      label: "Live Check-ins",
      value: "450 / 500",
      description: "Across all live events",
    },
    {
      label: "Late Arrivals",
      value: "57",
      description: "Marked \"Late\" today",
    },
    {
      label: "Sync Status",
      value: "Sync pending: 12",
      description: "Waiting to upload to Supabase",
    },
  ],
  todaysEvents: [
    {
      id: 1,
      name: "Morning Assembly",
      time: "07:00 - 08:00 AM",
      venue: "Main Grounds",
      audience: "Grades 7-10",
      status: "Live" as const,
      attendees: "450 / 500",
    },
    {
      id: 2,
      name: "Grade 10 Science Fair",
      time: "09:00 - 11:00 AM",
      venue: "Science Wing",
      audience: "Grade 10",
      status: "Scheduled" as const,
      attendees: "120 / 150",
    },
    {
      id: 3,
      name: "Staff Meeting",
      time: "02:00 - 03:00 PM",
      venue: "AV Room",
      audience: "Faculty",
      status: "Completed" as const,
      attendees: "45 / 50",
    },
  ],
};

export default function EventsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [venueFilter, setVenueFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createEventRange, setCreateEventRange] = useState<DateRange | undefined>(undefined);
  const [openTime, setOpenTime] = useState("");
  const [lateThresholdTime, setLateThresholdTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const venueOptions = Array.from(new Set(EVENTS_DATA.todaysEvents.map((event) => event.venue)));

  // Show loading state while validating session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4D3E] mx-auto"></div>
          <p className="text-sm text-gray-500">Loading events...</p>
        </div>
      </div>
    );
  }

  // RBAC Guard - check if user has admin, super_admin, or staff role
  const hasAccess = user?.roles.some(role => 
    role === "ADMIN" || role === "SUPER_ADMIN" || role === "STAFF"
  );

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 p-8 bg-white rounded-xl shadow-lg border border-red-100 max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500">
            You do not have permission to view the Events module. Please contact your system administrator.
          </p>
          <Button onClick={() => router.push("/dashboard")} variant="outline" className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col space-y-6 min-h-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
              <p className="text-sm text-gray-500">
                Offline-capable, QR-based attendance for school events, assemblies, and gate entries.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[#1B4D3E] text-white hover:bg-[#163e32] text-sm px-4 py-2 rounded-lg shadow-sm"
            >
              + Create Event
            </Button>
          </div>
        </div>

        <Card className="flex-1 flex flex-col w-full border-gray-200 shadow-sm ">
          <CardHeader className="border-b border-gray-50 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">List of Events</CardTitle>
                <CardDescription>Events scheduled for today with live status.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden lg:inline-flex items-center">
                  <Select value={venueFilter} onValueChange={setVenueFilter}>
                    <SelectTrigger className="min-w-[160px] pl-3 pr-9 py-1.5 text-sm border border-gray-200 rounded-full bg-white text-gray-700 shadow-sm">
                      <SelectValue placeholder="All venues" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All venues</SelectItem>
                      {venueOptions.map((venue) => (
                        <SelectItem key={venue} value={venue}>
                          {venue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events..."
                  className="w-40 lg:w-56 px-3 py-1.5 text-sm border border-gray-200 rounded-full bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] placeholder:text-gray-400"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto px-6 pb-6 hide-scrollbar">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-bold text-[#1B4D3E]">Event Name</TableHead>
                    <TableHead className="font-bold text-[#1B4D3E]">Time</TableHead>
                    <TableHead className="font-bold text-[#1B4D3E]">Venue</TableHead>
                    <TableHead className="font-bold text-[#1B4D3E]">Audience</TableHead>
                    <TableHead className="text-right font-bold text-[#1B4D3E]">Attendees</TableHead>
                    <TableHead className="text-right font-bold text-[#1B4D3E]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody
                  key={`${venueFilter}-${searchTerm}`}
                  className="table-filter-animate"
                >
                  {EVENTS_DATA.todaysEvents
                    .filter((event) => venueFilter === "all" || event.venue === venueFilter)
                    .filter((event) => {
                      if (!searchTerm.trim()) return true;
                      const query = searchTerm.toLowerCase();
                      return (
                        event.name.toLowerCase().includes(query) ||
                        event.venue.toLowerCase().includes(query) ||
                        event.audience.toLowerCase().includes(query) ||
                        event.status.toLowerCase().includes(query)
                      );
                    })
                    .map((event) => (
                    <TableRow
                      key={event.id}
                      className="cursor-pointer transition-all duration-150 hover:bg-white hover:shadow-sm hover:-translate-y-0.5 hover:border-gray-100"
                    >
                      <TableCell className="font-medium text-gray-900">{event.name}</TableCell>
                      <TableCell className="text-gray-500">{event.time}</TableCell>
                      <TableCell className="text-gray-500">{event.venue}</TableCell>
                      <TableCell className="text-gray-500">{event.audience}</TableCell>
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
      </div>

      {isCreateDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm dialog-backdrop-animate">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 dialog-panel-animate">
            <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Create Event</h2>
                <p className="text-sm text-gray-500">
                  Configure the event details, target audience, and session timing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close create event dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              className="px-6 pb-5 pt-4 space-y-6 max-h-[70vh] overflow-y-auto hide-scrollbar"
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: Wire this form to Supabase-backed create-event endpoint
                setIsCreateDialogOpen(false);
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Event Title</label>
                  <input
                    name="title"
                    type="text"
                    required
                    placeholder="e.g. Foundation Day"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        data-empty={!createEventRange?.from}
                        className={cn(
                          "w-full justify-start text-left font-normal px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 shadow-sm",
                          !createEventRange?.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {createEventRange?.from ? (
                          createEventRange.to ? (
                            <span>
                              {format(createEventRange.from, "MMM d, yyyy")}
                              {" – "}
                              {format(createEventRange.to, "MMM d, yyyy")}
                            </span>
                          ) : (
                            <span>{format(createEventRange.from, "MMM d, yyyy")}</span>
                          )
                        ) : (
                          <span>Pick date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={createEventRange}
                        onSelect={setCreateEventRange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <input
                    type="hidden"
                    name="startDate"
                    value={createEventRange?.from ? createEventRange.from.toISOString().slice(0, 10) : ""}
                  />
                  <input
                    type="hidden"
                    name="endDate"
                    value={createEventRange?.to
                      ? createEventRange.to.toISOString().slice(0, 10)
                      : createEventRange?.from
                      ? createEventRange.from.toISOString().slice(0, 10)
                      : ""}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Venue</label>
                  <input
                    name="venue"
                    type="text"
                    required
                    placeholder="e.g. Main Grounds"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-800">Audience Filter</p>
                  <p className="text-xs text-gray-500 mb-1">
                    Who is this event for? Select the target grade levels.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      "Grade 7",
                      "Grade 8",
                      "Grade 9",
                      "Grade 10",
                      "Grade 11",
                      "Grade 12",
                    ].map((grade) => (
                      <label
                        key={grade}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-gray-700 cursor-pointer hover:bg-white hover:border-[#1B4D3E]/30"
                      >
                        <input
                          type="checkbox"
                          name="audience"
                          value={grade}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-[#1B4D3E] focus:ring-[#1B4D3E]/40"
                        />
                        <span className="text-xs font-medium">{grade}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-800">Session Configuration</p>
                  <p className="text-xs text-gray-500 mb-1">
                    Define the time window and late threshold for this session.
                  </p>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-700">Session Name</label>
                      <input
                        name="sessionName"
                        type="text"
                        placeholder="e.g. Morning Entry"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E] placeholder:text-gray-400"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-700">Opens</label>
                        <TimePicker
                          value={openTime}
                          onChange={setOpenTime}
                          placeholder="--:--"
                          minuteStep={5}
                        />
                        <input type="hidden" name="openTime" value={openTime} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-700">Late After</label>
                        <TimePicker
                          value={lateThresholdTime}
                          onChange={setLateThresholdTime}
                          placeholder="--:--"
                          minuteStep={5}
                        />
                        <input type="hidden" name="lateThreshold" value={lateThresholdTime} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-700">Closes</label>
                        <TimePicker
                          value={closeTime}
                          onChange={setCloseTime}
                          placeholder="--:--"
                          minuteStep={5}
                        />
                        <input type="hidden" name="closeTime" value={closeTime} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  className="text-sm px-4"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#1B4D3E] text-white hover:bg-[#163e32] text-sm px-4 py-2 rounded-lg shadow-sm"
                >
                  Save Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
