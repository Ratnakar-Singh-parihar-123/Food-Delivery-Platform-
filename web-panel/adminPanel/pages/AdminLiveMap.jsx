import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Truck,
  User,
  Clock,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Package,
  Navigation,
  ShoppingBag,
  Hourglass,
  ArrowRight,
  Users,
  TrendingUp,
  TrendingDown,
  Store,
  Phone,
  Mail,
  Calendar,
  Map,
  Eye,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  X,
  Menu,
  Link,
  Layers,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatDistanceToNow, format } from "date-fns";
import {
  getAdminLiveOrders,
  getRiderLocations,
  getAdminOrderDetails,
  getAllVendorsApi,
} from "../../src/api/adminApi";

// ─── Fix Leaflet Default Icons ──────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ─── Custom Icons ────────────────────────────────────────────
const createIcon = (iconUrl, size = [30, 45], anchor = [15, 45]) => {
  return new L.Icon({
    iconUrl: iconUrl,
    iconSize: size,
    iconAnchor: anchor,
    popupAnchor: [1, -34],
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    shadowSize: [41, 41],
  });
};

const riderIcon = createIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
);
const vendorIcon = createIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
);
const tiffinIcon = createIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
);
const orderPlacedIcon = createIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
);
const orderAcceptedIcon = createIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
);
const orderPickedIcon = createIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
);
const orderDeliveredIcon = createIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
);

// ─── Custom Div Icon for Orders ────────────────────────────
const createOrderIcon = (orderNumber, status) => {
  const statusColors = {
    placed: "#9ca3af",
    confirmed: "#6366f1",
    preparing: "#8b5cf6",
    ready_for_pickup: "#22c55e",
    rider_assigned: "#06b6d4",
    picked_up: "#f97316",
    on_the_way: "#f59e0b",
    delivered: "#3b82f6",
    cancelled: "#ef4444",
    rejected: "#6b7280",
  };
  const color = statusColors[status] || "#9ca3af";
  const html = `
    <div style="
      background: white;
      border-radius: 20px;
      border: 2px solid ${color};
      padding: 2px 8px;
      font-size: 9px;
      font-weight: 800;
      color: #1f2937;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 4px;
    ">
      <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${color};"></span>
      ${orderNumber?.slice(0, 6) || "ORD"}
    </div>
  `;
  return L.divIcon({
    html: html,
    className: "order-marker",
    iconSize: [70, 24],
    iconAnchor: [35, 12],
    popupAnchor: [0, -12],
  });
};

