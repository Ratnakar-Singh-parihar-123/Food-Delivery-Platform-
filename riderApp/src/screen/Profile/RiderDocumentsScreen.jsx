import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getRiderDocuments } from '../../api/riderApi';

const { width } = Dimensions.get('window');
const COLORS = {
  primary: '#f25a22',
  background: '#fef9f5',
  white: '#ffffff',
  title: '#1a1a2e',
  text: '#4a4a5a',
  muted: '#8a8a9a',
  border: '#e8e4e0',
  success: '#16a34a',
  danger: '#ef4444',
};

const DOCUMENT_LABELS = {
  aadhaar_front: 'Aadhaar (Front)',
  aadhaar_back: 'Aadhaar (Back)',
  license: 'Driving License',
  vehicle_rc: 'Vehicle RC',
};

export default function RiderDocumentsScreen({ navigation }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await getRiderDocuments();
      setDocuments(res.data.documents || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = status => {
    if (status === 'approved') return COLORS.success;
    if (status === 'rejected') return COLORS.danger;
    return '#f59e0b'; // pending
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.container}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.title} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Text style={styles.pageTitle}>My Documents</Text>

        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={COLORS.border}
            />
            <Text style={styles.emptyText}>No documents uploaded</Text>
          </View>
        ) : (
          documents.map(doc => (
            <View key={doc._id} style={styles.docCard}>
              <View style={styles.docHeader}>
                <Text style={styles.docName}>
                  {DOCUMENT_LABELS[doc.type] || doc.type}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(doc.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(doc.status) },
                    ]}
                  >
                    {doc.status || 'Pending'}
                  </Text>
                </View>
              </View>
              {doc.fileUrl && (
                <Image
                  source={{ uri: doc.fileUrl }}
                  style={styles.docImage}
                  resizeMode="cover"
                />
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  backText: { fontSize: 16, fontWeight: '700', color: COLORS.title },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.title,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  docCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  docName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  docImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});
