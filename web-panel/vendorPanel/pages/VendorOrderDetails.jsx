import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  getVendorOrderById,
  acceptVendorOrder,
  rejectVendorOrder,
  updateVendorOrderStatusApi,
} from "../../src/api/vendorApi";
import { useSocket } from "../context/SocketContext";

const COLORS = {
  primary: "#FF6B35",
  primaryDark: "#E55A2B",
  primaryLight: "#FFF0EA",
  background: "#FFF8F5",
  white: "#FFFFFF",
  title: "#0F172A",
  text: "#334155",
  muted: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
};

const STATUS_LABELS = {
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready_for_pickup: "Ready for Pickup",
  rider_assigned: "Rider Assigned",
  picked_up: "Picked Up",
  on_the_way: "On The Way",
  delivered: "Delivered",
  rejected: "Rejected",
};

const STATUS_COLORS = {
  placed: COLORS.warning,
  confirmed: COLORS.info,
  preparing: COLORS.primary,
  ready_for_pickup: COLORS.success,
  rider_assigned: COLORS.info,
  picked_up: COLORS.info,
  on_the_way: COLORS.warning,
  delivered: COLORS.success,
  rejected: COLORS.danger,
};

export default function VendorOrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Reject modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Socket
  const { socket, joinOrderRoom, leaveOrderRoom } = useSocket();

  // Fetch order
  const fetchOrder = async () => {
    try {
      const res = await getVendorOrderById(orderId);
      setOrder(res.data.order);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to load order");
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // ─── Socket: Join order room & listen for updates ──────
  useEffect(() => {
    if (!socket || !orderId) return;

    // Join the order-specific room
    joinOrderRoom(orderId);

    const handleOrderUpdate = (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
      }
    };

    socket.on("order:updated", handleOrderUpdate);

    return () => {
      socket.off("order:updated", handleOrderUpdate);
      leaveOrderRoom(orderId);
    };
  }, [socket, orderId, joinOrderRoom, leaveOrderRoom]);

  // ─── Also listen using useFocusEffect (optional, but safe) ──
  useFocusEffect(
    useCallback(() => {
      if (!socket || !orderId) return;

      const handleOrderUpdate = (updatedOrder) => {
        if (updatedOrder._id === orderId) {
          setOrder(updatedOrder);
        }
      };

      socket.on("order:updated", handleOrderUpdate);

      return () => {
        socket.off("order:updated", handleOrderUpdate);
      };
    }, [socket, orderId]),
  );

  // ─── Action Handlers ─────────────────────────────────────

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      await acceptVendorOrder(orderId);
      await fetchOrder();
      Alert.alert("Success", "Order accepted");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert("Error", "Please provide a reason");
      return;
    }
    try {
      setActionLoading(true);
      await rejectVendorOrder(orderId, { reason: rejectReason.trim() });
      await fetchOrder();
      setRejectModalVisible(false);
      setRejectReason("");
      Alert.alert("Success", "Order rejected");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReady = async () => {
    try {
      setActionLoading(true);
      await updateVendorOrderStatusApi(orderId, { status: "ready_for_pickup" });
      await fetchOrder();
      Alert.alert("Success", "Order marked ready for pickup");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPickup = async () => {
    try {
      setActionLoading(true);
      await updateVendorOrderStatusApi(orderId, { status: "picked_up" });
      await fetchOrder();
      Alert.alert("Success", "Pickup confirmed");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Render Helpers ─────────────────────────────────────

  const renderStatusBadge = (status) => {
    const label = STATUS_LABELS[status] || status;
    const color = STATUS_COLORS[status] || COLORS.muted;
    return (
      <View style={[styles.statusBadge, { backgroundColor: color + "20" }]}>
        <Text style={[styles.statusText, { color }]}>{label}</Text>
      </View>
    );
  };

  const renderActionButtons = () => {
    if (!order) return null;

    const { status } = order;

    if (status === "rejected" || status === "delivered") {
      return (
        <View style={styles.finalStatusContainer}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          <Text style={styles.finalStatusText}>
            {status === "delivered" ? "Order Completed" : "Order Rejected"}
          </Text>
        </View>
      );
    }

    if (status === "placed") {
      return (
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAccept}
            disabled={actionLoading}
          >
            <Ionicons name="checkmark" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Accept</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => setRejectModalVisible(true)}
            disabled={actionLoading}
          >
            <Ionicons name="close" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </Pressable>
        </View>
      );
    }

    if (status === "preparing") {
      return (
        <Pressable
          style={[styles.actionButton, styles.readyButton, { width: "100%" }]}
          onPress={handleMarkReady}
          disabled={actionLoading}
        >
          <Ionicons name="restaurant-outline" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Mark Ready for Pickup</Text>
        </Pressable>
      );
    }

    if (status === "ready_for_pickup" || status === "rider_assigned") {
      return (
        <Pressable
          style={[styles.actionButton, styles.pickupButton, { width: "100%" }]}
          onPress={handleConfirmPickup}
          disabled={actionLoading}
        >
          <Ionicons name="bicycle-outline" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Confirm Pickup</Text>
        </Pressable>
      );
    }

    if (status === "picked_up" || status === "on_the_way") {
      return (
        <View style={styles.riderHandlingContainer}>
          <Ionicons name="bicycle" size={24} color={COLORS.info} />
          <Text style={styles.riderHandlingText}>
            {status === "picked_up"
              ? "Order has been picked up by the rider"
              : "Rider is on the way to deliver"}
          </Text>
        </View>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Order not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchOrder} />
        }
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={COLORS.title} />
          </Pressable>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Order ID & Status */}
        <View style={styles.idStatusRow}>
          <Text style={styles.orderId}>
            Order #{order.orderNumber || order._id.slice(-6)}
          </Text>
          {renderStatusBadge(order.status)}
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer</Text>
          <View style={styles.customerRow}>
            <Ionicons name="person-outline" size={20} color={COLORS.muted} />
            <Text style={styles.customerName}>
              {order.customer?.firstName} {order.customer?.lastName}
            </Text>
          </View>
          <View style={styles.customerRow}>
            <Ionicons name="call-outline" size={20} color={COLORS.muted} />
            <Text style={styles.customerDetail}>{order.customer?.phone}</Text>
          </View>
          {order.customer?.email && (
            <View style={styles.customerRow}>
              <Ionicons name="mail-outline" size={20} color={COLORS.muted} />
              <Text style={styles.customerDetail}>{order.customer.email}</Text>
            </View>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {order.items?.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.variants && (
                  <Text style={styles.itemVariant}>
                    {item.variants.map((v) => v.name).join(", ")}
                  </Text>
                )}
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemQty}>×{item.quantity}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pricing</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>
              ₹{order.pricing?.subtotal || 0}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={styles.priceValue}>
              ₹{order.pricing?.deliveryFee || 0}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax</Text>
            <Text style={styles.priceValue}>₹{order.pricing?.tax || 0}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>
              ₹{order.pricing?.grandTotal || 0}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            <Text style={styles.addressText}>
              {order.deliveryAddress.street}, {order.deliveryAddress.city},{" "}
              {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
            </Text>
          </View>
        )}

        {/* Rider Info (if assigned) */}
        {order.rider && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rider</Text>
            <View style={styles.customerRow}>
              <Ionicons name="bicycle-outline" size={20} color={COLORS.muted} />
              <Text style={styles.customerName}>
                {order.rider.firstName} {order.rider.lastName}
              </Text>
            </View>
            <View style={styles.customerRow}>
              <Ionicons name="call-outline" size={20} color={COLORS.muted} />
              <Text style={styles.customerDetail}>{order.rider.phone}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>{renderActionButtons()}</View>
      </ScrollView>

      {/* Reject Modal */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Order</Text>
            <Text style={styles.modalSubtitle}>
              Please provide a reason for rejecting this order.
            </Text>
            <TextInput
              style={styles.rejectInput}
              placeholder="Reason (e.g., out of stock)"
              placeholderTextColor={COLORS.muted}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Reject</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Styles remain exactly as you had them – no changes needed.
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.title,
  },
  idStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.title,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.title,
    marginBottom: 10,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.title,
  },
  customerDetail: {
    fontSize: 14,
    color: COLORS.text,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.title,
  },
  itemVariant: {
    fontSize: 12,
    color: COLORS.muted,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemQty: {
    fontSize: 14,
    color: COLORS.muted,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.title,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.muted,
  },
  priceValue: {
    fontSize: 14,
    color: COLORS.title,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.title,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.danger,
  },
  readyButton: {
    backgroundColor: COLORS.primary,
  },
  pickupButton: {
    backgroundColor: COLORS.info,
  },
  finalStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: COLORS.success + "20",
    borderRadius: 14,
  },
  finalStatusText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.success,
  },
  riderHandlingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
  },
  riderHandlingText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.title,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.title,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 16,
  },
  rejectInput: {
    height: 80,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 16,
    textAlignVertical: "top",
    backgroundColor: "#F8FAFC",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancel: {
    backgroundColor: "#F1F5F9",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.title,
  },
  modalConfirm: {
    backgroundColor: COLORS.danger,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
  },
});
