import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigation = useNavigation();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a bus number to search');
      return;
    }

    setIsSearching(true);
    try {
      const resp = await fetch(
        `https://transport-3d8k.onrender.com/api/buses?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await resp.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('Network error', e.message);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Buses</Text>
        <Text style={styles.subtitle}>Find bus routes and schedules</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter a Bus Number (e.g.,BUS001)"
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="characters"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Text style={styles.clearButton}>×</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isSearching}
        >
          <Text style={styles.searchButtonText}>
            {isSearching ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {isSearching && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

        {!isSearching && searchResults.length > 0 ? (
          <>
            <Text style={styles.resultsTitle}>
              Search Results ({searchResults.length})
            </Text>
            {searchResults.map((bus) => (
              <View key={bus.id} style={styles.busCard}>
                <View style={styles.busHeader}>
                  <View style={styles.busInfo}>
                    <Text style={styles.busId}>{bus.id}</Text>
                    <Text style={styles.busRoute}>{bus.route}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      bus.status === 'On Time' ? styles.statusOnTime : styles.statusDelayed,
                    ]}
                  >
                    <Text
                      style={
                        bus.status === 'On Time'
                          ? styles.statusTextOnTime
                          : styles.statusTextDelayed
                      }
                    >
                      {bus.status ?? 'Unknown'}
                    </Text>
                  </View>
                </View>

                <View style={styles.busDetails}>
                  <View style={styles.detailRow}>
                    <Feather name="map-pin" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>
                      Current: {bus.currentLocation ?? '---'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Feather name="users" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Capacity: {bus.capacity ?? '---'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Feather name="user" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>Driver: {bus.driver ?? '---'}</Text>
                  </View>
                </View>

                <View style={styles.routeSection}>
                  <Text style={styles.routeTitle}>Route Stops:</Text>
                  <View style={styles.stopsContainer}>
                    {Array.isArray(bus.stops) &&
                      bus.stops.map((stop, index) => (
                        <View key={index} style={styles.stopItem}>
                          <View
                            style={
                              stop === bus.currentLocation
                                ? styles.currentStopDot
                                : styles.stopDot
                            }
                          />
                          <Text
                            style={
                              stop === bus.currentLocation
                                ? styles.currentStopText
                                : styles.stopText
                            }
                          >
                            {stop}
                          </Text>
                          <Text style={styles.stopTime}>{bus.schedule?.[index] ?? '--:--'}</Text>
                        </View>
                      ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() =>
                    navigation.navigate('RouteDetail', {
                      userType: 'student',
                      busId: bus.id,
                    })
                  }
                >
                  <Feather name="map" size={16} color="#FFFFFF" />
                  <Text style={styles.trackButtonText}>Track Live</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : !isSearching && searchQuery.length > 0 ? (
          <View style={styles.noResults}>
            <Feather name="alert-triangle" size={48} color="#9CA3AF" />
            <Text style={styles.noResultsText}>No buses found</Text>
            <Text style={styles.noResultsSubtext}>
              Try searching with a different bus number
            </Text>
          </View>
        ) : (
          <View style={styles.searchPrompt}>
            <Feather name="search" size={48} color="#9CA3AF" />
            <Text style={styles.promptText}>Search for buses</Text>
            <Text style={styles.promptSubtext}>
              Enter a bus number to see routes and schedules
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: { fontSize: 24, fontFamily: 'Inter-Bold', color: '#1F2937', marginBottom: 4 },
  subtitle: { fontSize: 16, fontFamily: 'Inter-Regular', color: '#6B7280' },
  searchContainer: { padding: 20, backgroundColor: '#FFFFFF' },
  searchInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12,
    paddingHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB'
  },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, fontSize: 16, fontFamily: 'Inter-Regular', color: '#1F2937' },
  clearButton: { fontSize: 24, color: '#9CA3AF', paddingHorizontal: 8 },
  searchButton: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  searchButtonText: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#FFFFFF' },
  resultsContainer: { flex: 1, padding: 20 },
  resultsTitle: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#1F2937', marginBottom: 16 },
  busCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  busHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  busInfo: { flex: 1 },
  busId: { fontSize: 18, fontFamily: 'Inter-Bold', color: '#1F2937' },
  busRoute: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6B7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusOnTime: { backgroundColor: '#D1FAE5' },
  statusDelayed: { backgroundColor: '#FEE2E2' },
  statusTextOnTime: { fontSize: 12, fontFamily: 'Inter-SemiBold', color: '#059669' },
  statusTextDelayed: { fontSize: 12, fontFamily: 'Inter-SemiBold', color: '#DC2626' },
  busDetails: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#6B7280', marginLeft: 8 },
  routeSection: { marginBottom: 16 },
  routeTitle: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#1F2937', marginBottom: 12 },
  stopsContainer: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16 },
  stopItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stopDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB', marginRight: 12 },
  currentStopDot: { backgroundColor: '#2563EB', width: 12, height: 12, borderRadius: 6 },
  stopText: { flex: 1, fontSize: 14, fontFamily: 'Inter-Regular', color: '#6B7280' },
  currentStopText: { fontFamily: 'Inter-SemiBold', color: '#2563EB' },
  stopTime: { fontSize: 12, fontFamily: 'Inter-Regular', color: '#9CA3AF' },
  trackButton: { backgroundColor: '#059669', borderRadius: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  trackButtonText: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#FFFFFF', marginLeft: 8 },
  noResults: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  noResultsText: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#6B7280', marginTop: 16 },
  noResultsSubtext: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#9CA3AF', marginTop: 8 },
  searchPrompt: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  promptText: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: '#6B7280', marginTop: 16 },
  promptSubtext: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
});

