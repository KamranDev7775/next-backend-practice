export interface TeamData {
  name: string;
  email: string;
  phonenumber: string;
  description: string;
  currentsalary: number;
  cnic: string;
  address: string;
  status?: "ENABLE" | "DISABLE";
  image?: string;
  uploaddocument?: string;
}

export const validateTeamData = (data: Partial<TeamData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name?.trim()) errors.push("Name is required");
  if (!data.email?.trim()) errors.push("Email is required");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push("Invalid email format");
  
  if (!data.phonenumber?.trim()) errors.push("Phone number is required");
  else if (!/^\+?[\d\s-()]{10,}$/.test(data.phonenumber)) errors.push("Invalid phone number format");
  
  if (!data.description?.trim()) errors.push("Description is required");
  
  if (data.currentsalary === undefined || data.currentsalary === null) errors.push("Current salary is required");
  else if (data.currentsalary < 0) errors.push("Salary must be positive");
  
  if (!data.cnic?.trim()) errors.push("CNIC is required");
  else if (!/^\d{5}-\d{7}-\d{1}$/.test(data.cnic)) errors.push("CNIC format should be 12345-1234567-1");
  
  if (!data.address?.trim()) errors.push("Address is required");

  return { isValid: errors.length === 0, errors };
};

export const validateUpdateTeamData = (data: Partial<TeamData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (data.name !== undefined && !data.name?.trim()) errors.push("Name cannot be empty");
  if (data.email !== undefined) {
    if (!data.email?.trim()) errors.push("Email cannot be empty");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push("Invalid email format");
  }
  
  if (data.phonenumber !== undefined) {
    if (!data.phonenumber?.trim()) errors.push("Phone number cannot be empty");
    else if (!/^\+?[\d\s-()]{10,}$/.test(data.phonenumber)) errors.push("Invalid phone number format");
  }
  
  if (data.description !== undefined && !data.description?.trim()) errors.push("Description cannot be empty");
  
  if (data.currentsalary !== undefined && data.currentsalary < 0) errors.push("Salary must be positive");
  
  if (data.cnic !== undefined) {
    if (!data.cnic?.trim()) errors.push("CNIC cannot be empty");
    else if (!/^\d{5}-\d{7}-\d{1}$/.test(data.cnic)) errors.push("CNIC format should be 12345-1234567-1");
  }
  
  if (data.address !== undefined && !data.address?.trim()) errors.push("Address cannot be empty");

  return { isValid: errors.length === 0, errors };
};