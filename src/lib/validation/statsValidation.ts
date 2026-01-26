export interface StatsData {
  title: string;
  description?: string;
  value: string;
}

export const validateStatsData = (data: Partial<StatsData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.title?.trim()) errors.push("Title is required");
  if (!data.value?.trim()) errors.push("Value is required");
  
  if (data.title && data.title.length > 100) errors.push("Title must be less than 100 characters");
  if (data.description && data.description.length > 500) errors.push("Description must be less than 500 characters");

  return { isValid: errors.length === 0, errors };
};

export const validateUpdateStatsData = (data: Partial<StatsData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (data.title !== undefined && !data.title?.trim()) errors.push("Title cannot be empty");
  if (data.value !== undefined && !data.value?.trim()) errors.push("Value cannot be empty");
  
  if (data.title && data.title.length > 100) errors.push("Title must be less than 100 characters");
  if (data.description && data.description.length > 500) errors.push("Description must be less than 500 characters");

  return { isValid: errors.length === 0, errors };
};