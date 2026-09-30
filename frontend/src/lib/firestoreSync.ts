import { doc, setDoc } from "firebase/firestore";
import { firestore } from "./firebase";
import type { Alert, AuditLog, Device, Incident, ResponseAction, Scan, ThreatIntelIOC } from "./types";

/**
 * Cloud Firestore Synchronization Engine
 * Persists data from every Pragyan screen into real-time Cloud Firestore collections.
 */

export async function syncDeviceToFirestore(device: Device) {
  try {
    const docRef = doc(firestore, "devices", String(device.id));
    await setDoc(docRef, { ...device, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("Firestore sync skipped for device:", err);
  }
}

export async function syncScanToFirestore(scan: Scan) {
  try {
    const docRef = doc(firestore, "scans", String(scan.id));
    await setDoc(docRef, { ...scan, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("Firestore sync skipped for scan:", err);
  }
}

export async function syncAlertToFirestore(alert: Alert) {
  try {
    const docRef = doc(firestore, "alerts", String(alert.id));
    await setDoc(docRef, { ...alert, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("Firestore sync skipped for alert:", err);
  }
}

export async function syncIncidentToFirestore(incident: Incident) {
  try {
    const docRef = doc(firestore, "incidents", String(incident.id));
    await setDoc(docRef, { ...incident, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("Firestore sync skipped for incident:", err);
  }
}

export async function syncResponseActionToFirestore(action: ResponseAction) {
  try {
    const docRef = doc(firestore, "response_actions", String(action.id));
    await setDoc(docRef, { ...action, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("Firestore sync skipped for response action:", err);
  }
}

export async function syncThreatIntelToFirestore(ioc: ThreatIntelIOC) {
  try {
    const docRef = doc(firestore, "threat_intel", String(ioc.id));
    await setDoc(docRef, { ...ioc, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("Firestore sync skipped for threat intel IOC:", err);
  }
}

export async function syncAuditLogToFirestore(log: AuditLog) {
  try {
    const docRef = doc(firestore, "audit_logs", String(log.id));
    await setDoc(docRef, { ...log, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("Firestore sync skipped for audit log:", err);
  }
}
