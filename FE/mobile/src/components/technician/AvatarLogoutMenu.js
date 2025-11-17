import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return "?";
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const AvatarLogoutMenu = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("Technician");
  const [userRole, setUserRole] = useState("Technician"); // Thêm state cho role
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const avatarRef = useRef(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const name = await AsyncStorage.getItem('staffName');
        const role = await AsyncStorage.getItem('userRole');
        
        if (name) {
          setUserName(name);
        }
        if (role) {
          const formattedRole = role.replace("service_center_", "").replace("_", " ");
          setUserRole(formattedRole);
        }
      } catch (e) {
        console.error("Failed to fetch user info from storage", e);
      }
    };
    fetchUserInfo();
  }, []);

  const openMenu = () => {
    avatarRef.current.measure((fx, fy, width, height, px, py) => {
      setMenuPosition({ top: py + height + 5, right: 16 });
      setMenuVisible(true);
    });
  };

  const onLogoutPress = () => {
    setMenuVisible(false);
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              navigation.replace("Login");
            } catch (err) {
              console.error("Logout failed:", err);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuContainer, menuPosition]}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuUserName} numberOfLines={1}>
                {userName}
              </Text>
              <Text style={styles.menuUserRole} numberOfLines={1}>
                {userRole}
              </Text>
            </View>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuButton} onPress={onLogoutPress}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.menuButtonText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <TouchableOpacity
        ref={avatarRef}
        onPress={openMenu}
        style={styles.avatarButton}
      >
        <Text style={styles.avatarText}>{getInitials(userName)}</Text>
      </TouchableOpacity>
    </>
  );
};

// --- Styles cho component ---
const styles = StyleSheet.create({
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E40AF",
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  menuContainer: {
    position: "absolute",
    width: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    overflow: "hidden",
  },
  menuHeader: {
    padding: 12,
    backgroundColor: "#F9FAFB",
  },
  menuUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  menuUserRole: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: 'capitalize', 
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  menuButtonText: {
    fontSize: 16,
    color: "#EF4444",
    marginLeft: 10,
  },
});

export default AvatarLogoutMenu;