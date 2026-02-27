/**
 * Validation utilities for form inputs and database operations
 */

export function validateTitle(title: unknown, fieldName: string = "Title"): string {
  const titleStr = (typeof title === 'string' ? title.trim() : '');
  
  if (!titleStr) {
    throw new Error(`${fieldName} is required`);
  }
  if (titleStr.length > 200) {
    throw new Error(`${fieldName} must be under 200 characters`);
  }
  if (titleStr.length < 3) {
    throw new Error(`${fieldName} must be at least 3 characters`);
  }
  
  return titleStr;
}

export function validateDescription(description: unknown, fieldName: string = "Description", maxLength: number = 2000): string {
  const descStr = (typeof description === 'string' ? description.trim() : '');
  
  if (!descStr) {
    throw new Error(`${fieldName} is required`);
  }
  if (descStr.length > maxLength) {
    throw new Error(`${fieldName} must be under ${maxLength} characters`);
  }
  if (descStr.length < 10) {
    throw new Error(`${fieldName} must be at least 10 characters`);
  }
  
  return descStr;
}

export function validatePrice(price: unknown, fieldName: string = "Price"): number {
  let priceNum: number;
  
  if (typeof price === 'string') {
    priceNum = parseFloat(price);
  } else if (typeof price === 'number') {
    priceNum = price;
  } else {
    priceNum = NaN;
  }
  
  if (isNaN(priceNum)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  if (priceNum <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
  if (priceNum > 999999) {
    throw new Error(`${fieldName} cannot exceed 999,999`);
  }
  
  return priceNum;
}

export function validateBudget(budget: unknown): number {
  let budgetNum: number;
  
  if (typeof budget === 'string') {
    budgetNum = parseFloat(budget);
  } else if (typeof budget === 'number') {
    budgetNum = budget;
  } else {
    budgetNum = NaN;
  }
  
  if (isNaN(budgetNum)) {
    throw new Error("Budget must be a valid number");
  }
  if (budgetNum < 0) {
    throw new Error("Budget cannot be negative");
  }
  if (budgetNum > 9999999) {
    throw new Error("Budget cannot exceed 9,999,999");
  }
  
  return budgetNum;
}

export function validateDateRange(startDate: unknown, endDate: unknown): { start: Date; end: Date } {
  const start = new Date(startDate as string);
  const end = new Date(endDate as string);
  
  if (isNaN(start.getTime())) {
    throw new Error("Start date is invalid");
  }
  if (isNaN(end.getTime())) {
    throw new Error("End date is invalid");
  }
  if (start >= end) {
    throw new Error("End date must be after start date");
  }
  
  return { start, end };
}

export function validateEnum<T extends readonly string[]>(value: unknown, validValues: T, fieldName: string = "Field"): T[number] {
  if (!validValues.includes(value as any)) {
    throw new Error(`${fieldName} must be one of: ${validValues.join(", ")}`);
  }
  return value as T[number];
}
