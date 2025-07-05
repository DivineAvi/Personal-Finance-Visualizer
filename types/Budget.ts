import { CategoryType } from "./Categories";

export type BudgetType = {
  id: string;
  categoryId: string;
  amount: number;
  month: number; // 0-11 for Jan-Dec
  year: number;
};

export type BudgetWithCategoryType = BudgetType & {
  category: CategoryType;
};

// Helper function to create a unique ID for a budget
export function createBudgetId(categoryId: string, month: number, year: number): string {
  return `${categoryId}-${month}-${year}`;
}

// Helper function to get month name from month number
export function getMonthName(month: number): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[month];
}

// Helper function to get current month and year
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth(),
    year: now.getFullYear()
  };
} 