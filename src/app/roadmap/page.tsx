type ModuleStatus = "available" | "planned";

type Module = {
  id: string;
  title: string;
  status: ModuleStatus;
  description: string;
  phaseLabel: string;
};

type Phase = {
  id: string;
  icon: string;
  title: string;
  objective: string;
  modules: Module[];
};

const statusConfig: Record<ModuleStatus, { label: string; classes: string }> = {
  available: {
    label: "Available",
    classes:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-200",
  },
  planned: {
    label: "Planned • Not yet implemented",
    classes:
      "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
  },
};

const phases: Phase[] = [
  {
    id: "phase-1",
    icon: "🚀",
    title: "Phase 1: The \"Seed\" & Identity",
    objective:
      "Establish the digital student database and deliver the Event Management System.",
    modules: [
      {
        id: "sems",
        title: "Student Event Management Module (SEMS)",
        status: "available",
        description:
          "Offline-capable, QR-based scanning system to track student attendance at school events, assemblies, and gate entries.",
        phaseLabel: "Phase 1",
      },
      {
        id: "sis",
        title: "Core Registry & Identity Module (SIS)",
        status: "available",
        description:
          "Central \"Single Source of Truth\" database for all users (staff and students).",
        phaseLabel: "Phase 1",
      },
    ],
  },
  {
    id: "phase-2",
    icon: "🏫",
    title: "Phase 2: Academic Operations",
    objective: "Manage the daily learning lifecycle.",
    modules: [
      {
        id: "academic-structure",
        title: "Academic Structure & Timetable",
        status: "planned",
        description:
          "Manages the logic of classes, sections, subjects, and conflict-free timetables.",
        phaseLabel: "Phase 2",
      },
      {
        id: "daily-attendance",
        title: "Daily Attendance (Classroom)",
        status: "planned",
        description:
          "Legal record of daily classroom attendance, distinct from event attendance.",
        phaseLabel: "Phase 2",
      },
      {
        id: "exams-grading",
        title: "Examination & Grading",
        status: "planned",
        description:
          "Automated performance tracking and report card generation.",
        phaseLabel: "Phase 2",
      },
    ],
  },
  {
    id: "phase-3",
    icon: "💰",
    title: "Phase 3: Business & Administration",
    objective: "Manage revenue and workforce.",
    modules: [
      {
        id: "finance-fees",
        title: "Finance & Fee Management",
        status: "planned",
        description:
          "Dynamic fee structures, invoicing, and fee defaulter handling.",
        phaseLabel: "Phase 3",
      },
      {
        id: "hr-payroll",
        title: "HR & Payroll",
        status: "planned",
        description:
          "Staff database and payroll engine for teaching and non-teaching staff.",
        phaseLabel: "Phase 3",
      },
    ],
  },
  {
    id: "phase-4",
    icon: "🚌",
    title: "Phase 4: Operations & Logistics",
    objective: "Manage physical assets and safety.",
    modules: [
      {
        id: "transport-fleet",
        title: "Transport & Fleet",
        status: "planned",
        description:
          "Management of buses, routes, and student safety (with optional GPS tracking).",
        phaseLabel: "Phase 4",
      },
      {
        id: "library",
        title: "Library Management (LMS)",
        status: "planned",
        description:
          "Tracking of physical books and digital resources, including circulation and fines.",
        phaseLabel: "Phase 4",
      },
    ],
  },
  {
    id: "phase-5",
    icon: "📱",
    title: "Phase 5: The Engagement Layer",
    objective: "Connect home and school.",
    modules: [
      {
        id: "communication-hub",
        title: "Communication Hub (Parent Portal)",
        status: "planned",
        description:
          "Unified app for parents to view data, communicate with teachers, and pay fees online.",
        phaseLabel: "Phase 5",
      },
    ],
  },
];

export default function Home() {
  const totalModules = phases.reduce((sum, phase) => sum + phase.modules.length, 0);
  const availableModules = phases.reduce(
    (sum, phase) => sum + phase.modules.filter((m) => m.status === "available").length,
    0,
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-4 py-10 sm:px-8 sm:py-16">
        <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Unified School Management System
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              USMS Modules Roadmap
            </h1>
            <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Overview of all planned phases and modules for the Unified School Management System.
              Phase 1 modules are available; all later phases are planned and not yet implemented.
            </p>
          </div>
          <aside className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Summary
            </p>
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs text-zinc-500">Modules available</p>
                <p className="text-lg font-semibold">
                  {availableModules} / {totalModules}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Phases</p>
                <p className="text-lg font-semibold">{phases.length}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Available
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                Planned / Not yet implemented
              </span>
            </div>
          </aside>
        </header>

        <section className="space-y-10">
          {phases.map((phase) => {
            const phaseAvailableCount = phase.modules.filter(
              (m) => m.status === "available",
            ).length;
            const phaseStatusLabel =
              phaseAvailableCount > 0 && phaseAvailableCount < phase.modules.length
                ? "In progress"
                : phaseAvailableCount === phase.modules.length
                  ? "Active"
                  : "Planned";

            return (
              <section
                key={phase.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8"
              >
                <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                      <span className="text-lg">{phase.icon}</span>
                      <span>{phase.id.replace("-", " ")}</span>
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                      {phase.title}
                    </h2>
                    <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                      {phase.objective}
                    </p>
                  </div>
                  <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                      Phase status
                    </p>
                    <p className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium dark:border-zinc-800 dark:bg-zinc-900">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                      {phaseStatusLabel}
                      <span className="text-zinc-400">
                        • {phaseAvailableCount} / {phase.modules.length} modules
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {phase.modules.map((module) => {
                    const status = statusConfig[module.status];

                    return (
                      <article
                        key={module.id}
                        className="flex flex-col justify-between rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/40"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-semibold leading-snug">
                                {module.title}
                              </h3>
                              <p className="mt-1 text-xs text-zinc-500">
                                {module.phaseLabel}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${status.classes}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current/70" />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {module.description}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </section>
      </main>
    </div>
  );
}
