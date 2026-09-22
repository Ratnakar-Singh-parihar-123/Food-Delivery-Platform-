export const dashboardStats = {
  totalOrders: 1248,
  grossOrderValue: 384500,
  platformRevenue: 42850,
  activeVendors: 86,
  onlineRiders: 24,
  totalCustomers: 5420,
};

export const ordersData = [
  { day: "Mon", orders: 120 },
  { day: "Tue", orders: 180 },
  { day: "Wed", orders: 150 },
  { day: "Thu", orders: 230 },
  { day: "Fri", orders: 290 },
  { day: "Sat", orders: 360 },
  { day: "Sun", orders: 310 },
];

export const revenueData = [
  { name: "Vendor Commission", value: 28000 },
  { name: "Platform Fees", value: 8500 },
  { name: "Delivery Margin", value: 4250 },
  { name: "Sponsored Listings", value: 2100 },
];

export const recentOrders = [
  {
    id: "FD10251",
    customer: "Ratnakar Singh",
    vendor: "Sharma Family Dhaba",
    rider: "Rahul Kumar",
    amount: 425,
    payment: "Online",
    status: "On The Way",
    time: "8:15 PM",
  },
  {
    id: "FD10252",
    customer: "Aman Gupta",
    vendor: "Cake World",
    rider: "Amit",
    amount: 680,
    payment: "COD",
    status: "Preparing",
    time: "8:18 PM",
  },
  {
    id: "FD10253",
    customer: "Rohan Singh",
    vendor: "Royal Restaurant",
    rider: "Unassigned",
    amount: 310,
    payment: "UPI",
    status: "Waiting Rider",
    time: "8:22 PM",
  },
];

export const topVendors = [
  {
    name: "Sharma Family Dhaba",
    type: "Dhaba",
    orders: 245,
    revenue: 72500,
    rating: 4.6,
    status: "Open",
  },
  {
    name: "Cake World",
    type: "Bakery",
    orders: 190,
    revenue: 61200,
    rating: 4.8,
    status: "Open",
  },
  {
    name: "Royal Restaurant",
    type: "Restaurant",
    orders: 175,
    revenue: 54900,
    rating: 4.5,
    status: "Open",
  },
  {
    name: "Pizza House",
    type: "Fast Food",
    orders: 148,
    revenue: 48200,
    rating: 4.4,
    status: "Closed",
  },
];

export const pendingVendors = [
  {
    business: "Taste of India",
    type: "Restaurant",
    owner: "Rakesh Sharma",
    date: "Today",
  },
  {
    business: "Sagar Dhaba",
    type: "Dhaba",
    owner: "Sagar Singh",
    date: "Yesterday",
  },
  {
    business: "Sweet Home Bakery",
    type: "Bakery",
    owner: "Meena Gupta",
    date: "2 days ago",
  },
  {
    business: "Green Cafe",
    type: "Cafe",
    owner: "Arjun Patel",
    date: "3 days ago",
  },
  {
    business: "Tiffin Express",
    type: "Tiffin Center",
    owner: "Priya Sharma",
    date: "4 days ago",
  },
];

export const pendingRiders = [
  {
    name: "Vikas Kumar",
    vehicle: "Bicycle",
    date: "Today",
    photo: "https://ui-avatars.com/api/?name=Vikas+Kumar&background=random",
  },
  {
    name: "Anita Singh",
    vehicle: "Scooter",
    date: "Yesterday",
    photo: "https://ui-avatars.com/api/?name=Anita+Singh&background=random",
  },
  {
    name: "Ravi Patel",
    vehicle: "Motorcycle",
    date: "2 days ago",
    photo: "https://ui-avatars.com/api/?name=Ravi+Patel&background=random",
  },
];

export const supportTickets = [
  { id: "#SUP120", issue: "Food missing", priority: "High", type: "Customer" },
  {
    id: "#SUP121",
    issue: "Settlement issue",
    priority: "Medium",
    type: "Vendor",
  },
  { id: "#SUP122", issue: "Payment issue", priority: "Medium", type: "Rider" },
];

export const serviceAreas = [
  { name: "Main Market", active: true },
  { name: "Hospital Area", active: true },
  { name: "College Area", active: true },
  { name: "Bus Stand", active: true },
  { name: "Shanti Nagar", active: true },
  { name: "Industrial Area", active: false },
];