// ─── Status Config ────────────────────────────────────────────
const STATUS_CONFIG = {
  placed: {
    label: "Placed",
    color: "bg-blue-50 text-blue-600 border-blue-200",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    icon: CheckCircle,
  },
  preparing: {
    label: "Preparing",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    icon: Package,
  },
  ready_for_pickup: {
    label: "Ready",
    color: "bg-green-50 text-green-600 border-green-200",
    icon: Package,
  },
  rider_assigned: {
    label: "Assigned",
    color: "bg-cyan-50 text-cyan-600 border-cyan-200",
    icon: User,
  },
  picked_up: {
    label: "Picked Up",
    color: "bg-orange-50 text-orange-600 border-orange-200",
    icon: Truck,
  },
  on_the_way: {
    label: "On the Way",
    color: "bg-amber-50 text-amber-600 border-amber-200",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: XCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-gray-50 text-gray-500 border-gray-200",
    icon: XCircle,
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${config.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function AdminLiveMap() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [riders, setRiders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.209]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const mapRef = useRef();

  // ─── Layer Visibility State ──────────────────────────────
  const [layers, setLayers] = useState({
    vendors: true,
    riders: true,
    orders: true,
  });

  // ─── Fetch Data ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setError("");
      const [ordersRes, ridersRes, vendorsRes] = await Promise.all([
        getAdminLiveOrders(),
        getRiderLocations(),
        getAllVendorsApi({ limit: 500, onlyWithLocation: true }),
      ]);

      const ordersData = ordersRes?.data?.orders || ordersRes?.data || [];
      setOrders(ordersData);

      const ridersData = ridersRes?.data?.riders || ridersRes?.data || [];
      setRiders(ridersData);

      const vendorsData = vendorsRes?.data?.vendors || vendorsRes?.data || [];
      setVendors(vendorsData);

      const onlineRider = ridersData.find((r) => r.isOnline && r.lat && r.lng);
      if (onlineRider) {
        setMapCenter([onlineRider.lat, onlineRider.lng]);
      } else if (vendorsData.length > 0 && vendorsData[0].address?.location) {
        const loc = vendorsData[0].address.location;
        if (loc.coordinates) {
          setMapCenter([loc.coordinates[1], loc.coordinates[0]]);
        }
      }
    } catch (err) {
      console.error("Error fetching live data:", err);
      setError(err?.response?.data?.message || "Failed to load live data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleOrderSelect = async (orderId) => {
    setSelectedOrderId(orderId);
    try {
      const res = await getAdminOrderDetails(orderId);
      setSelectedOrderDetails(res?.data?.order || null);
    } catch (err) {
      const order = orders.find((o) => o._id === orderId || o.id === orderId);
      setSelectedOrderDetails(order || null);
    }
  };

  const clearSelection = () => {
    setSelectedOrderId(null);
    setSelectedOrderDetails(null);
  };

  // ─── Stats ────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = orders.length;
    const active = orders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled",
    ).length;
    const assigned = orders.filter((o) => o.rider).length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const preparing = orders.filter(
      (o) => o.status === "preparing" || o.status === "ready_for_pickup",
    ).length;
    const onRoad = orders.filter(
      (o) => o.status === "picked_up" || o.status === "on_the_way",
    ).length;
    return { total, active, assigned, delivered, preparing, onRoad };
  }, [orders]);

  const groupedOrders = useMemo(() => {
    const groups = {};
    orders.forEach((o) => {
      if (o.status === "delivered" || o.status === "cancelled") return;
      if (!groups[o.status]) groups[o.status] = [];
      groups[o.status].push(o);
    });
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });
    return groups;
  }, [orders]);

  // ─── Get selected order's vendor & rider ─────────────────
  const selectedVendor = useMemo(() => {
    if (!selectedOrderDetails) return null;
    return vendors.find((v) => v._id === selectedOrderDetails.vendor?._id);
  }, [selectedOrderDetails, vendors]);

  const selectedRider = useMemo(() => {
    if (!selectedOrderDetails) return null;
    return riders.find((r) => r.id === selectedOrderDetails.rider?._id);
  }, [selectedOrderDetails, riders]);

  // ─── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Navigation className="w-6 h-6 text-orange-500" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="px-6 py-8 text-center border border-red-200 rounded-2xl bg-red-50/80 backdrop-blur-sm">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
          <p className="mt-3 text-lg font-bold text-red-700">
            Failed to load live data
          </p>
          <p className="mt-1 text-sm text-red-500">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 mt-4 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen max-h-screen overflow-hidden bg-gradient-to-br from-orange-50/50 via-white to-red-50/30">
      {/* ─── SIDEBAR TOGGLE ────────────────────────────────── */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 z-20 p-2.5 bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl hover:bg-white transition-all duration-300"
      >
        {sidebarOpen ? (
          <X className="w-5 h-5 text-gray-700" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* ─── SIDEBAR ────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -420,
          opacity: sidebarOpen ? 1 : 0.5,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute left-0 top-0 z-10 flex flex-col bg-white/95 backdrop-blur-md border-r border-gray-200/60 shadow-2xl shadow-gray-200/30 w-[420px] max-w-full h-full"
      >
        {/* Header */}
        <div className="flex-shrink-0 p-5 border-b border-gray-200/60 bg-gradient-to-r from-orange-50 to-amber-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black text-gray-900">
                <Navigation className="w-5 h-5 text-orange-500" />
                Live Deliveries
              </h2>
              <p className="text-sm text-gray-400">
                {stats.active} active · {stats.assigned} assigned ·{" "}
                <span className="font-semibold text-orange-500">
                  {stats.onRoad}
                </span>{" "}
                on road
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 text-gray-500 transition rounded-xl hover:bg-white/80 disabled:opacity-50 shadow-sm hover:shadow"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <StatChip
              label="Placed"
              value={orders.filter((o) => o.status === "placed").length}
              color="blue"
            />
            <StatChip
              label="Preparing"
              value={stats.preparing}
              color="purple"
            />
            <StatChip label="On Road" value={stats.onRoad} color="green" />
            <StatChip
              label="Delivered"
              value={stats.delivered}
              color="emerald"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 mt-4 border bg-white/60 rounded-xl border-gray-200/60">
            <TabButton
              active={activeTab === "orders"}
              onClick={() => setActiveTab("orders")}
              icon={Package}
              label="Orders"
            />
            <TabButton
              active={activeTab === "riders"}
              onClick={() => setActiveTab("riders")}
              icon={Truck}
              label="Riders"
            />
            <TabButton
              active={activeTab === "vendors"}
              onClick={() => setActiveTab("vendors")}
              icon={Store}
              label="Vendors"
            />
          </div>
        </div>

        {/* ─── TAB: ORDERS ────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <AnimatePresence>
              {Object.keys(groupedOrders).length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No active orders"
                  subtitle="All caught up!"
                />
              ) : (
                Object.entries(groupedOrders).map(([status, items]) => (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge status={status} />
                      <span className="text-xs text-gray-400">
                        {items.length} order{items.length > 1 && "s"}
                      </span>
                    </div>
                    <AnimatePresence initial={false}>
                      {items.map((order) => (
                        <OrderCard
                          key={order._id || order.id}
                          order={order}
                          isSelected={
                            selectedOrderId === (order._id || order.id)
                          }
                          onSelect={() =>
                            handleOrderSelect(order._id || order.id)
                          }
                          riders={riders}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ─── TAB: RIDERS ──────────────────────────────────── */}
        {activeTab === "riders" && (
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Online Riders ({riders.filter((r) => r.isOnline).length})
              </p>
              <p className="text-xs text-gray-400">
                Offline: {riders.filter((r) => !r.isOnline).length}
              </p>
            </div>
            <div className="space-y-2">
              {riders.length === 0 ? (
                <EmptyState
                  icon={Truck}
                  title="No riders"
                  subtitle="No riders available"
                />
              ) : (
                riders.map((rider) => (
                  <RiderCard key={rider.id} rider={rider} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: VENDORS ────────────────────────────────── */}
        {activeTab === "vendors" && (
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                Total Vendors ({vendors.length})
              </p>
              <span className="text-xs text-gray-400">
                {
                  vendors.filter((v) => v.businessType === "tiffin_center")
                    .length
                }{" "}
                Tiffin
              </span>
            </div>
            <div className="space-y-2">
              {vendors.length === 0 ? (
                <EmptyState
                  icon={Store}
                  title="No vendors"
                  subtitle="No vendors registered"
                />
              ) : (
                vendors.map((vendor) => (
                  <VendorCard key={vendor._id} vendor={vendor} />
                ))
              )}
            </div>
          </div>
        )}
      </motion.aside>

      {/* ─── MAP ────────────────────────────────────────────── */}
      <div className="relative flex-1 h-full">
        <MapContainer
          ref={mapRef}
          key="live-map"
          center={mapCenter}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ─── VENDOR MARKERS ────────────────────────────── */}
          {layers.vendors &&
            vendors.map((vendor) => {
              const loc = vendor.address?.location;
              if (!loc || !loc.coordinates) return null;
              const pos = [loc.coordinates[1], loc.coordinates[0]];
              const isTiffin = vendor.businessType === "tiffin_center";
              const icon = isTiffin ? tiffinIcon : vendorIcon;
              const isSelectedVendor = selectedVendor?._id === vendor._id;
              return (
                <Marker
                  key={`vendor-${vendor._id}`}
                  position={pos}
                  icon={icon}
                  zIndexOffset={isSelectedVendor ? 1000 : 0}
                >
                  <Popup>
                    <div className="max-w-xs text-sm">
                      <p className="font-bold">{vendor.businessName}</p>
                      <p className="text-xs text-gray-500">
                        {isTiffin ? "Tiffin House" : "Restaurant"}
                      </p>
                      <p className="text-xs">{vendor.address?.addressLine}</p>
                      <p className="text-xs">
                        Status: {vendor.isOnline ? "🟢 Online" : "🔴 Offline"}
                      </p>
                      {isSelectedVendor && (
                        <p className="text-xs font-bold text-orange-500">
                          📍 Selected Vendor
                        </p>
                      )}
                    </div>
                  </Popup>
                  <Tooltip
                    direction="top"
                    offset={[0, -20]}
                    opacity={1}
                    permanent={isSelectedVendor}
                    className="text-xs font-bold"
                  >
                    <span
                      className={`px-2 py-1 rounded-full ${isSelectedVendor ? "bg-orange-500 text-white shadow-lg" : "bg-white/90 text-gray-700 shadow-sm"}`}
                    >
                      {vendor.businessName}
                    </span>
                  </Tooltip>
                  {isSelectedVendor && (
                    <Circle
                      center={pos}
                      radius={200}
                      pathOptions={{
                        color: "#f97316",
                        fillColor: "#f97316",
                        fillOpacity: 0.15,
                        weight: 2,
                      }}
                    />
                  )}
                </Marker>
              );
            })}

          {/* ─── RIDER MARKERS ─────────────────────────────── */}
          {layers.riders &&
            riders.map((rider) => {
              const lat = rider.lat;
              const lng = rider.lng;
              if (!lat || !lng) return null;
              const isSelectedRider = selectedRider?.id === rider.id;
              return (
                <Marker
                  key={rider.id}
                  position={[lat, lng]}
                  icon={riderIcon}
                  zIndexOffset={isSelectedRider ? 1000 : 0}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{rider.name}</p>
                      <p>
                        Status: {rider.isOnline ? "🟢 Online" : "🔴 Offline"}
                      </p>
                      <p>Phone: {rider.phone || "—"}</p>
                      {isSelectedRider && (
                        <p className="font-bold text-orange-500">🚚 Assigned</p>
                      )}
                    </div>
                  </Popup>
                  <Tooltip
                    direction="top"
                    offset={[0, -20]}
                    permanent={isSelectedRider}
                    className="text-xs font-bold"
                  >
                    <span
                      className={`px-2 py-1 rounded-full ${isSelectedRider ? "bg-orange-500 text-white shadow-lg" : "bg-white/90 text-gray-700 shadow-sm"}`}
                    >
                      {rider.name}
                    </span>
                  </Tooltip>
                  {isSelectedRider && (
                    <Circle
                      center={[lat, lng]}
                      radius={300}
                      pathOptions={{
                        color: "#f97316",
                        fillColor: "#f97316",
                        fillOpacity: 0.1,
                        weight: 2,
                        dashArray: "5 5",
                      }}
                    />
                  )}
                </Marker>
              );
            })}

          {/* ─── ORDER MARKERS ────────────────────────────── */}
          {layers.orders &&
            orders
              .filter((o) => o.deliveryAddress?.location?.coordinates)
              .map((order) => {
                const coords = order.deliveryAddress.location.coordinates;
                const pos = [coords[1], coords[0]];
                const isSelected = selectedOrderId === (order._id || order.id);
                const icon = createOrderIcon(
                  order.orderNumber || order.id,
                  order.status,
                );
                return (
                  <Marker
                    key={`order-${order._id}`}
                    position={pos}
                    icon={icon}
                    zIndexOffset={isSelected ? 1000 : 0}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">
                          {order.orderNumber || order.id}
                        </p>
                        <StatusBadge status={order.status} />
                        <p className="mt-1 text-xs text-gray-500">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </p>
                        <p className="text-xs">
                          Vendor: {order.vendor?.businessName}
                        </p>
                        {order.rider && (
                          <p className="text-xs">
                            Rider: {order.rider.firstName || order.rider.name}
                          </p>
                        )}
                        {isSelected && (
                          <p className="font-bold text-orange-500">
                            📍 Selected
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

          {/* ─── ROUTE LINES ────────────────────────────────── */}
          {selectedOrderDetails &&
            selectedOrderDetails.vendor?.address?.location?.coordinates &&
            selectedOrderDetails.deliveryAddress?.location?.coordinates && (
              <>
                <Polyline
                  positions={[
                    [
                      selectedOrderDetails.vendor.address.location
                        .coordinates[1],
                      selectedOrderDetails.vendor.address.location
                        .coordinates[0],
                    ],
                    [
                      selectedOrderDetails.deliveryAddress.location
                        .coordinates[1],
                      selectedOrderDetails.deliveryAddress.location
                        .coordinates[0],
                    ],
                  ]}
                  color="#f97316"
                  weight={4}
                  opacity={0.9}
                  dashArray="8 8"
                />
                <Polyline
                  positions={[
                    [
                      selectedOrderDetails.vendor.address.location
                        .coordinates[1],
                      selectedOrderDetails.vendor.address.location
                        .coordinates[0],
                    ],
                    [
                      selectedOrderDetails.deliveryAddress.location
                        .coordinates[1],
                      selectedOrderDetails.deliveryAddress.location
                        .coordinates[0],
                    ],
                  ]}
                  color="#f97316"
                  weight={12}
                  opacity={0.1}
                  dashArray="8 8"
                />
              </>
            )}
        </MapContainer>

        {/* ─── LAYER CONTROL (floating panel) ───────────────── */}
        <div className="absolute z-10 top-4 right-4 flex flex-col gap-2 bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-xl rounded-2xl p-3 min-w-[140px]">
          <div className="flex items-center gap-2 pb-2 mb-1 text-xs font-bold text-gray-600 border-b border-gray-200">
            <Layers className="w-4 h-4" />
            <span>Show on Map</span>
          </div>
          <LayerToggle
            label="Vendors"
            icon={<Store className="w-4 h-4 text-blue-500" />}
            checked={layers.vendors}
            onChange={() =>
              setLayers((prev) => ({ ...prev, vendors: !prev.vendors }))
            }
          />
          <LayerToggle
            label="Riders"
            icon={<Truck className="w-4 h-4 text-orange-500" />}
            checked={layers.riders}
            onChange={() =>
              setLayers((prev) => ({ ...prev, riders: !prev.riders }))
            }
          />
          <LayerToggle
            label="Orders"
            icon={<Package className="w-4 h-4 text-purple-500" />}
            checked={layers.orders}
            onChange={() =>
              setLayers((prev) => ({ ...prev, orders: !prev.orders }))
            }
          />
          {selectedOrderId && (
            <button
              onClick={clearSelection}
              className="flex items-center justify-center gap-1 pt-2 mt-2 text-xs font-bold text-orange-500 border-t border-gray-200 hover:text-orange-600"
            >
              <X className="w-3.5 h-3.5" />
              Clear Selection
            </button>
          )}
        </div>

        {/* ─── TOP OVERLAY ────────────────────────────────────── */}
        <div className="absolute z-10 -translate-x-1/2 pointer-events-none left-1/2 top-4">
          <div className="px-5 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-2xl flex items-center gap-3 pointer-events-auto">
            <Navigation className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              Live Tracking – {riders.filter((r) => r.isOnline).length} riders
              online
            </span>
            <span className="text-xs text-gray-400">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* ─── LEGEND ────────────────────────────────────────── */}
        <div className="absolute z-10 flex flex-wrap gap-2 p-3 border shadow-lg bottom-4 left-4 bg-white/90 backdrop-blur-sm border-gray-200/60 rounded-xl max-w-[280px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-xs text-gray-600">Rider</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-xs text-gray-600">Vendor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-xs text-gray-600">Tiffin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <span className="text-xs text-gray-600">Placed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-xs text-gray-600">Accepted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-600">Picked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-orange-400" />
            <span className="text-xs text-gray-600">Route</span>
          </div>
        </div>

        {/* ─── SELECTED ORDER DETAILS ────────────────────────── */}
        {selectedOrderDetails && (
          <div className="absolute z-10 bottom-4 right-4 max-w-sm w-full bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-2xl rounded-2xl p-4 max-h-[60%] overflow-y-auto">
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-bold text-gray-900">
                Order #
                {selectedOrderDetails.orderNumber || selectedOrderDetails.id}
              </h4>
              <button
                onClick={clearSelection}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <StatusBadge status={selectedOrderDetails.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Vendor</span>
                <span className="font-medium">
                  {selectedOrderDetails.vendor?.businessName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Customer</span>
                <span>
                  {selectedOrderDetails.customer?.firstName}{" "}
                  {selectedOrderDetails.customer?.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold">
                  ₹{selectedOrderDetails.totalAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Rider</span>
                <span>
                  {selectedOrderDetails.rider?.firstName || "Not assigned"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">Pickup</span>
                <span className="text-xs">
                  {selectedOrderDetails.vendor?.address?.addressLine || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Delivery</span>
                <span className="text-xs">
                  {selectedOrderDetails.deliveryAddress?.addressLine || "N/A"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition ${
        active
          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/30"
          : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function StatChip({ label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div
      className={`text-center p-2 rounded-xl ${colors[color] || "bg-gray-50 text-gray-600"}`}
    >
      <p className="text-xs font-bold">{value}</p>
      <p className="text-[8px] font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
}

function LayerToggle({ label, icon, checked, onChange }) {
  return (
    <label className="flex items-center justify-between text-sm cursor-pointer group">
      <span className="flex items-center gap-2 text-gray-700 group-hover:text-gray-900">
        {icon}
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-orange-500 border-gray-300 rounded cursor-pointer focus:ring-orange-400"
      />
    </label>
  );
}

function OrderCard({ order, isSelected, onSelect, riders }) {
  const rider = riders.find(
    (r) => r.id === order.rider?._id || r.id === order.rider,
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, height: 0, margin: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl border p-4 transition-all hover:shadow-md ${
        isSelected
          ? "border-orange-400 bg-orange-50/80 shadow-orange-100"
          : "border-gray-200/60 bg-white/50 hover:bg-white/80 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900 truncate">
              {order.orderNumber || order.id}
            </p>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {formatDistanceToNow(new Date(order.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
            <Store className="w-3 h-3" />
            <span className="truncate">{order.vendor?.businessName}</span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <User className="w-3 h-3" />
            <span className="truncate">{order.customer?.firstName}</span>
          </div>
          {rider && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-orange-500">
              <Truck className="w-3 h-3" />
              <span className="font-medium">{rider.name}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusBadge status={order.status} />
        </div>
      </div>
    </motion.div>
  );
}

function RiderCard({ rider }) {
  return (
    <div className="flex items-center gap-3 p-3 transition border shadow-sm bg-white/60 rounded-xl hover:bg-white/90 border-gray-200/60">
      <div
        className={`flex items-center justify-center rounded-full w-9 h-9 ${rider.isOnline ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}
      >
        <User className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{rider.name}</p>
        <p className="text-xs text-gray-400 truncate">
          {rider.phone || "No phone"}
        </p>
      </div>
      <span
        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${rider.isOnline ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}
      >
        {rider.isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
}

function VendorCard({ vendor }) {
  const isTiffin = vendor.businessType === "tiffin_center";
  return (
    <div className="flex items-center gap-3 p-3 transition border shadow-sm bg-white/60 rounded-xl hover:bg-white/90 border-gray-200/60">
      <div
        className={`flex items-center justify-center rounded-full w-9 h-9 ${isTiffin ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}
      >
        <Store className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">
          {vendor.businessName}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {isTiffin ? "Tiffin House" : "Restaurant"} •{" "}
          {vendor.address?.city || "N/A"}
        </p>
      </div>
      <span
        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${vendor.isOnline ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}
      >
        {vendor.isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <Icon className="w-16 h-16 mb-3 opacity-20" />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs">{subtitle}</p>
    </div>
  );
}
