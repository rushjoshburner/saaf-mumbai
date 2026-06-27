"use client";

import { useState } from "react";

const WARDS = [
  "A", "B", "C", "D", "E", "F/N", "F/S", "G/N", "G/S", "H/E", "H/W",
  "K/E", "K/W", "L", "M/E", "M/W", "N", "P/N", "P/S", "R/C", "R/N",
  "R/S", "S", "T",
];

type Tab = "garbage" | "monsoon";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("garbage");
  const [ward, setWard] = useState("all");
  const [showResolved, setShowResolved] = useState(false);

  return (
    <div className="flex flex-1 flex-col bg-concrete text-on-surface">
      <header className="border-b-2 border-on-surface bg-primary-container px-4 py-3">
        <h1 className="text-headline-lg uppercase text-on-primary">SAAF Mumbai</h1>
        <p className="text-label-mono uppercase text-on-primary-container">Civic Watch</p>
      </header>

      <nav className="flex border-b-2 border-on-surface bg-surface-container-lowest">
        {(["garbage", "monsoon"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            className={`flex-1 border-l-2 border-on-surface py-3 text-body-lg uppercase transition-colors duration-150 first:border-l-0 ${
              activeTab === tab
                ? "bg-primary-container text-on-primary"
                : "text-on-surface-variant"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-b-2 border-on-surface bg-surface-container-lowest px-4 py-2">
        <label htmlFor="ward-filter" className="text-label-mono uppercase text-on-surface-variant">
          Ward
        </label>
        <select
          id="ward-filter"
          value={ward}
          onChange={(event) => setWard(event.target.value)}
          className="rounded border border-outline bg-surface px-2 py-1 text-label-mono uppercase text-on-surface"
        >
          <option value="all">All wards</option>
          {WARDS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setShowResolved((value) => !value)}
          aria-pressed={showResolved}
          className={`ml-auto rounded-full border px-3 py-1 text-label-mono uppercase transition-colors duration-150 ${
            showResolved
              ? "border-tertiary-container bg-tertiary-container text-on-tertiary-container"
              : "border-outline text-on-surface-variant"
          }`}
        >
          Show resolved
        </button>
      </div>

      <main className="relative flex-1">
        <div className="flex h-full items-center justify-center bg-surface-container px-8 text-center">
          <p className="text-body-md text-on-surface-variant">
            Map of Mumbai &mdash; {activeTab === "garbage" ? "Garbage" : "Monsoon"} reports
            {ward !== "all" ? ` in Ward ${ward}` : ""}
            <br />
            (map view coming soon)
          </p>
        </div>

        <button
          type="button"
          className="fixed bottom-6 right-4 flex items-center gap-2 rounded border-2 border-on-surface bg-rani-pink px-5 py-3 text-body-lg uppercase text-on-primary shadow-[4px_4px_0_0_var(--color-on-surface)]"
        >
          <CameraIcon className="h-5 w-5" />
          Report an issue
        </button>
      </main>
    </div>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 8h2.5l1.5-2h8l1.5 2H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}
