import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LogOut, Settings } from 'lucide-react-native';

// Bỏ đi interface vì đây là file .js
export default function Sidebar({
  collapsed,
  // onToggleCollapse, // Có thể không cần trên mobile
  activeNav,
  onNavChange,
  navItems,
  brandIcon: BrandIcon,
  brandName,
  brandSubtitle,
  currentUser,
  onLogout,
}) {
  return (
    // Sử dụng width tĩnh thay vì animation phức tạp
    <View style={[styles.sidebarContainer, collapsed ? styles.sidebarCollapsed : styles.sidebarExpanded]}>
      {/* Phần Logo/Brand */}
      <View style={styles.brandSection}>
        <View style={styles.brandIconContainer}>
          <BrandIcon color="#2d2d2d" size={24} />
        </View>
        {!collapsed && (
          <View style={styles.brandTextContainer}>
            <Text style={styles.brandName} numberOfLines={1}>{brandName}</Text>
            <Text style={styles.brandSubtitle} numberOfLines={1}>{brandSubtitle}</Text>
          </View>
        )}
      </View>

      {/* Phần Navigation */}
      <ScrollView style={styles.navScrollView}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onNavChange(item.id)}
            style={[
              styles.navItem,
              collapsed && styles.navItemCollapsed,
              activeNav === item.id && styles.navItemActive,
            ]}
          >
            <item.icon
              color={activeNav === item.id ? 'white' : '#9ca3af'}
              size={20}
            />
            {!collapsed && (
              <Text
                style={[
                  styles.navItemLabel,
                  activeNav === item.id ? styles.navItemLabelActive : {},
                ]}
              >
                {item.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Phần Profile và Logout */}
      <View style={styles.bottomSection}>
        {onLogout && (
           <TouchableOpacity
            onPress={onLogout}
            style={[styles.logoutButton, collapsed && styles.navItemCollapsed]}
          >
            <LogOut color="white" size={20} />
            {!collapsed && <Text style={styles.logoutButtonText}>Log Out</Text>}
          </TouchableOpacity>
        )}
       
        <View style={styles.divider} />

        <TouchableOpacity style={[styles.profileSection, collapsed && styles.navItemCollapsed]}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                </Text>
            </View>
            {!collapsed && (
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName} numberOfLines={1}>
                        {currentUser?.name || currentUser?.username || "User"}
                    </Text>
                    <Text style={styles.profileRole} numberOfLines={1}>
                        {currentUser?.roleName?.replace(/_/g, " ") || "User"}
                    </Text>
                </View>
            )}
            {!collapsed && <Settings color="#9ca3af" size={20} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarContainer: {
    backgroundColor: '#2d2d2d',
    height: '100%',
    flexDirection: 'column',
  },
  sidebarExpanded: {
    width: 240,
  },
  sidebarCollapsed: {
    width: 80,
    alignItems: 'center',
  },
  brandSection: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    flexShrink: 0,
  },
  brandIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  brandName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  brandSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
  },
  navScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  navItemActive: {
    backgroundColor: '#3d3d3d',
  },
  navItemLabel: {
    color: '#9ca3af',
    marginLeft: 12,
    fontSize: 14,
  },
  navItemLabelActive: {
    color: 'white',
  },
  bottomSection: {
    padding: 16,
    flexShrink: 0,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  logoutButtonText: {
    color: 'white',
    marginLeft: 12,
    fontWeight: '500',
  },
  divider: {
    borderTopWidth: 1,
    borderColor: '#4b5563',
    marginVertical: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3d3d3d',
    padding: 12,
    borderRadius: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
      color: 'white',
      fontWeight: 'bold',
  },
  profileInfo: {
      flex: 1,
      marginLeft: 12,
      marginRight: 8,
  },
  profileName: {
      color: 'white',
      fontSize: 14,
      fontWeight: '500',
  },
  profileRole: {
      color: '#9ca3af',
      fontSize: 12,
  }
});
