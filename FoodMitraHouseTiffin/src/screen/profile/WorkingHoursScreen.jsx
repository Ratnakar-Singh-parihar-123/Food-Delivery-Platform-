// screens/partner/WorkingHoursScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/colors';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const WorkingHoursScreen = ({ navigation }) => {
  const [workType, setWorkType] = useState('full'); // 'full' or 'part'
  const [hours, setHours] = useState(
    DAYS.reduce(
      (acc, day) => ({
        ...acc,
        [day]: { open: true, start: '9:00 AM', end: '6:00 PM' },
      }),
      {},
    ),
  );
  const [partTimeHours, setPartTimeHours] = useState('4 hours');

  const handleSave = () => {
    Alert.alert('Success', 'Working hours updated!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle}>Working Hours</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Work Type</Text>
          <View style={styles.workTypeRow}>
            <Pressable
              style={[
                styles.workTypeBtn,
                workType === 'full' && styles.workTypeActive,
              ]}
              onPress={() => setWorkType('full')}
            >
              <Text
                style={[
                  styles.workTypeText,
                  workType === 'full' && styles.workTypeTextActive,
                ]}
              >
                Full-time
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.workTypeBtn,
                workType === 'part' && styles.workTypeActive,
              ]}
              onPress={() => setWorkType('part')}
            >
              <Text
                style={[
                  styles.workTypeText,
                  workType === 'part' && styles.workTypeTextActive,
                ]}
              >
                Part-time
              </Text>
            </Pressable>
          </View>

          {workType === 'part' && (
            <View style={styles.field}>
              <Text style={styles.label}>Daily Hours</Text>
              <Text style={styles.valueText}>{partTimeHours}</Text>
            </View>
          )}

          <Text style={[styles.cardTitle, { marginTop: 16 }]}>
            Weekly Schedule
          </Text>
          {DAYS.map(day => (
            <View key={day} style={styles.dayRow}>
              <Text style={styles.dayLabel}>{day}</Text>
              <View style={styles.dayToggle}>
                <Switch
                  trackColor={{ false: '#e5e7eb', true: COLORS.primary }}
                  thumbColor={hours[day].open ? COLORS.white : '#f4f3f4'}
                  onValueChange={() =>
                    setHours({
                      ...hours,
                      [day]: { ...hours[day], open: !hours[day].open },
                    })
                  }
                  value={hours[day].open}
                />
              </View>
              {hours[day].open && workType === 'full' && (
                <View style={styles.timeInputs}>
                  <Text style={styles.timeText}>{hours[day].start}</Text>
                  <Text style={styles.timeSeparator}>–</Text>
                  <Text style={styles.timeText}>{hours[day].end}</Text>
                </View>
              )}
            </View>
          ))}

          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save Hours</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.title },
  container: { flex: 1, paddingHorizontal: 16 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 10,
  },
  workTypeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  workTypeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0ece8',
  },
  workTypeActive: { backgroundColor: COLORS.primary },
  workTypeText: { color: COLORS.text, fontWeight: '600' },
  workTypeTextActive: { color: COLORS.white },
  field: { marginBottom: 12 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  valueText: { fontSize: 14, color: COLORS.text },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  dayLabel: { flex: 1, fontSize: 14, color: COLORS.text },
  dayToggle: { marginRight: 10 },
  timeInputs: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 13, color: COLORS.muted },
  timeSeparator: { fontSize: 13, color: COLORS.muted },
  saveBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});

export default WorkingHoursScreen;
