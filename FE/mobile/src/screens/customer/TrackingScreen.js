import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Shield } from "lucide-react-native";

// SERVICE
import trackingService from "../../services/trackingService";

// CARD KẾT QUẢ
import TrackingResultCard from "./TrackingResultCard";

export default function TrackingScreen({ navigation }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState(null);

  const handleTrack = async () => {
    if (!token.trim()) {
      setError("Please enter your tracking token.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await trackingService.getTrackingInfo(token.trim());
      console.log("📌 TRACKING DATA:", res.data);
      setTracking(res.data);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Invalid or expired tracking token.";
      setError(msg);
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0A0E1A", "#0B0F14", "#0B0F14"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {/* LOGIN */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate("Login")}
          >
            <Ionicons name="log-in-outline" size={16} color="#E6EAF2" />
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>

          {/* ICON + TITLE */}
          <View style={styles.titleRow}>
            <Shield size={44} color="#4C90FF" strokeWidth={1.7} />
            <Text style={styles.title}>EV Warranty Tracking</Text>
          </View>

          {/* SUBTITLE */}
          <Text style={styles.subtitle}>
            Check the real-time status of your vehicle service
          </Text>

          {/* SEARCH CARD */}
          <View style={styles.searchCard}>
            <View style={styles.inputRow}>
              <Ionicons name="search-outline" size={20} color="#6B7485" />
              <TextInput
                style={styles.input}
                placeholder="Enter your tracking token"
                placeholderTextColor="#6B7485"
                value={token}
                onChangeText={setToken}
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.trackBtn}
              onPress={handleTrack}
              disabled={loading}
            >
              <LinearGradient
                colors={["#2563EB", "#3B82F6"]}
                style={styles.trackBtnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.trackBtnText}>TRACK NOW</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* FEATURES */}
          <View style={styles.features}>
            <Feature color="#22C55E" text="Real-time Updates" />
            <Feature color="#3B82F6" text="No Login Required" />
            <Feature color="#A855F7" text="24/7 Access" />
          </View>

          {/* RESULT CARD */}
          {tracking && (
            <View style={{ marginTop: 10, marginBottom: 20 }}>
              <TrackingResultCard tracking={tracking} />
            </View>
          )}

          <Text style={styles.footer}>© 2025 EV Warranty Center</Text>
        </ScrollView>

        {/* FLOATING CHAT BUTTON */}
        <TouchableOpacity
          style={styles.chatBubble}
          onPress={() => navigation.navigate("SupportChatScreen")}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const Feature = ({ color, text }) => (
  <View style={styles.featureItem}>
    <View style={[styles.featureDot, { backgroundColor: color }]} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  loginBtn: {
    position: "absolute",
    top: 10,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    zIndex: 10,
  },

  loginBtnText: { color: "#E6EAF2", marginLeft: 6, fontWeight: "600" },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    marginBottom: 10,
  },

  title: {
    color: "#E6EAF2",
    fontSize: 26,
    fontWeight: "700",
    marginLeft: 10,
  },

  subtitle: {
    color: "#9AA7B5",
    fontSize: 14,
    marginBottom: 30,
    textAlign: "center",
  },

  searchCard: {
    width: "92%",
    alignSelf: "center",
    backgroundColor: "#11161C",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1F2833",
    marginBottom: 20,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B0F14",
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#1F2833",
    height: 48,
  },

  input: { flex: 1, color: "#E6EAF2", marginLeft: 8 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },

  errorText: { color: "#EF4444", marginLeft: 6, fontSize: 13 },

  trackBtn: { marginTop: 14 },

  trackBtnGradient: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  trackBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  features: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },

  featureItem: { flexDirection: "row", alignItems: "center", margin: 6 },

  featureDot: {
    width: 7,
    height: 7,
    borderRadius: 50,
    marginRight: 5,
  },

  featureText: { color: "#9AA7B5", fontSize: 12 },

  footer: {
    color: "#6B7485",
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 100,
  },

  chatBubble: {
    position: "absolute",
    bottom: 30,
    right: 25,
    width: 56,
    height: 56,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
});
