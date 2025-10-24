import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Search, Bell, Mail } from "lucide-react-native";

export function DashboardHeader({
  onSearch,
  searchPlaceholder = "Search...",
  showSearch = true,
  showNotifications = true,
  currentPage = "Dashboard",
  searchValue = "",
  isSearching = false,
  searchResults,
}) {

  const handleSearchChange = (value) => {
    onSearch?.(value);
  };

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        {/* Phần Title */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>{currentPage}</Text>
        </View>

        {/* Phần Search và Notifications */}
        <View style={styles.rightSection}>
          {showSearch && (
            <View style={styles.searchContainer}>
              <Search style={styles.searchIcon} color="#9ca3af" size={20} />
              <TextInput
                placeholder={searchPlaceholder}
                value={searchValue}
                onChangeText={handleSearchChange}
                style={styles.searchInput}
                placeholderTextColor="#6b7280"
              />
            </View>
          )}
          
          {showNotifications && (
            <View style={styles.iconsContainer}>
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

      {/* Hiển thị kết quả tìm kiếm */}
      {isSearching && (
        <View style={styles.resultsContainer}>
          <ActivityIndicator size="small" color="#111827" />
          <Text style={styles.searchingText}>Searching...</Text>
        </View>
      )}
      {!isSearching && searchResults && (
        <View style={styles.resultsContainer}>
          {typeof searchResults === "string" ? (
            <Text>{searchResults}</Text>
          ) : (
            searchResults
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleSection: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    position: 'relative',
    justifyContent: 'center',
    width: 150, // Giới hạn chiều rộng cho mobile
  },
  searchIcon: {
    position: 'absolute',
    left: 8,
    zIndex: 1,
  },
  searchInput: {
    width: '100%',
    height: 36,
    paddingLeft: 32,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    color: '#111827',
    fontSize: 14,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    position: 'relative',
    padding: 6,
    marginLeft: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  resultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  searchingText: {
    marginLeft: 8,
    color: '#6b7280',
    fontSize: 14,
  }
});

export default DashboardHeader;