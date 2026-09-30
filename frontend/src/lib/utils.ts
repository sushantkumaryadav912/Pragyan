import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatTimeAgo(iso: string | null | undefined): string {
  if (!iso) return "Never";
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSec < 10) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return iso;
  }
}

export function riskTone(score: number): "critical" | "high" | "medium" | "low" | "normal" {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  if (score >= 15) return "low";
  return "normal";
}

export function riskLabel(score: number): string {
  if (score >= 80) return "Critical Threat";
  if (score >= 60) return "High Risk";
  if (score >= 35) return "Elevated";
  if (score >= 15) return "Low Risk";
  return "Secure";
}

export function getVendorFromMac(mac: string | null | undefined): string {
  if (!mac) return "Unknown Vendor";
  const clean = mac.toUpperCase().replace(/[:-]/g, "");
  if (clean.startsWith("005056") || clean.startsWith("000C29") || clean.startsWith("000569")) return "VMware Inc.";
  if (clean.startsWith("080027")) return "Oracle VirtualBox";
  if (clean.startsWith("B827EB") || clean.startsWith("DCA632") || clean.startsWith("E45F01")) return "Raspberry Pi Trading";
  if (clean.startsWith("001A11") || clean.startsWith("3C52A1") || clean.startsWith("70695A")) return "Cisco Systems";
  if (clean.startsWith("001422") || clean.startsWith("D4BED9")) return "Dell Inc.";
  if (clean.startsWith("ACDE48") || clean.startsWith("3C0630")) return "Apple Inc.";
  return "Standard NIC Vendor";
}

export function exportToCSV(filename: string, rows: object[]) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((fieldName) => {
            const val = (row as Record<string, unknown>)[fieldName];
            const str = val === null || val === undefined ? "" : String(val);
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

