import React from 'react';

import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

export default function SettingRow({
  icon,
  label,
  subtitle,
  onPress,
  switchValue,
  onSwitchChange,
  danger = false,
}) {
  const hasSwitch = typeof switchValue === 'boolean';

  return (
    <Pressable
      disabled={hasSwitch}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && !hasSwitch && styles.pressed,
      ]}
    >
      <View style={[styles.icon, danger && styles.dangerIcon]}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? '#dc2626' : '#ff5a1f'}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, danger && styles.dangerLabel]}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#ddd6d1', true: '#ffc5ac' }}
          thumbColor={switchValue ? '#ff5a1f' : '#ffffff'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#c7c1bd" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 74,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  pressed: {
    backgroundColor: '#fff8f4',
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0e9',
  },
  dangerIcon: {
    backgroundColor: '#fee2e2',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  label: {
    color: '#171717',
    fontSize: 12,
    fontWeight: '900',
  },
  dangerLabel: {
    color: '#dc2626',
  },
  subtitle: {
    marginTop: 4,
    color: '#8f8f98',
    fontSize: 9,
    lineHeight: 13,
  },
});
