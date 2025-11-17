import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import TrackingWidget from "../../components/TrackingWidget";

export default function TrackingTokenScreen() {
    console.log("🎯 TrackingTokenScreen Mounted");

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TrackingWidget />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 80,
  },
});
