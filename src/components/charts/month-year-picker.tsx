"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

interface MonthYearPickerProps {
  currentMonth: number;
  currentYear: number;
}

export function MonthYearPicker({
  currentMonth,
  currentYear,
}: MonthYearPickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMonthChange = (month: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", month.toString());
    params.set("year", currentYear.toString());
    router.push(`/analytics?${params.toString()}`);
  };

  const handleYearChange = (year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", currentMonth.toString());
    params.set("year", year.toString());
    router.push(`/analytics?${params.toString()}`);
  };

  const currentYr = new Date().getFullYear();
  const years = [currentYr - 2, currentYr - 1, currentYr, currentYr + 1];

  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1.5 shadow-soft">
      <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
      <select
        value={currentMonth}
        onChange={(e) => handleMonthChange(Number(e.target.value))}
        className="bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer py-1 px-2 rounded-lg hover:bg-muted"
      >
        {MONTH_NAMES.map((name, index) => (
          <option key={index + 1} value={index + 1}>
            {name}
          </option>
        ))}
      </select>

      <select
        value={currentYear}
        onChange={(e) => handleYearChange(Number(e.target.value))}
        className="bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer py-1 px-2 rounded-lg hover:bg-muted"
      >
        {years.map((yr) => (
          <option key={yr} value={yr}>
            {yr}
          </option>
        ))}
      </select>
    </div>
  );
}
