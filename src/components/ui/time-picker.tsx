"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type TimePickerProps = {
  value?: string // expected format: "HH:mm"
  onChange?: (value: string) => void
  minuteStep?: number
  placeholder?: string
  className?: string
}

function parseTime(value?: string | null): { hour: string | null; minute: string | null } {
  if (!value) return { hour: null, minute: null }
  const [h, m] = value.split(":")
  if (!h || !m) return { hour: null, minute: null }
  return { hour: h.padStart(2, "0"), minute: m.padStart(2, "0") }
}

export function TimePicker({
  value,
  onChange,
  minuteStep = 5,
  placeholder = "Select time",
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const { hour: initialHour, minute: initialMinute } = React.useMemo(
    () => parseTime(value),
    [value],
  )

  const [selectedHour, setSelectedHour] = React.useState<string | null>(initialHour)
  const [selectedMinute, setSelectedMinute] = React.useState<string | null>(initialMinute)

  React.useEffect(() => {
    const { hour, minute } = parseTime(value)
    setSelectedHour(hour)
    setSelectedMinute(minute)
  }, [value])

  const hours = React.useMemo(
    () => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")),
    [],
  )

  const minutes = React.useMemo(
    () =>
      Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) =>
        (i * minuteStep).toString().padStart(2, "0"),
      ),
    [minuteStep],
  )

  const formatted = React.useMemo(() => {
    if (!selectedHour || !selectedMinute) return ""
    return `${selectedHour}:${selectedMinute}`
  }, [selectedHour, selectedMinute])

  function commitTime(nextHour: string | null, nextMinute: string | null) {
    if (!nextHour || !nextMinute) return
    const next = `${nextHour}:${nextMinute}`
    onChange?.(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 shadow-sm",
            !formatted && "text-muted-foreground",
            className,
          )}
        >
          <span>
            {formatted || placeholder}
          </span>
          <Clock className="ml-2 h-4 w-4 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="flex flex-col gap-3">
          <div className="text-xs font-medium text-gray-500">Select time</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="mb-1 text-[0.7rem] uppercase tracking-wide text-gray-400">Hour</div>
              <div className="max-h-40 overflow-y-auto rounded-md border border-gray-100 bg-gray-50/60">
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={cn(
                      "flex w-full items-center px-2.5 py-1.5 text-left hover:bg-white hover:text-gray-900 text-gray-700 text-xs",
                      selectedHour === h &&
                        "bg-[#1B4D3E]/10 text-[#1B4D3E] font-semibold border-l-2 border-[#1B4D3E]",
                    )}
                    onClick={() => setSelectedHour(h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 text-[0.7rem] uppercase tracking-wide text-gray-400">Minute</div>
              <div className="max-h-40 overflow-y-auto rounded-md border border-gray-100 bg-gray-50/60">
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={cn(
                      "flex w-full items-center px-2.5 py-1.5 text-left hover:bg-white hover:text-gray-900 text-gray-700 text-xs",
                      selectedMinute === m &&
                        "bg-[#1B4D3E]/10 text-[#1B4D3E] font-semibold border-l-2 border-[#1B4D3E]",
                    )}
                    onClick={() => {
                      const nextMinute = m
                      const nextHour = selectedHour ?? initialHour ?? "00"
                      setSelectedMinute(nextMinute)
                      commitTime(nextHour, nextMinute)
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
