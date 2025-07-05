export type CategoryType = {
  id: string;
  name: string;
  color: string;
};

export const CATEGORIES: CategoryType[] = [
  { id: 'groceries', name: 'Groceries', color: '#4CAF50' },
  { id: 'transportation', name: 'Transportation', color: '#2196F3' },
  { id: 'utilities', name: 'Utilities', color: '#FF9800' },
  { id: 'housing', name: 'Housing', color: '#9C27B0' },
  { id: 'entertainment', name: 'Entertainment', color: '#E91E63' },
  { id: 'healthcare', name: 'Healthcare', color: '#00BCD4' },
  { id: 'dining', name: 'Dining', color: '#F44336' },
  { id: 'education', name: 'Education', color: '#3F51B5' },
  { id: 'shopping', name: 'Shopping', color: '#795548' },
  { id: 'travel', name: 'Travel', color: '#607D8B' },
  { id: 'other', name: 'Other', color: '#9E9E9E' }
];

export function getCategoryById(id: string): CategoryType {
  return CATEGORIES.find(category => category.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function getCategoryByName(name: string): CategoryType {
  return CATEGORIES.find(category => category.name === name) || CATEGORIES[CATEGORIES.length - 1];
} 