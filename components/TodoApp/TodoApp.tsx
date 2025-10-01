// components/TodoApp/TodoApp.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { randomUUID } from 'expo-crypto';
import * as ScreenOrientation from 'expo-screen-orientation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Todo, FilterType, SortType } from './types';
import { FilterType as FT, SortType as ST } from './types';
import TodoForm from './TodoForm';
import TodoItem from './TodoItem';

const STORAGE_KEY = '@todos';

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>(FT.ALL);
  const [sort, setSort] = useState<SortType>(ST.DATE_ADDED);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isSmallScreen = width < 450;

  // Load data on startup
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedTodos) {
          setTodos(JSON.parse(storedTodos));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Error', 'Failed to load saved tasks');
      }
    };

    const configureOrientation = async () => {
      await ScreenOrientation.unlockAsync();
    };

    loadTodos();
    configureOrientation();

    const subscription = ScreenOrientation.addOrientationChangeListener(() => {});

    return () => {
      subscription.remove();
    };
  }, []);

  // Save data when changes occur
  useEffect(() => {
    const saveTodos = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    saveTodos();
  }, [todos]);

  const handleAddTodo = useCallback((newTodo: Todo) => {
    setTodos(prev => [...prev, newTodo]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              status: !todo.completed ? 'completed' : 'pending'
            }
          : todo
      )
    );
  }, []);

  const updateTodoStatus = useCallback((id: string, status: Todo['status']) => {
    setTodos(prev =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              status,
              completed: status === 'completed'
            }
          : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setTodos(prev => prev.filter(todo => todo.id !== id))
        },
      ]
    );
  }, []);

  const filteredTodos = todos.filter((todo) => {
    switch (filter) {
      case FT.ACTIVE:
        return !todo.completed;
      case FT.COMPLETED:
        return todo.completed;
      case FT.IN_PROGRESS:
        return todo.status === 'in-progress';
      case FT.CANCELLED:
        return todo.status === 'cancelled';
      default:
        return true;
    }
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    switch (sort) {
      case ST.DUE_DATE:
        return new Date(a.dueDate || '9999-12-31').getTime() - new Date(b.dueDate || '9999-12-31').getTime();
      case ST.STATUS:
        return a.status.localeCompare(b.status);
      case ST.DATE_ADDED:
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const remainingTodos = totalTodos - completedTodos;

  // Рендер заголовка
  const renderHeader = useCallback(() => (
    <View style={styles.headerContainer}>
      <Text style={[
        styles.mainTitle,
        isSmallScreen && styles.mainTitleSmall,
        isLandscape && styles.mainTitleLandscape
      ]}>
        Tasks
      </Text>

      {/* Форма добавления задачи */}
      <TodoForm onAddTodo={handleAddTodo} />

      {/* Sorting and filtering */}
      {todos.length > 0 && (
        <View style={styles.controlsContainer}>
          <View style={styles.sortContainer}>
            <Text style={styles.controlLabel}>Sort by:</Text>
            <FlatList
              horizontal
              data={[
                { key: ST.DATE_ADDED, label: 'Date Added' },
                { key: ST.DUE_DATE, label: 'Due Date' },
                { key: ST.STATUS, label: 'Status' }
              ]}
              renderItem={({ item }) => (
                <View 
                  style={[styles.controlButton, sort === item.key && styles.controlButtonActive]}
                  onTouchEnd={() => setSort(item.key as SortType)}
                >
                  <Text style={[styles.controlButtonText, sort === item.key && styles.controlButtonTextActive]}>
                    {item.label}
                  </Text>
                </View>
              )}
              keyExtractor={(item) => item.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            />
          </View>

          <View style={styles.filterContainer}>
            <Text style={styles.controlLabel}>Filter:</Text>
            <FlatList
              horizontal
              data={[
                { key: FT.ALL, label: `All (${totalTodos})` },
                { key: FT.ACTIVE, label: `Active (${remainingTodos})` },
                { key: FT.IN_PROGRESS, label: 'In Progress' },
                { key: FT.COMPLETED, label: `Completed (${completedTodos})` }
              ]}
              renderItem={({ item }) => (
                <View 
                  style={[styles.controlButton, filter === item.key && styles.controlButtonActive]}
                  onTouchEnd={() => setFilter(item.key as FilterType)}
                >
                  <Text style={[styles.controlButtonText, filter === item.key && styles.controlButtonTextActive]}>
                    {item.label}
                  </Text>
                </View>
              )}
              keyExtractor={(item) => item.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            />
          </View>
        </View>
      )}
    </View>
  ), [isSmallScreen, isLandscape, todos.length, sort, filter, totalTodos, remainingTodos, completedTodos, handleAddTodo]);

  // Рендер элемента списка задач
  const renderTodoItem = useCallback(({ item }: { item: Todo }) => (
    <TodoItem 
      item={item}
      onToggle={toggleTodo}
      onUpdateStatus={updateTodoStatus}
      onDelete={deleteTodo}
      onSelect={setSelectedTodo}
      isSmallScreen={isSmallScreen}
    />
  ), [toggleTodo, updateTodoStatus, deleteTodo, isSmallScreen]);

  // Рендер пустого состояния
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {todos.length === 0 
          ? "No tasks yet. Add your first task!" 
          : "No tasks match the current filter"}
      </Text>
    </View>
  ), [todos.length]);

  return (
    <View style={styles.appContainer}>
      <FlatList
        data={sortedTodos}
        renderItem={renderTodoItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.flatListContent,
          isLandscape && styles.flatListContentLandscape,
          sortedTodos.length === 0 && styles.flatListContentEmpty
        ]}
        style={styles.flatList}
        showsVerticalScrollIndicator={true}
      />

      {/* Task details modal */}
      <Modal
        visible={!!selectedTodo}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedTodo(null)}
      >
        {selectedTodo && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Task Details</Text>
              <View 
                style={styles.closeButton}
                onTouchEnd={() => setSelectedTodo(null)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </View>
            </View>
            <FlatList
              data={[selectedTodo]}
              renderItem={({ item }) => (
                <View style={styles.modalContent}>
                  <Text style={styles.detailTitle}>{item.text}</Text>
                  {item.description && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Description:</Text>
                      <Text style={styles.detailText}>{item.description}</Text>
                    </View>
                  )}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#9E9E9E' }]}>
                      <Text style={styles.statusText}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  {item.dueDate && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Due Date:</Text>
                      <Text style={styles.detailText}>
                        {new Date(item.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {item.location && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Location:</Text>
                      <Text style={styles.detailText}>{item.location}</Text>
                    </View>
                  )}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Created:</Text>
                    <Text style={styles.detailText}>
                      {new Date(item.createdAt).toLocaleString('en-US')}
                    </Text>
                  </View>
                </View>
              )}
              keyExtractor={() => 'modal-content'}
              style={styles.modalFlatList}
            />
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  flatListContentLandscape: {
    paddingHorizontal: 10,
  },
  flatListContentEmpty: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  headerContainer: {
    marginBottom: 20,
  },
  mainTitle: {
    color: '#cc9a9a',
    fontSize: 80,
    fontWeight: '200',
    textAlign: 'center',
    marginBottom: 40,
  },
  mainTitleSmall: {
    fontSize: 60,
    marginBottom: 30,
  },
  mainTitleLandscape: {
    fontSize: 50,
    marginBottom: 20,
  },
  controlsContainer: {
    width: '100%',
    maxWidth: 550,
    marginVertical: 16,
    alignSelf: 'center',
  },
  sortContainer: {
    marginBottom: 12,
  },
  filterContainer: {
    marginBottom: 12,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
  },
  controlButtonActive: {
    backgroundColor: '#5dc2af',
  },
  controlButtonText: {
    fontSize: 14,
    color: '#666',
  },
  controlButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  horizontalScrollContent: {
    paddingHorizontal: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  modalFlatList: {
    flex: 1,
  },
  modalContent: {
    padding: 16,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});