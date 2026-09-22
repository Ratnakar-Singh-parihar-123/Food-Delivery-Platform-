import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

export default function ScreenHeader({
  navigation,
  title,
  subtitle,
  rightIcon,
  onRightPress,
}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => navigation.goBack()} style={styles.button}>
        <Ionicons name="arrow-back" size={21} color="#171717" />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {rightIcon ? (
        <Pressable onPress={onRightPress} style={styles.button}>
          <Ionicons name={rightIcon} size={21} color="#171717" />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee5df',
    backgroundColor: '#ffffff',
  },
  placeholder: {
    width: 42,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  title: {
    color: '#171717',
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 3,
    color: '#8f8f98',
    fontSize: 9.5,
    fontWeight: '600',
  },
});
