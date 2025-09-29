// components/TodoApp/TodoApp.tsx
import React, { useState } from 'react';
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
  useWindowDimensions
} from 'react-native';
import { randomUUID } from 'expo-crypto';
import * as ScreenOrientation from 'expo-screen-orientation';

import type { Todo } from './types';
import { FilterType } from './types';

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [newTodoText, setNewTodoText] = useState<string>('');
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isSmallScreen = width < 450;

  React.useEffect(() => {
    const configureOrientation = async () => {
      await ScreenOrientation.unlockAsync();
    };
    configureOrientation();
  }, []);

  const addTodo = () => {
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: randomUUID(),
        text: newTodoText.trim(),
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setNewTodoText('');
      Keyboard.dismiss();
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo: Todo) => !todo.completed));
  };

  const filteredTodos = todos.filter((todo) => {
    switch (filter) {
      case FilterType.ACTIVE:
        return !todo.completed;
      case FilterType.COMPLETED:
        return todo.completed;
      default:
        return true;
    }
  });

  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo: Todo) => todo.completed).length;
  const remainingTodos = totalTodos - completedTodos;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.page, isLandscape && styles.pageLandscape]}>
          <Text style={[
            styles.mainTitle, 
            isSmallScreen && styles.mainTitleSmall,
            isLandscape && styles.mainTitleLandscape
          ]}>
            todos
          </Text>
          
          {/* Контейнер с эффектом многослойности */}
          <View style={styles.containerWrapper}>
            {/* Первая тень (самый нижний слой) */}
            <View style={[styles.shadowLayer, styles.shadowFirst]} />
            
            {/* Вторая тень (средний слой) */}
            <View style={[styles.shadowLayer, styles.shadowSecond]} />
            
            {/* Основной контейнер */}
            <View style={[
              styles.container, 
              isSmallScreen && styles.containerSmall,
              isLandscape && styles.containerLandscape
            ]}>
              <View style={styles.inputRow}>
                <TouchableOpacity onPress={toggleCollapse} style={styles.toggleAllButton}>
                  <Text style={[styles.toggleAllText, isCollapsed && styles.toggleAllTextCollapsed]}>
                    ❯
                  </Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, isSmallScreen && styles.inputSmall]}
                  placeholder="What needs to be done?"
                  placeholderTextColor="#e6e6e6"
                  value={newTodoText}
                  onChangeText={setNewTodoText}
                  onSubmitEditing={addTodo}
                  returnKeyType="done"
                />
                {newTodoText.trim() && (
                  <TouchableOpacity onPress={addTodo} style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                  </TouchableOpacity>
                )}
              </View>

              {!isCollapsed && filteredTodos.length > 0 && (
                <ScrollView style={styles.todoList}>
                  {filteredTodos.map((todo: Todo) => (
                    <View key={todo.id} style={[styles.todoItem, isSmallScreen && styles.todoItemSmall]}>
                      <TouchableOpacity
                        style={[styles.checkbox, todo.completed && styles.checkboxCompleted, isSmallScreen && styles.checkboxSmall]}
                        onPress={() => toggleTodo(todo.id)}
                      >
                        <Text style={[styles.checkmark, todo.completed && styles.checkmarkCompleted, isSmallScreen && styles.checkmarkSmall]}>
                          ✓
                        </Text>
                      </TouchableOpacity>
                      <Text style={[styles.todoText, todo.completed && styles.todoTextCompleted, isSmallScreen && styles.todoTextSmall]}>
                        {todo.text}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              {todos.length > 0 && !isCollapsed && (
                <View style={[styles.footer, isSmallScreen && styles.footerSmall]}>
                  <View style={[styles.footerTopRow, isSmallScreen && styles.footerTopRowSmall]}>
                    <Text style={[styles.itemsLeft, isSmallScreen && styles.itemsLeftSmall]}>
                      {remainingTodos} {remainingTodos === 1 ? 'item' : 'items'} left
                    </Text>
                    
                    <TouchableOpacity
                      onPress={clearCompleted}
                      disabled={completedTodos === 0}
                      style={[styles.clearButton, isSmallScreen && styles.clearButtonSmall]}
                    >
                      <Text style={[styles.clearButtonText, completedTodos === 0 && styles.clearButtonDisabled]}>
                        Clear completed
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.filterContainer, isSmallScreen && styles.filterContainerSmall]}>
                    <TouchableOpacity
                      style={[styles.filterButton, filter === FilterType.ALL && styles.filterButtonActive, isSmallScreen && styles.filterButtonSmall]}
                      onPress={() => setFilter(FilterType.ALL)}
                    >
                      <Text style={[styles.filterButtonText, filter === FilterType.ALL && styles.filterButtonTextActive]}>
                        All
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterButton, filter === FilterType.ACTIVE && styles.filterButtonActive, isSmallScreen && styles.filterButtonSmall]}
                      onPress={() => setFilter(FilterType.ACTIVE)}
                    >
                      <Text style={[styles.filterButtonText, filter === FilterType.ACTIVE && styles.filterButtonTextActive]}>
                        Active
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.filterButton, filter === FilterType.COMPLETED && styles.filterButtonActive, isSmallScreen && styles.filterButtonSmall]}
                      onPress={() => setFilter(FilterType.COMPLETED)}
                    >
                      <Text style={[styles.filterButtonText, filter === FilterType.COMPLETED && styles.filterButtonTextActive]}>
                        Completed
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  page: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  pageLandscape: {
    paddingTop: 30,
    paddingHorizontal: 10,
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
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  shadowFirst: {
    bottom: -6,
    left: 4,
    right: 4,
    height: 10,
    zIndex: -1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shadowSecond: {
    bottom: -12,
    left: 8,
    right: 8,
    height: 15,
    zIndex: -2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  container: {
    backgroundColor: 'white',
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  containerSmall: {
    maxWidth: '100%',
  },
  containerLandscape: {
    maxWidth: 600,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
    position: 'relative',
    zIndex: 10,
  },
  toggleAllButton: {
    width: 30,
    height: 30,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleAllText: {
    fontSize: 22,
    color: '#e6e6e6',
    transform: [{ rotate: '90deg' }],
  },
  toggleAllTextCollapsed: {
    transform: [{ rotate: '0deg' }],
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 24,
    fontWeight: '300',
    color: '#4d4d4d',
    borderWidth: 0,
  },
  inputSmall: {
    fontSize: 18,
    padding: 12,
  },
  addButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#5dc2af',
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  todoList: {
    maxHeight: 400,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ededed',
    backgroundColor: '#fff',
    position: 'relative',
  },
  todoItemSmall: {
    padding: 12,
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
  checkboxSmall: {
    width: 25,
    height: 25,
    marginRight: 8,
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
  checkmarkSmall: {
    fontSize: 16,
  },
  checkmarkCompleted: {
    color: 'white',
  },
  todoText: {
    flex: 1,
    color: '#4d4d4d',
    fontSize: 24,
    fontWeight: '300',
  },
  todoTextSmall: {
    fontSize: 18,
  },
  todoTextCompleted: {
    color: '#d9d9d9',
    textDecorationLine: 'line-through',
  },
  footer: {
    padding: 12,
    backgroundColor: '#fff',
    position: 'relative',
    zIndex: 5,
    minHeight: 50,
  },
  footerSmall: {
    padding: 16,
  },
  footerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerTopRowSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsLeft: {
    color: '#777',
    fontSize: 14,
    fontWeight: '300',
    flex: 1,
  },
  itemsLeftSmall: {
    fontSize: 13,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  filterContainerSmall: {
    gap: 6,
  },
  filterButton: {
    padding: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  filterButtonSmall: {
    padding: 4,
    minWidth: 40,
  },
  filterButtonActive: {
    borderColor: 'rgba(175, 47, 47, 0.3)',
  },
  filterButtonText: {
    color: '#777',
    fontSize: 14,
    fontWeight: '300',
  },
  filterButtonTextActive: {
    color: '#6c6c6c',
  },
  clearButton: {
    padding: 6,
  },
  clearButtonSmall: {
    padding: 4,
  },
  clearButtonText: {
    color: '#777',
    fontSize: 14,
    fontWeight: '300',
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
});