import { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Search, Bell, Mail } from "lucide-react-native"; // Dùng phiên bản cho mobile

// Bỏ đi interface vì đây là file .js
export function DashboardHeader({
  onSearch,
  searchPlaceholder = "Search...",
  showSearch = true,
  showNotifications = true,
  currentPage = "Dashboard",
  searchValue = "",
  isSearching = false,
  searchResults, // Prop này có thể cần xử lý khác trên mobile
}) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchValue);

  const handleSearchChange = (value) => {
    setLocalSearchQuery(value);
    onSearch?.(value);
  };

  // ❌ Framer Motion không hoạt động trên React Native.
  // Thay thế bằng <TouchableOpacity> để có hiệu ứng nhấn cơ bản.

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        {/* Phần Title hoặc Search */}
        <View style={styles.leftSection}>
          {showSearch ? (
            <View style={styles.searchContainer}>
              <Search style={styles.searchIcon} color="#9ca3af" size={20} />
              <TextInput
                placeholder={searchPlaceholder}
                value={searchValue || localSearchQuery}
                onChangeText={handleSearchChange}
                style={styles.searchInput}
                placeholderTextColor="#6b7280"
              />
              {/* Hiển thị kết quả tìm kiếm */}
              {isSearching && (
                <View style={styles.resultsContainer}>
                   <ActivityIndicator size="small" color="#111827" />
                   <Text style={styles.searchingText}>Searching...</Text>
                </View>
              )}
               {!isSearching && searchResults && (
                <View style={styles.resultsContainer}>
                    {searchResults}
                </View>
              )}
            </View>
          ) : (
            <View>
              <Text style={styles.pageTitle}>{currentPage}</Text>
            </View>
          )}
        </View>

        {/* Các nút bên phải */}
        {showNotifications && (
          <View style={styles.rightSection}>
            <TouchableOpacity style={styles.iconButton}>
              <Mail color="#4b5563" size={22} />
              <View style={[styles.notificationDot, { backgroundColor: '#3b82f6' }]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Bell color="#4b5563" size={22} />
              <View style={[styles.notificationDot, { backgroundColor: '#ef4444' }]} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// Đây là cách React Native tạo kiểu, thay thế cho Tailwind CSS
const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16, // px-8 -> 16 (trên mobile thường nhỏ hơn)
    paddingVertical: 12, // py-4 -> 12
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    marginRight: 16,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    width: '100%',
    height: 44, // py-2.5 ~ 44
    paddingLeft: 40, // pl-10
    paddingRight: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12, // rounded-xl
    backgroundColor: '#f9fafb', // bg-gray-50
    color: '#111827', // text-gray-900
    fontSize: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  iconButton: {
    position: 'relative',
    padding: 8,
    marginLeft: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  resultsContainer: {
    position: 'absolute',
    top: '110%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    // Hiệu ứng đổ bóng cho mobile
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchingText: {
    marginLeft: 8,
    color: '#6b7280',
  }
});
