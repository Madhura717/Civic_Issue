import { randomUUID } from "node:crypto";

export type CivicStatus = "Submitted" | "Verified" | "Assigned" | "In Progress" | "Resolved" | "Citizen Confirmation" | "Closed" | "Escalated";
export type Priority = "Low" | "Medium" | "High" | "Critical";

type HistoryEvent = { status: CivicStatus; timestamp: string; department: string; action: string; note?: string };
type Comment = { id: string; body: string; author: string; createdAt: string };
export type ComplaintRecord = {
  id: string;
  title: string;
  category: string;
  description: string;
  severity: Priority;
  priority: Priority;
  department: string;
  location: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  status: CivicStatus;
  submittedAt: string;
  deadline: string;
  assignedOfficer?: string;
  media?: string;
  dangerous?: boolean;
  atRisk?: boolean;
  history: HistoryEvent[];
  comments: Comment[];
  escalations: { id: string; reason: string; from: string; to: string; createdAt: string; status: string }[];
};

const routing: Record<string, { department: string; sla: Record<Priority, number> }> = {
  "Roads & Potholes": { department: "Municipal Roads Department", sla: { Low: 120, Medium: 72, High: 48, Critical: 24 } },
  Streetlights: { department: "Public Lighting Department", sla: { Low: 120, Medium: 72, High: 48, Critical: 24 } },
  "Garbage & Sanitation": { department: "Sanitation Department", sla: { Low: 120, Medium: 72, High: 72, Critical: 24 } },
  "Water & Drainage": { department: "Water & Drainage Department", sla: { Low: 120, Medium: 72, High: 48, Critical: 24 } },
  "Traffic & Signals": { department: "Traffic & Transport Department", sla: { Low: 120, Medium: 72, High: 48, Critical: 24 } },
  "Public Infrastructure": { department: "Municipal Engineering Department", sla: { Low: 120, Medium: 72, High: 48, Critical: 24 } },
  Environment: { department: "Environment & Parks Department", sla: { Low: 120, Medium: 72, High: 48, Critical: 24 } },
  "Public Safety": { department: "Public Safety Coordination Office", sla: { Low: 72, Medium: 48, High: 24, Critical: 24 } },
  "Women's Safety": { department: "Public Safety Coordination Office", sla: { Low: 72, Medium: 48, High: 24, Critical: 24 } },
  Other: { department: "Civic Operations Department", sla: { Low: 120, Medium: 72, High: 48, Critical: 24 } },
};

const complaints = new Map<string, ComplaintRecord>();
const notifications: { id: string; text: string; createdAt: string; read: boolean }[] = [];
const safetyReports: { id: string; type: string; location: string; description: string; anonymous: boolean; status: string; createdAt: string }[] = [];
let sequence = 124;

function iso(hours = 0) { return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(); }
function toPriority(value: unknown): Priority { return value === "Low" || value === "High" || value === "Critical" ? value : "Medium"; }
function routeFor(category: string, severity: Priority) { const rule = routing[category] || routing.Other; return { department: rule.department, slaHours: rule.sla[severity] ?? rule.sla.Medium }; }
function pushNotification(text: string) { notifications.unshift({ id: randomUUID(), text, createdAt: new Date().toISOString(), read: false }); }
function event(status: CivicStatus, department: string, action: string, note?: string): HistoryEvent { return { status, department, action, note, timestamp: new Date().toISOString() }; }
function nextId() { sequence += 1; return `CIV-${new Date().getFullYear()}-${String(sequence).padStart(6, "0")}`; }

function seed() {
  const seedData = [
    { id: "CIV-2026-000124", title: "Pothole near school entrance", category: "Roads & Potholes", description: "A deep pothole has formed beside the school entrance and is difficult to see after dark.", severity: "High" as Priority, location: "12 Park View Road", address: "North Quarter · Ward 14", area: "Ward 14 · North Quarter", status: "In Progress" as CivicStatus, submittedAt: "2026-10-02T09:10:00.000Z", deadline: "2026-10-04T09:10:00.000Z", assignedOfficer: "A. Mehta", lat: 28.6314, lng: 77.2167 },
    { id: "CIV-2026-000119", title: "Streetlight out on Elm Avenue", category: "Streetlights", description: "Two lamps are not working outside the bus stop.", severity: "Medium" as Priority, location: "Elm Avenue, Block C", address: "East Market · Ward 8", area: "Ward 8 · East Market", status: "Assigned" as CivicStatus, submittedAt: "2026-10-01T15:20:00.000Z", deadline: "2026-10-04T15:20:00.000Z", assignedOfficer: "S. Khan", lat: 28.6381, lng: 77.2251 },
    { id: "CIV-2026-000108", title: "Blocked storm drain after rain", category: "Water & Drainage", description: "Standing water is covering the footpath and the drain is visibly blocked.", severity: "Critical" as Priority, location: "Riverside Lane", address: "Riverside · Ward 3", area: "Ward 3 · Riverside", status: "Escalated" as CivicStatus, submittedAt: "2026-09-26T11:00:00.000Z", deadline: "2026-09-27T11:00:00.000Z", assignedOfficer: "R. Bhat", lat: 28.6252, lng: 77.2073 },
    { id: "CIV-2026-000097", title: "Overflowing public bin", category: "Garbage & Sanitation", description: "The public bin has not been collected for several days.", severity: "Low" as Priority, location: "Central Square, Gate 2", address: "Central · Ward 11", area: "Ward 11 · Central", status: "Resolved" as CivicStatus, submittedAt: "2026-09-22T07:40:00.000Z", deadline: "2026-09-27T07:40:00.000Z", assignedOfficer: "P. Joseph", lat: 28.6299, lng: 77.2238 },
  ];
  seedData.forEach(item => {
    const department = routeFor(item.category, item.severity).department;
    complaints.set(item.id, { ...item, priority: item.severity, department, history: [event("Submitted", "CivicSense", "Complaint received"), event("Verified", "CivicSense", "Photo and location verified"), event(item.status === "Escalated" ? "Escalated" : item.status, department, item.status === "Escalated" ? "SLA expired; escalation created" : `${item.status} by responsible team`)], comments: [], escalations: item.status === "Escalated" ? [{ id: randomUUID(), reason: "SLA expired without resolution", from: department, to: "Department Head Office", createdAt: "2026-09-28T11:00:00.000Z", status: "Open" }] : [] });
  });
  notifications.push({ id: randomUUID(), text: "CIV-2026-000124 moved to In Progress", createdAt: new Date().toISOString(), read: false });
  notifications.push({ id: randomUUID(), text: "CIV-2026-000108 escalated to Department Head Office", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: false });
}
seed();

