import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import publicService from "../services/publicService";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

export default function TrackingWidget() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleTrack = async () => {
    if (!token.trim()) {
      setError("Please enter a tracking token.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await publicService.getTrackingInfo(token.trim());
      setTrackingInfo(response.data);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      if (status === 404) {
        setError("Tracking token not found. Please check again.");
      } else {
        setError(msg || "Failed to fetch tracking info.");
      }

      setTrackingInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      CHECKED_IN: "#3B82F6",
      IN_DIAGNOSIS: "#FACC15",
      WAITING_CUSTOMER_APPROVAL: "#FB923C",
      PROCESSING: "#A855F7",
      READY_FOR_PICKUP: "#22C55E",
      COMPLETED: "#9CA3AF",
      CANCELLED: "#EF4444",
    };
    return colors[status] || "#9CA3AF";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "CHECKED_IN":
        return <Feather name="clock" size={20} color="white" />;
      case "IN_DIAGNOSIS":
        return <Feather name="search" size={20} color="white" />;
      case "WAITING_CUSTOMER_APPROVAL":
        return <Feather name="alert-circle" size={20} color="white" />;
      case "PROCESSING":
        return <Feather name="tool" size={20} color="white" />;
      case "READY_FOR_PICKUP":
        return <Feather name="package" size={20} color="white" />;
      case "COMPLETED":
        return <Feather name="check-circle" size={20} color="white" />;
      case "CANCELLED":
        return <Feather name="x-circle" size={20} color="white" />;
      default:
        return <Feather name="info" size={20} color="white" />;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Track Your Vehicle Service</Text>
      <Text style={styles.subtitle}>
        Enter your tracking token to check service status.
      </Text>

      <View style={styles.inputWrapper}>
        <TextInput
          value={token}
          onChangeText={setToken}
          placeholder="Enter tracking token"
          placeholderTextColor="#888"
          style={styles.input}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, !token && styles.buttonDisabled]}
        disabled={!token || loading}
        onPress={handleTrack}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Feather name="search" size={20} color="white" />
            <Text style={styles.buttonText}>Track Now</Text>
          </>
        )}
      </TouchableOpacity>

      {error && (
        <View style={styles.errorBox}>
          <Feather name="x-circle" size={18} color="#F87171" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {trackingInfo && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Record Found</Text>

          <View
            style={[
              styles.statusTag,
              { backgroundColor: getStatusColor(trackingInfo.status) },
            ]}
          >
            {getStatusIcon(trackingInfo.status)}
            <Text style={styles.statusText}>
              {trackingInfo.status.replace(/_/g, " ")}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>VIN:</Text>
            <Text style={styles.infoValue}>{trackingInfo.vin}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Check-in:</Text>
            <Text style={styles.infoValue}>
              {new Date(trackingInfo.checkInDate).toLocaleString()}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Odometer:</Text>
            <Text style={styles.infoValue}>
              {trackingInfo.odometer.toLocaleString()} km
            </Text>
          </View>

          {trackingInfo.mainTechnician && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Technician:</Text>
              <Text style={styles.infoValue}>
                {trackingInfo.mainTechnician.name}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#111827",
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    color: "white",
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#9CA3AF",
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#1F2937",
    padding: 14,
    borderRadius: 10,
    color: "white",
    borderWidth: 1,
    borderColor: "#374151",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    padding: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  errorBox: {
    flexDirection: "row",
    backgroundColor: "#FEE2E2",
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    color: "#DC2626",
  },
  card: {
    marginTop: 20,
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
    gap: 6,
  },
  statusText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
  infoBox: {
    marginBottom: 10,
  },
  infoLabel: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  infoValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
