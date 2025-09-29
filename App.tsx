import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import TodoApp from './components/TodoApp/TodoApp';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <TodoApp />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});