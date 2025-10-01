// components/TodoApp/TodoApp.tsx

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Alert,
  Modal
} from 'react-native';
import { randomUUID } from 'expo-crypto';
import * as ScreenOrientation from 'expo-screen-orientation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Todo, FilterType, SortType } from './types';
import { FilterType as FT, SortType as ST } from './types';

const STORAGE_KEY = '@todos';

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>(FT.ALL);
  const [sort, setSort] = useState<SortType>(ST.DATE_ADDED);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  // Form states
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [location, setLocation] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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
  }, []);

  // Save data when changes occur
  useEffect(() => {
    const saveTodos = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      } catch (error) {
        console.error('Error saving data:', error);
        Alert.alert('Error', 'Failed to save tasks');
      }
    };

    saveTodos();
  }, [todos]);

  // Format date function
  const formatDueDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      // Try parsing as ISO string first
      let date = new Date(dateString);
      
      // If invalid, try parsing as YYYY-MM-DD
      if (isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      }
      
      // If still invalid, return original string
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      // Return formatted date
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  const handleSubmit = () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    // Validate due date
    let validatedDueDate = undefined;
    if (dueDate.trim()) {
      // Check if it's in YYYY-MM-DD format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
        Alert.alert('Invalid Date Format', 'Please use YYYY-MM-DD format (e.g., 2024-12-31)');
        return;
      }
      
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        Alert.alert('Invalid Date', 'Please enter a valid date');
        return;
      }
      
      validatedDueDate = dueDate;
    }

    const newTodo: Todo = {
      id: randomUUID(),
      text: text.trim(),
      description: description.trim() || undefined,
      dueDate: validatedDueDate,
      location: location.trim() || undefined,
      status: 'pending',
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos([...todos, newTodo]);
    resetForm();
    Keyboard.dismiss();
  };

  const resetForm = () => {
    setText('');
    setDescription('');
    setDueDate('');
    setLocation('');
    setIsAdding(false);
    setFocusedInput(null);
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              status: !todo.completed ? 'completed' : 'pending'
            }
          : todo
      )
    );
  };

  const updateTodoStatus = (id: string, status: Todo['status']) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              status,
              completed: status === 'completed'
            }
          : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setTodos(todos.filter(todo => todo.id !== id))
        },
      ]
    );
  };

  const clearCompleted = () => {
    Alert.alert(
      'Clear Completed',
      'Delete all completed tasks?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setTodos(todos.filter(todo => !todo.completed))
        },
      ]
    );
  };

  const getStatusColor = (status: Todo['status']) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: Todo['status']) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'cancelled': return 'Cancelled';
      default: return 'Pending';
    }
  };

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.page}>
          {/* Main scrollable content - ОДИН главный скролл для всего */}
          <ScrollView 
            style={styles.mainScrollView}
            contentContainerStyle={[
              styles.scrollContent,
              isLandscape && styles.scrollContentLandscape
            ]}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[
              styles.mainTitle,
              isSmallScreen && styles.mainTitleSmall,
              isLandscape && styles.mainTitleLandscape
            ]}>
              Tasks
            </Text>

            {/* Add new task form */}
            <View style={styles.containerWrapper}>
              <View style={[
                styles.container,
                isSmallScreen && styles.containerSmall,
                isLandscape && styles.containerLandscape
              ]}>
                <TouchableOpacity
                  style={styles.addButtonFull}
                  onPress={() => setIsAdding(true)}
                >
                  <Text style={styles.addButtonFullText}>+ New Task</Text>
                </TouchableOpacity>

                {isAdding && (
                  <View style={styles.addForm}>
                    {/* Task title */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Task Title *</Text>
                      <TextInput
                        style={[
                          styles.input,
                          focusedInput === 'text' && styles.inputFocused
                        ]}
                        placeholder="Enter task title"
                        placeholderTextColor="#999"
                        value={text}
                        onChangeText={setText}
                        onFocus={() => setFocusedInput('text')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>

                    {/* Task description */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Description</Text>
                      <TextInput
                        style={[
                          styles.input,
                          styles.textArea,
                          focusedInput === 'description' && styles.inputFocused
                        ]}
                        placeholder="Add description (optional)"
                        placeholderTextColor="#999"
                        value={description}
                        onChangeText={setDescription}
                        onFocus={() => setFocusedInput('description')}
                        onBlur={() => setFocusedInput(null)}
                        multiline
                        numberOfLines={3}
                      />
                    </View>

                    {/* Due date */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Due Date</Text>
                      <TextInput
                        style={[
                          styles.input,
                          focusedInput === 'dueDate' && styles.inputFocused
                        ]}
                        placeholder="YYYY-MM-DD (optional)"
                        placeholderTextColor="#999"
                        value={dueDate}
                        onChangeText={setDueDate}
                        onFocus={() => setFocusedInput('dueDate')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>

                    {/* Location */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Location</Text>
                      <TextInput
                        style={[
                          styles.input,
                          focusedInput === 'location' && styles.inputFocused
                        ]}
                        placeholder="Enter location (optional)"
                        placeholderTextColor="#999"
                        value={location}
                        onChangeText={setLocation}
                        onFocus={() => setFocusedInput('location')}
                        onBlur={() => setFocusedInput(null)}
                      />
                    </View>

                    <View style={styles.formActions}>
                      <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={resetForm}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.saveButton]}
                        onPress={handleSubmit}
                      >
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Sorting and filtering */}
            {todos.length > 0 && (
              <View style={styles.controlsContainer}>
                <View style={styles.sortContainer}>
                  <Text style={styles.controlLabel}>Sort by:</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollContent}
                  >
                    <TouchableOpacity
                      style={[styles.controlButton, sort === ST.DATE_ADDED && styles.controlButtonActive]}
                      onPress={() => setSort(ST.DATE_ADDED)}
                    >
                      <Text style={[styles.controlButtonText, sort === ST.DATE_ADDED && styles.controlButtonTextActive]}>
                        Date Added
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.controlButton, sort === ST.DUE_DATE && styles.controlButtonActive]}
                      onPress={() => setSort(ST.DUE_DATE)}
                    >
                      <Text style={[styles.controlButtonText, sort === ST.DUE_DATE && styles.controlButtonTextActive]}>
                        Due Date
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.controlButton, sort === ST.STATUS && styles.controlButtonActive]}
                      onPress={() => setSort(ST.STATUS)}
                    >
                      <Text style={[styles.controlButtonText, sort === ST.STATUS && styles.controlButtonTextActive]}>
                        Status
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>

                <View style={styles.filterContainer}>
                  <Text style={styles.controlLabel}>Filter:</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollContent}
                  >
                    <TouchableOpacity
                      style={[styles.controlButton, filter === FT.ALL && styles.controlButtonActive]}
                      onPress={() => setFilter(FT.ALL)}
                    >
                      <Text style={[styles.controlButtonText, filter === FT.ALL && styles.controlButtonTextActive]}>
                        All ({totalTodos})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.controlButton, filter === FT.ACTIVE && styles.controlButtonActive]}
                      onPress={() => setFilter(FT.ACTIVE)}
                    >
                      <Text style={[styles.controlButtonText, filter === FT.ACTIVE && styles.controlButtonTextActive]}>
                        Active ({remainingTodos})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.controlButton, filter === FT.IN_PROGRESS && styles.controlButtonActive]}
                      onPress={() => setFilter(FT.IN_PROGRESS)}
                    >
                      <Text style={[styles.controlButtonText, filter === FT.IN_PROGRESS && styles.controlButtonTextActive]}>
                        In Progress
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.controlButton, filter === FT.COMPLETED && styles.controlButtonActive]}
                      onPress={() => setFilter(FT.COMPLETED)}
                    >
                      <Text style={[styles.controlButtonText, filter === FT.COMPLETED && styles.controlButtonTextActive]}>
                        Completed ({completedTodos})
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Tasks list - БЕЗ вложенного ScrollView */}
            {sortedTodos.length > 0 && (
              <View style={[
                styles.listContainer,
                isLandscape && styles.listContainerLandscape
              ]}>
                {sortedTodos.map((todo: Todo) => (
                  <TouchableOpacity
                    key={todo.id}
                    style={[styles.todoItem, isSmallScreen && styles.todoItemSmall]}
                    onPress={() => setSelectedTodo(todo)}
                  >
                    <View style={styles.todoHeader}>
                      <TouchableOpacity
                        style={[styles.checkbox, todo.completed && styles.checkboxCompleted]}
                        onPress={() => toggleTodo(todo.id)}
                      >
                        <Text style={[styles.checkmark, todo.completed && styles.checkmarkCompleted]}>
                          ✓
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.todoInfo}>
                        <Text style={[styles.todoText, todo.completed && styles.todoTextCompleted]}>
                          {todo.text}
                        </Text>
                        {todo.dueDate && (
                          <Text style={styles.todoMeta}>
                            Due: {formatDueDate(todo.dueDate)}
                          </Text>
                        )}
                        {todo.location && (
                          <Text style={styles.todoMeta}>
                            📍 {todo.location}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(todo.status) }]}>
                        <Text style={styles.statusText}>
                          {getStatusText(todo.status)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.todoActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => updateTodoStatus(todo.id, 'in-progress')}
                      >
                        <Text style={styles.actionButtonText}>In Progress</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => updateTodoStatus(todo.id, 'completed')}
                      >
                        <Text style={styles.actionButtonText}>Complete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => updateTodoStatus(todo.id, 'cancelled')}
                      >
                        <Text style={styles.actionButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => deleteTodo(todo.id)}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Bottom padding to ensure last task is fully visible */}
            <View style={styles.bottomPadding} />
          </ScrollView>

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
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedTodo(null)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalContent}>
                  <Text style={styles.detailTitle}>{selectedTodo.text}</Text>
                  {selectedTodo.description && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Description:</Text>
                      <Text style={styles.detailText}>{selectedTodo.description}</Text>
                    </View>
                  )}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTodo.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(selectedTodo.status)}</Text>
                    </View>
                  </View>
                  {selectedTodo.dueDate && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Due Date:</Text>
                      <Text style={styles.detailText}>
                        {formatDueDate(selectedTodo.dueDate)}
                      </Text>
                    </View>
                  )}
                  {selectedTodo.location && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Location:</Text>
                      <Text style={styles.detailText}>{selectedTodo.location}</Text>
                    </View>
                  )}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Created:</Text>
                    <Text style={styles.detailText}>
                      {new Date(selectedTodo.createdAt).toLocaleString('en-US')}
                    </Text>
                  </View>
                </ScrollView>
              </View>
            )}
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// Updated Styles with proper scroll handling
const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  page: {
    flex: 1,
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    paddingBottom: 40, // Добавляем отступ снизу
  },
  scrollContentLandscape: {
    paddingTop: 30,
    paddingHorizontal: 10,
    paddingBottom: 40,
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
  containerWrapper: {
    width: '100%',
    maxWidth: 550,
    alignSelf: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerSmall: {
    maxWidth: '100%',
  },
  containerLandscape: {
    maxWidth: 600,
  },
  addButtonFull: {
    backgroundColor: '#5dc2af',
    padding: 16,
    alignItems: 'center',
  },
  addButtonFullText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addForm: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: 'white',
  },
  inputFocused: {
    borderColor: '#5dc2af',
    borderWidth: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#5dc2af',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
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
  listContainer: {
    width: '100%',
    maxWidth: 550,
    alignSelf: 'center',
  },
  listContainerLandscape: {
    maxWidth: 600,
    marginBottom: 20,
  },
  todoItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ededed',
    backgroundColor: '#fff',
  },
  todoItemSmall: {
    padding: 12,
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkboxCompleted: {
    borderColor: '#5dc2af',
    backgroundColor: '#5dc2af',
  },
  checkmark: {
    color: 'transparent',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkmarkCompleted: {
    color: 'white',
  },
  todoInfo: {
    flex: 1,
  },
  todoText: {
    color: '#4d4d4d',
    fontSize: 18,
    fontWeight: '300',
  },
  todoTextCompleted: {
    color: '#d9d9d9',
    textDecorationLine: 'line-through',
  },
  todoMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  todoActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#f44336',
  },
  bottomPadding: {
    height: 40, // Дополнительный отступ снизу
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
  modalContent: {
    flex: 1,
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
});