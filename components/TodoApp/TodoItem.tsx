// components/TodoApp/TodoItem.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Todo } from './types';

interface TodoItemProps {
  item: Todo;
  onToggle: (id: string) => void;
  onUpdateStatus: (id: string, status: Todo['status']) => void;
  onDelete: (id: string) => void;
  onSelect: (todo: Todo) => void;
  isSmallScreen: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({ 
  item, 
  onToggle, 
  onUpdateStatus, 
  onDelete, 
  onSelect,
  isSmallScreen 
}) => {
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

  const formatDueDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      let date = new Date(dateString);
      if (isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      }
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <View style={[styles.todoItem, isSmallScreen && styles.todoItemSmall]}>
      <View style={styles.todoHeader}>
        <View style={styles.todoMainContent}>
          <Text style={[styles.todoText, item.completed && styles.todoTextCompleted]}>
            {item.text}
          </Text>
          {item.dueDate && (
            <Text style={styles.todoMeta}>
              Due: {formatDueDate(item.dueDate)}
            </Text>
          )}
          {item.location && (
            <Text style={styles.todoMeta}>
              📍 {item.location}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <View style={styles.todoActions}>
        <View style={styles.actionRow}>
          <View style={styles.checkboxContainer}>
            <Text style={styles.checkboxLabel}>Complete:</Text>
            <View 
              style={[styles.checkbox, item.completed && styles.checkboxCompleted]}
              onTouchEnd={() => onToggle(item.id)}
            >
              <Text style={[styles.checkmark, item.completed && styles.checkmarkCompleted]}>
                ✓
              </Text>
            </View>
          </View>
          <View style={styles.statusButtons}>
            <Text style={styles.actionLabel}>Set Status:</Text>
            <View style={styles.statusButtonsRow}>
              <View 
                style={styles.actionButton}
                onTouchEnd={() => onUpdateStatus(item.id, 'in-progress')}
              >
                <Text style={styles.actionButtonText}>In Progress</Text>
              </View>
              <View 
                style={styles.actionButton}
                onTouchEnd={() => onUpdateStatus(item.id, 'completed')}
              >
                <Text style={styles.actionButtonText}>Complete</Text>
              </View>
              <View 
                style={styles.actionButton}
                onTouchEnd={() => onUpdateStatus(item.id, 'cancelled')}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.bottomActions}>
          <View 
            style={[styles.actionButton, styles.detailsButton]}
            onTouchEnd={() => onSelect(item)}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
          </View>
          <View 
            style={[styles.actionButton, styles.deleteButton]}
            onTouchEnd={() => onDelete(item.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  todoItem: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  todoItemSmall: {
    padding: 12,
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  todoMainContent: {
    flex: 1,
  },
  todoText: {
    color: '#4d4d4d',
    fontSize: 18,
    fontWeight: '300',
    marginBottom: 4,
  },
  todoTextCompleted: {
    color: '#d9d9d9',
    textDecorationLine: 'line-through',
  },
  todoMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  todoActions: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6e6e6',
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkmarkCompleted: {
    color: 'white',
  },
  statusButtons: {
    alignItems: 'flex-end',
  },
  actionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'right',
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },
  actionButtonText: {
    fontSize: 10,
    color: '#666',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    backgroundColor: '#e3f2fd',
  },
  detailsButtonText: {
    color: '#1976d2',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 12,
  },
});

export default TodoItem;