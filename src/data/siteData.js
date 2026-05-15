export const SEARCHABLE_AREAS = [
  "Gulberg",
  "DHA",
  "Johar Town",
  "Model Town",
  "Iqbal Town",
  "Liberty Market",
  "MM Alam Road",
  "Ferozepur Road",
  "Jail Road",
  "Canal Road",
  "Garden Town",
  "Township",
  "Wapda Town",
  "Lahore Cantt",
];

export const MAP_POINTS = [
  { area: "Gulberg", lat: 31.5167, lng: 74.3486 },
  { area: "DHA Phase 5", lat: 31.465, lng: 74.405 },
  { area: "Johar Town", lat: 31.474, lng: 74.272 },
  { area: "Model Town", lat: 31.483, lng: 74.324 },
  { area: "Iqbal Town", lat: 31.4975, lng: 74.29 },
  { area: "Liberty Market", lat: 31.5108, lng: 74.3547 },
  { area: "MM Alam Road", lat: 31.5155, lng: 74.352 },
  { area: "Ferozepur Road", lat: 31.452, lng: 74.318 },
  { area: "Canal Road", lat: 31.528, lng: 74.318 },
  { area: "Jail Road", lat: 31.515, lng: 74.328 },
  { area: "Lahore Cantt", lat: 31.512, lng: 74.384 },
  { area: "Township", lat: 31.445, lng: 74.302 },
  { area: "Wapda Town", lat: 31.435, lng: 74.268 },
  { area: "Garden Town", lat: 31.502, lng: 74.325 },
  { area: "Gulberg II", lat: 31.518, lng: 74.352 },
  { area: "Johar Town Block R", lat: 31.471, lng: 74.265 },
];

export const STATS = [
  {
    key: "reports",
    label: "Total Reports",
    value: "2,847",
    trend: "+12.4%",
    trendUp: true,
    bar: 78,
    icon: "doc",
  },
  {
    key: "detected",
    label: "Potholes Detected",
    value: "1,926",
    trend: "+8.1%",
    trendUp: true,
    bar: 65,
    icon: "camera",
  },
  {
    key: "resolved",
    label: "Areas Resolved",
    value: "34",
    trend: "+4 areas",
    trendUp: true,
    bar: 42,
    icon: "check",
  },
  {
    key: "risk",
    label: "High Risk Roads",
    value: "18",
    trend: "−2 vs last week",
    trendUp: false,
    bar: 55,
    icon: "alert",
  },
  {
    key: "pending",
    label: "Pending Reports",
    value: "412",
    trend: "−6.2%",
    trendUp: true,
    bar: 30,
    icon: "clock",
  },
];

export const RECENT_REPORTS = [
  {
    area: "Gulberg",
    time: "Today, 9:14 AM",
    detail: "Deep depression near signal — water pooling after rain.",
    img: "https://picsum.photos/seed/pothole1/128/128.jpg",
  },
  {
    area: "Ferozepur Road",
    time: "Yesterday, 6:40 PM",
    detail: "Longitudinal crack widening; heavy bus traffic.",
    img: "https://picsum.photos/seed/pothole2/128/128.jpg",
  },
  {
    area: "Johar Town",
    time: "Yesterday, 2:05 PM",
    detail: "Multiple small holes in slow lane outside market.",
    img: "https://picsum.photos/seed/pothole3/128/128.jpg",
  },
  {
    area: "Canal Road",
    time: "Mon, 11:22 AM",
    detail: "Edge failure along shoulder; cyclists at risk.",
    img: "https://picsum.photos/seed/pothole4/128/128.jpg",
  },
  {
    area: "DHA",
    time: "Sun, 4:50 PM",
    detail: "Patched section sinking again after recent heat.",
    img: "https://picsum.photos/seed/pothole5/128/128.jpg",
  },
];

export const TOP_AREAS = [
  { name: "Gulberg", count: 312 },
  { name: "Johar Town", count: 276 },
  { name: "DHA", count: 241 },
  { name: "Ferozepur Road", count: 198 },
  { name: "Canal Road", count: 185 },
  { name: "Township", count: 156 },
];

export const CONTRIBUTORS = [
  { name: "Ayesha Khan", area: "Model Town", reports: 48, rank: "Top Contributor" },
  { name: "Hassan Malik", area: "Iqbal Town", reports: 31, rank: "Active Contributor" },
  { name: "Sara Ahmed", area: "Garden Town", reports: 22, rank: "Active Contributor" },
  { name: "Bilal Raza", area: "Wapda Town", reports: 6, rank: "New Reporter" },
];

export const AI_INSIGHTS = [
  { label: "Detection accuracy", value: "94.2%" },
  { label: "High risk roads", value: "18 segments" },
  { label: "Repeated damage areas", value: "7 hotspots" },
  { label: "Predicted deterioration (30d)", value: "+11% load risk" },
];

export const SAFETY_TIPS = [
  "Slow down when approaching visibly damaged roads — sudden swerves cause collisions.",
  "Avoid harsh braking on uneven surfaces; keep a safe following distance.",
  "Report dangerous potholes through RoadVision.pk so crews can prioritize fixes.",
  "Use headlights in low light to spot surface changes earlier.",
];
