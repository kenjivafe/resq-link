"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { io, type Socket } from "socket.io-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const STATUS_OPTIONS = [
  "pending",
  "assigned",
  "responding",
  "resolved",
  "escalated",
] as const;
const TIME_RANGE_OPTIONS = [
  { label: "Last hour", value: "1h", minutes: 60 },
  { label: "Last 6 hours", value: "6h", minutes: 360 },
  { label: "Last 24 hours", value: "24h", minutes: 1_440 },
  { label: "All time", value: "all", minutes: undefined },
] as const;

const PRIORITY_OPTIONS = [
  { label: "Normal", value: "normal" },
  { label: "Urgent", value: "urgent" },
] as const;

type IncidentStatus = (typeof STATUS_OPTIONS)[number];
type AssignmentPriority = (typeof PRIORITY_OPTIONS)[number]["value"];

interface IncidentRecord {
  id: string;
  type: string;
  status: IncidentStatus;
  severity: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  reportedAt: string;
  updatedAt: string;
}

interface ListIncidentsResponse {
  incidents: IncidentRecord[];
}

interface FiltersState {
  status?: IncidentStatus;
  timeRange: (typeof TIME_RANGE_OPTIONS)[number];
  bbox: string;
}

export default function DispatcherIncidentsDashboard() {
  const [filters, setFilters] = useState<FiltersState>({
    timeRange: TIME_RANGE_OPTIONS[1],
    bbox: "",
  });
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responderId, setResponderId] = useState("");
  const [assignmentPriority, setAssignmentPriority] =
    useState<AssignmentPriority>("normal");
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const [assignmentFeedback, setAssignmentFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const selectedIncident = useMemo(
    () => incidents.find((item) => item.id === selectedIncidentId) ?? null,
    [incidents, selectedIncidentId],
  );

  const fetchIncidents = useCallback(
    async (abortSignal: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (filters.status) {
          params.set("status", filters.status);
        }

        if (filters.timeRange.minutes !== undefined) {
          const sinceDate = new Date(
            Date.now() - filters.timeRange.minutes * 60_000,
          );
          params.set("since", sinceDate.toISOString());
        }

        if (filters.bbox.trim().length > 0) {
          params.set("bbox", filters.bbox.trim());
        }

        const response = await fetch(
          `${API_BASE_URL}/api/incidents?${params.toString()}`,
          {
            headers: {
              Authorization: "Bearer dispatcher-demo",
            },
            signal: abortSignal,
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to load incidents (${response.status})`);
        }

        const data = (await response.json()) as ListIncidentsResponse;
        setIncidents(data.incidents);

        if (!selectedIncidentId && data.incidents.length > 0) {
          setSelectedIncidentId(data.incidents[0].id);
        }
      } catch (requestError) {
        if (!abortSignal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unexpected error",
          );
          setIncidents([]);
        }
      } finally {
        if (!abortSignal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [filters, selectedIncidentId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchIncidents(controller.signal);

    return () => controller.abort();
  }, [fetchIncidents]);

  useEffect(() => {
    const socket: Socket = io(`${API_BASE_URL}/incidents`, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("incident.created", () => {
      void (async () => {
        const controller = new AbortController();
        try {
          await fetchIncidents(controller.signal);
        } finally {
          controller.abort();
        }
      })();
    });

    return () => {
      socket.off("incident.created");
      socket.disconnect();
    };
  }, [fetchIncidents]);

  useEffect(() => {
    setResponderId("");
    setAssignmentPriority("normal");
    setAssignmentMessage("");
    setAssignmentFeedback(null);
  }, [selectedIncidentId]);

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const statusValue = event.currentTarget.value as IncidentStatus | "all";
    setFilters((previous) => ({
      ...previous,
      status: statusValue === "all" ? undefined : statusValue,
    }));
  };

  const handleTimeRangeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.currentTarget
      .value as (typeof TIME_RANGE_OPTIONS)[number]["value"];
    const nextRange =
      TIME_RANGE_OPTIONS.find((option) => option.value === value) ??
      TIME_RANGE_OPTIONS[3];
    setFilters((previous) => ({
      ...previous,
      timeRange: nextRange,
    }));
  };

  const handleBboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setFilters((previous) => ({
      ...previous,
      bbox: value,
    }));
  };

  const handleAssignSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitAssignment();
  };

  const submitAssignment = async () => {
    if (!selectedIncidentId) {
      return;
    }

    if (responderId.trim().length === 0) {
      setAssignmentFeedback({
        type: "error",
        message: "Responder ID is required.",
      });
      return;
    }

    setIsAssigning(true);
    setAssignmentFeedback(null);

    const requestBody: Record<string, unknown> = {
      responderId: responderId.trim(),
      priority: assignmentPriority,
    };

    if (assignmentMessage.trim().length > 0) {
      requestBody.message = assignmentMessage.trim();
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/incidents/${selectedIncidentId}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer dispatcher-demo",
            "x-dispatcher-id": "dispatcher-demo",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const details = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        const message =
          typeof details?.message === "string"
            ? details.message
            : `Failed to assign responder (status ${response.status}).`;
        throw new Error(message);
      }

      setAssignmentFeedback({
        type: "success",
        message: "Incident assigned and responder notified.",
      });
      setResponderId("");
      setAssignmentMessage("");
      setAssignmentPriority("normal");
      setIncidents((previous) =>
        previous.map((incident) =>
          incident.id === selectedIncidentId
            ? {
                ...incident,
                status: "assigned",
                updatedAt: new Date().toISOString(),
              }
            : incident,
        ),
      );

      const controller = new AbortController();
      void fetchIncidents(controller.signal);
    } catch (submitError) {
      setAssignmentFeedback({
        type: "error",
        message:
          submitError instanceof Error
            ? submitError.message
            : "Unexpected error assigning responder.",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const summaryText = useMemo(() => {
    if (isLoading) {
      return "Loading incidents…";
    }

    if (error) {
      return error;
    }

    return `${incidents.length} incident${incidents.length === 1 ? "" : "s"} matched`;
  }, [error, incidents.length, isLoading]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--text)]">
      <header className="border-b border-[var(--border)] bg-[var(--card-bg)]/85 backdrop-blur">
        <div className="flex flex-col gap-4 px-6 py-6 mx-auto w-full max-w-6xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text)]">
              Dispatcher Dashboard
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Filter, triage, and review incoming incidents in real time.
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Live updates:{" "}
              <span
                className={
                  socketConnected ? "text-[#3c7a1d]" : "text-[#b91c1c]"
                }
              >
                {socketConnected ? "Connected" : "Disconnected"}
              </span>
            </p>
          </div>
        </div>
      </header>

      <main className="flex flex-col flex-1 gap-6 px-6 py-8 mx-auto w-full max-w-6xl lg:flex-row">
        <section className="p-5 w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] shadow-sm lg:w-80">
          <h2 className="text-lg font-semibold text-[var(--text)]">Filters</h2>
          <div className="mt-4 space-y-6">
            <div>
              <label className="text-xs tracking-wide uppercase text-[var(--text-secondary)]">
                Status
              </label>
              <select
                className="px-3 py-2 mt-1 w-full text-sm rounded-md border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] shadow-sm focus:outline-none focus:border-[#9bb57a] focus:ring-2 focus:ring-[#b4ce93]"
                value={filters.status ?? "all"}
                onChange={handleStatusChange}
              >
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs tracking-wide uppercase text-[var(--text-secondary)]">
                Time Range
              </label>
              <select
                className="px-3 py-2 mt-1 w-full text-sm rounded-md border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] shadow-sm focus:outline-none focus:border-[#9bb57a] focus:ring-2 focus:ring-[#b4ce93]"
                value={filters.timeRange.value}
                onChange={handleTimeRangeChange}
              >
                {TIME_RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs tracking-wide uppercase text-[var(--text-secondary)]">
                Bounding Box
              </label>
              <input
                type="text"
                placeholder="minLon,minLat,maxLon,maxLat"
                className="px-3 py-2 mt-1 w-full text-sm rounded-md border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] shadow-sm focus:outline-none focus:border-[#9bb57a] focus:ring-2 focus:ring-[#b4ce93]"
                value={filters.bbox}
                onChange={handleBboxChange}
              />
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Optional geographic filter. Example:{" "}
                <code>-122.42,37.77,-122.35,37.82</code>
              </p>
            </div>

            <button
              type="button"
              className="px-4 py-2 w-full text-sm font-semibold rounded-md transition text-[#1f2937] bg-[#b4ce93] hover:bg-[#a1c17d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b4ce93]"
              onClick={() => {
                const controller = new AbortController();
                void fetchIncidents(controller.signal);
              }}
              disabled={isLoading}
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] shadow-sm">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--text)]">
              Results
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {summaryText}
            </p>
          </div>

          <div className="grid gap-4 p-5 lg:grid-cols-[1.8fr_1.2fr]">
            <div className="overflow-y-auto pr-1 space-y-3" role="list">
              {isLoading ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  Fetching latest incidents…
                </p>
              ) : incidents.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  No incidents match the selected filters.
                </p>
              ) : (
                incidents.map((incident) => (
                  <button
                    key={incident.id}
                    type="button"
                    onClick={() => setSelectedIncidentId(incident.id)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition shadow-sm hover:border-[#9bb57a] hover:bg-[#f2f7ea] ${
                      selectedIncidentId === incident.id
                        ? "border-[#b4ce93] bg-[#eef5e2]"
                        : "border-[var(--border)] bg-[var(--card-bg)]"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-semibold text-[var(--text)]">
                        {incident.type}
                      </h3>
                      <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs uppercase tracking-wide text-[var(--text-secondary)] bg-white/60">
                        {incident.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Reported {new Date(incident.reportedAt).toLocaleString()}{" "}
                      • Updated {new Date(incident.updatedAt).toLocaleString()}
                    </p>
                    {incident.address ? (
                      <p className="mt-2 text-sm text-[var(--text)]">
                        {incident.address}
                      </p>
                    ) : null}
                  </button>
                ))
              )}
            </div>

            <aside className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] shadow-sm">
              {selectedIncident ? (
                <div className="flex flex-col gap-4">
                  <header className="flex gap-3 justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--text)]">
                        {selectedIncident.type}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Severity:{" "}
                        <span className="font-semibold text-[#3c7a1d]">
                          {selectedIncident.severity.toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs tracking-wide uppercase rounded-full border border-[var(--border)] text-[var(--text-secondary)] bg-white/70">
                      {selectedIncident.status}
                    </span>
                  </header>

                  <div className="space-y-4 text-sm text-[var(--text)]">
                    <div>
                      <h4 className="text-xs tracking-wide uppercase text-[var(--text-secondary)]">
                        Description
                      </h4>
                      <p className="mt-1 text-[var(--text)]">
                        {selectedIncident.description ??
                          "No description provided."}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs tracking-wide uppercase text-[var(--text-secondary)]">
                        Location
                      </h4>
                      <p className="mt-1 text-[var(--text)]">
                        {selectedIncident.address ?? "Not provided"}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Coordinates:{" "}
                        {selectedIncident.latitude !== null &&
                        selectedIncident.longitude !== null
                          ? `${selectedIncident.latitude.toFixed(4)}, ${selectedIncident.longitude.toFixed(4)}`
                          : "Unknown"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs tracking-wide uppercase text-[var(--text-secondary)]">
                        Timeline
                      </h4>
                      <ul className="mt-1 space-y-1 text-xs text-[var(--text-secondary)]">
                        <li>
                          Reported:{" "}
                          {new Date(
                            selectedIncident.reportedAt,
                          ).toLocaleString()}
                        </li>
                        <li>
                          Last update:{" "}
                          {new Date(
                            selectedIncident.updatedAt,
                          ).toLocaleString()}
                        </li>
                      </ul>
                    </div>
                  </div>

                  <form className="space-y-4" onSubmit={handleAssignSubmit}>
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-semibold text-[var(--text)]">
                        Assign responder
                      </h4>
                      <span className="text-xs text-[var(--text-secondary)]">
                        Dispatcher action
                      </span>
                    </div>

                    <div>
                      <label
                        className="text-xs tracking-wide uppercase text-[var(--text-secondary)]"
                        htmlFor="responderId"
                      >
                        Responder ID
                      </label>
                      <input
                        id="responderId"
                        type="text"
                        value={responderId}
                        onChange={(event) =>
                          setResponderId(event.currentTarget.value)
                        }
                        className="px-3 py-2 mt-1 w-full text-sm rounded-md border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] shadow-sm focus:outline-none focus:border-[#9bb57a] focus:ring-2 focus:ring-[#b4ce93]"
                        placeholder="UUID of responder"
                        required
                      />
                    </div>

                    <div>
                      <span className="text-xs tracking-wide uppercase text-[var(--text-secondary)]">
                        Priority
                      </span>
                      <div className="flex gap-3 mt-2 text-[var(--text)]">
                        {PRIORITY_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className="flex gap-2 items-center text-sm cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="assignment-priority"
                              value={option.value}
                              checked={assignmentPriority === option.value}
                              onChange={() =>
                                setAssignmentPriority(option.value)
                              }
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        className="text-xs tracking-wide uppercase text-[var(--text-secondary)]"
                        htmlFor="assignmentMessage"
                      >
                        Message (optional)
                      </label>
                      <textarea
                        id="assignmentMessage"
                        value={assignmentMessage}
                        onChange={(event) =>
                          setAssignmentMessage(event.currentTarget.value)
                        }
                        className="px-3 py-2 mt-1 w-full h-24 text-sm rounded-md border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] shadow-sm focus:outline-none focus:border-[#9bb57a] focus:ring-2 focus:ring-[#b4ce93]"
                        placeholder="Add instructions for the responder"
                      />
                    </div>

                    {assignmentFeedback ? (
                      <div
                        className={
                          assignmentFeedback.type === "success"
                            ? "rounded-md border border-[#9bb57a] bg-[#f0f7e6] px-3 py-2 text-sm text-[#3c7a1d]"
                            : "rounded-md border border-[#fca5a5] bg-[#fee2e2] px-3 py-2 text-sm text-[#b91c1c]"
                        }
                      >
                        {assignmentFeedback.message}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      className="px-4 py-2 w-full text-sm font-semibold rounded-md transition text-[#1f2937] bg-[#b4ce93] hover:bg-[#a1c17d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b4ce93] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isAssigning}
                    >
                      {isAssigning ? "Assigning…" : "Assign Responder"}
                    </button>
                  </form>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">
                  Select an incident to view its details.
                </p>
              )}
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