export function listComplaints() { return [...complaints.values()].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)); }
export function getComplaint(id: string) { return complaints.get(id); }
export function getCategories() { return Object.keys(routing).map(name => ({ name, department: routing[name].department, sla: routing[name].sla })); }
export function getDepartments() { return [...new Set(Object.values(routing).map(item => item.department))].map((name, index) => ({ id: index + 1, name, active: true })); }
export function createComplaint(input: Record<string, any>) {
  const category = typeof input.category === "string" && input.category in routing ? input.category : "Other";
  const severity = toPriority(input.severity);
  const route = routeFor(category, severity);
  const now = new Date().toISOString();
  const complaint: ComplaintRecord = { id: nextId(), title: String(input.title || "Untitled civic issue").slice(0, 140), category, description: String(input.description || "").slice(0, 4000), severity, priority: severity, department: route.department, location: String(input.location || "Unspecified location").slice(0, 180), address: String(input.address || input.location || "Unspecified location").slice(0, 180), area: String(input.address || input.location || "Unspecified area").slice(0, 180), lat: Number(input.lat) || 28.6314, lng: Number(input.lng) || 77.2167, status: "Submitted", submittedAt: now, deadline: new Date(Date.now() + route.slaHours * 60 * 60 * 1000).toISOString(), media: typeof input.media === "string" ? input.media : undefined, dangerous: Boolean(input.dangerous), atRisk: Boolean(input.atRisk), history: [event("Submitted", "CivicSense", "Complaint received")], comments: [], escalations: [] };
  complaints.set(complaint.id, complaint); pushNotification(`${complaint.id} submitted and routed to ${route.department}`); return complaint;
}

export function updateComplaint(id: string, patch: Record<string, any>) {
  const complaint = complaints.get(id); if (!complaint) return undefined;
  const nextStatus = patch.status as CivicStatus | undefined;
  if (nextStatus && nextStatus !== complaint.status) { complaint.status = nextStatus; complaint.history.push(event(nextStatus, complaint.department, patch.action || `Status changed to ${nextStatus}`, patch.note)); pushNotification(`${complaint.id} moved to ${nextStatus}`); }
  if (typeof patch.assignedOfficer === "string") { complaint.assignedOfficer = patch.assignedOfficer; if (complaint.status === "Submitted" || complaint.status === "Verified") { complaint.status = "Assigned"; complaint.history.push(event("Assigned", complaint.department, `Assigned to ${patch.assignedOfficer}`)); } }
  return complaint;
}
export function addComment(id: string, body: string) { const complaint = complaints.get(id); if (!complaint) return undefined; complaint.comments.push({ id: randomUUID(), body: body.slice(0, 1000), author: "CivicSense resident", createdAt: new Date().toISOString() }); pushNotification(`New comment added to ${id}`); return complaint; }
export function escalateComplaint(id: string, reason = "SLA expired without resolution") { const complaint = complaints.get(id); if (!complaint) return undefined; complaint.status = "Escalated"; const escalation = { id: randomUUID(), reason, from: complaint.department, to: "Department Head Office", createdAt: new Date().toISOString(), status: "Open" }; complaint.escalations.push(escalation); complaint.history.push(event("Escalated", "Department Head Office", "Escalation created", reason)); pushNotification(`${id} escalated to Department Head Office`); return complaint; }
export function getNotifications() { return notifications.slice(0, 30); }
export function createSafetyReport(input: Record<string, any>) { const report = { id: `SAFE-${new Date().getFullYear()}-${String(safetyReports.length + 1).padStart(4, "0")}`, type: String(input.type || "Other safety concern"), location: String(input.location || "Unspecified location"), description: String(input.description || "").slice(0, 2000), anonymous: input.anonymous !== false, status: "Received", createdAt: new Date().toISOString() }; safetyReports.unshift(report); pushNotification("A private safety report entered the review queue"); return report; }
export function listSafetyReports() { return safetyReports.map(item => ({ ...item, description: undefined })); }
export function dashboard() { const all = listComplaints(); const resolved = all.filter(item => ["Resolved", "Closed"].includes(item.status)).length; return { totals: { total: all.length, open: all.filter(item => !["Resolved", "Closed"].includes(item.status)).length, inProgress: all.filter(item => item.status === "In Progress").length, resolved, escalated: all.filter(item => item.status === "Escalated").length }, complaints: all, notifications: getNotifications(), departments: getDepartments(), categories: getCategories() }; }
