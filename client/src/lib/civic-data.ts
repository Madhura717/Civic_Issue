export type IssueStatus = "Submitted" | "Verified" | "Assigned" | "In Progress" | "Resolved" | "Citizen Confirmation" | "Closed" | "Escalated";
export type Priority = "Low" | "Medium" | "High" | "Critical";

export type Complaint = {
  id: string;
  title: string;
  category: string;
  department: string;
  location: string;
  area: string;
  priority: Priority;
  status: IssueStatus;
  submittedAt: string;
  deadline: string;
  description: string;
  lat: number;
  lng: number;
  assignedOfficer?: string;
  history: { status: IssueStatus; timestamp: string; department: string; action: string; note?: string }[];
};

export const categoryMeta = [
  { label: "Roads & Potholes", short: "Roads", icon: "road", color: "blue" },
  { label: "Streetlights", short: "Lighting", icon: "light", color: "amber" },
  { label: "Garbage & Sanitation", short: "Sanitation", icon: "trash", color: "green" },
  { label: "Water & Drainage", short: "Water", icon: "water", color: "blue" },
  { label: "Traffic & Signals", short: "Traffic", icon: "traffic", color: "red" },
  { label: "Public Infrastructure", short: "Infrastructure", icon: "building", color: "green" },
  { label: "Environment", short: "Environment", icon: "leaf", color: "green" },
  { label: "Public Safety", short: "Safety", icon: "shield", color: "red" },
  { label: "Women's Safety", short: "Women’s safety", icon: "women", color: "red" },
  { label: "Other", short: "Other", icon: "other", color: "gray" },
] as const;

export const statusSteps: IssueStatus[] = ["Submitted", "Verified", "Assigned", "In Progress", "Resolved", "Citizen Confirmation", "Closed"];

export const demoComplaints: Complaint[] = [
  {
    id: "CIV-2026-000124",
    title: "Pothole near school entrance",
    category: "Roads & Potholes",
    department: "Municipal Roads Department",
    location: "12 Park View Road",
    area: "Ward 14 · North Quarter",
    priority: "High",
    status: "In Progress",
    submittedAt: "2026-10-02T09:10:00.000Z",
    deadline: "2026-10-04T09:10:00.000Z",
    description: "A deep pothole has formed beside the school entrance and is difficult to see after dark.",
    lat: 28.6314,
    lng: 77.2167,
    assignedOfficer: "A. Mehta",
    history: [
      { status: "Submitted", timestamp: "2026-10-02T09:10:00.000Z", department: "CivicSense", action: "Complaint received" },
      { status: "Verified", timestamp: "2026-10-02T10:02:00.000Z", department: "CivicSense", action: "Photo and location verified", note: "Location matches the submitted description." },
      { status: "Assigned", timestamp: "2026-10-02T12:24:00.000Z", department: "Municipal Roads Department", action: "Assigned to A. Mehta" },
      { status: "In Progress", timestamp: "2026-10-03T08:40:00.000Z", department: "Municipal Roads Department", action: "Site inspection scheduled", note: "Temporary barricade requested while patching is planned." },
    ],
  },
  {
    id: "CIV-2026-000119",
    title: "Streetlight out on Elm Avenue",
    category: "Streetlights",
    department: "Public Lighting Department",
    location: "Elm Avenue, Block C",
    area: "Ward 8 · East Market",
    priority: "Medium",
    status: "Assigned",
    submittedAt: "2026-10-01T15:20:00.000Z",
    deadline: "2026-10-04T15:20:00.000Z",
    description: "Two lamps are not working outside the bus stop.",
    lat: 28.6381,
    lng: 77.2251,
    assignedOfficer: "S. Khan",
    history: [
      { status: "Submitted", timestamp: "2026-10-01T15:20:00.000Z", department: "CivicSense", action: "Complaint received" },
      { status: "Verified", timestamp: "2026-10-01T16:05:00.000Z", department: "CivicSense", action: "Location verified" },
      { status: "Assigned", timestamp: "2026-10-02T09:30:00.000Z", department: "Public Lighting Department", action: "Assigned to S. Khan" },
    ],
  },
  {
    id: "CIV-2026-000108",
    title: "Blocked storm drain after rain",
    category: "Water & Drainage",
    department: "Water & Drainage Department",
    location: "Riverside Lane",
    area: "Ward 3 · Riverside",
    priority: "Critical",
    status: "Escalated",
    submittedAt: "2026-09-26T11:00:00.000Z",
    deadline: "2026-09-27T11:00:00.000Z",
    description: "Standing water is covering the footpath and the drain is visibly blocked.",
    lat: 28.6252,
    lng: 77.2073,
    assignedOfficer: "R. Bhat",
    history: [
      { status: "Submitted", timestamp: "2026-09-26T11:00:00.000Z", department: "CivicSense", action: "Complaint received" },
      { status: "Verified", timestamp: "2026-09-26T12:05:00.000Z", department: "CivicSense", action: "Safety risk verified" },
      { status: "Assigned", timestamp: "2026-09-26T13:00:00.000Z", department: "Water & Drainage Department", action: "Assigned to R. Bhat" },
      { status: "Escalated", timestamp: "2026-09-28T11:00:00.000Z", department: "Department Head Office", action: "SLA expired; escalation created", note: "Higher authority review requested." },
    ],
  },
  {
    id: "CIV-2026-000097",
    title: "Overflowing public bin",
    category: "Garbage & Sanitation",
    department: "Sanitation Department",
    location: "Central Square, Gate 2",
    area: "Ward 11 · Central",
    priority: "Low",
    status: "Resolved",
    submittedAt: "2026-09-22T07:40:00.000Z",
    deadline: "2026-09-27T07:40:00.000Z",
    description: "The public bin has not been collected for several days.",
    lat: 28.6299,
    lng: 77.2238,
    assignedOfficer: "P. Joseph",
    history: [
      { status: "Submitted", timestamp: "2026-09-22T07:40:00.000Z", department: "CivicSense", action: "Complaint received" },
      { status: "Verified", timestamp: "2026-09-22T08:10:00.000Z", department: "CivicSense", action: "Photo verified" },
      { status: "Assigned", timestamp: "2026-09-22T09:20:00.000Z", department: "Sanitation Department", action: "Assigned to P. Joseph" },
      { status: "Resolved", timestamp: "2026-09-23T06:30:00.000Z", department: "Sanitation Department", action: "Collection completed" },
    ],
  },
];

export const activityFeed = [
  { text: "Complaint CIV-2026-000124 moved to In Progress", time: "18 min ago" },
  { text: "New safety report received near North Quarter", time: "42 min ago" },
  { text: "CIV-2026-000108 escalated to Department Head Office", time: "2 hrs ago" },
  { text: "Resolution confirmed for CIV-2026-000097", time: "Yesterday" },
];

export function statusTone(status: IssueStatus | Priority) {
  if (["Resolved", "Closed", "Low"].includes(status)) return "green";
  if (["Escalated", "Critical"].includes(status)) return "red";
  if (["In Progress", "High"].includes(status)) return "blue";
  if (["Assigned", "Medium"].includes(status)) return "amber";
  return "gray";
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(value));
}
