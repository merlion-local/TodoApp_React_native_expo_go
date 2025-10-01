// components/TodoApp/TodoForm.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { z } from 'zod';
import type { Todo } from './types';
import { todoSchema, type TodoFormData } from './validation';

interface TodoFormProps {
  onAddTodo: (todo: Todo) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onAddTodo }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [location, setLocation] = useState('');

  const validateForm = (): boolean => {
    try {
      const formData: TodoFormData = {
        text,
        description: description || undefined,
        dueDate: dueDate || undefined,
        location: location || undefined,
      };
      
      todoSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        Alert.alert('Validation Error', firstError.message);
      } else {
        console.error('Unexpected error:', error);
        Alert.alert('Error', 'An unexpected error occurred');
      }
      return false;
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    let validatedDueDate = undefined;
    if (dueDate.trim()) {
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

    onAddTodo(newTodo);
    resetForm();
  };

  const resetForm = () => {
    setText('');
    setDescription('');
    setDueDate('');
    setLocation('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <View style={styles.containerWrapper}>
        <View style={styles.formContainer}>
          <View 
            style={styles.addButtonFull}
            onTouchEnd={() => setIsAdding(true)}
          >
            <Text style={styles.addButtonFullText}>+ New Task</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.containerWrapper}>
      <View style={styles.formContainer}>
        <View style={styles.addForm}>
          {/* Task title */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Task Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              placeholderTextColor="#999"
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSubmit}
              returnKeyType="done"
            />
          </View>

          {/* Task description */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add description (optional)"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Due date */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Due Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (optional)"
              placeholderTextColor="#999"
              value={dueDate}
              onChangeText={setDueDate}
            />
          </View>

          {/* Location */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter location (optional)"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.formActions}>
            <View 
              style={[styles.button, styles.cancelButton]}
              onTouchEnd={resetForm}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </View>
            <View 
              style={[styles.button, styles.saveButton]}
              onTouchEnd={handleSubmit}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    width: '100%',
    maxWidth: 550,
    alignSelf: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
});

export default TodoForm;