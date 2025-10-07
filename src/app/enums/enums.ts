export interface User {
  ID: string;
  Username: string;
  Email: string;
  Role?: string;
}
export interface TokenPayload {
  Token: string;
}
export interface RegResponse {
  message: string;
}

export interface LoginResponse {
  token: TokenPayload;
  user: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  location: string;
  assignedTo?: string;
  reportedBy: string;
  createdAt: Date;
  updatedAt: Date;
  attachments?: string[];
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  location: string;
  reporterContact?: string;
  attachments?: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface EquipmentItem {
  id: number;
  name: string;
  category: string;
  total: number;
  functioning: number;
  inRepair: number;
  replaced: number;
  newlyBought: number;
}

export interface InventoryLog {
  dateLogged: Date;
  loggedBy: string;
  equipment: EquipmentItem[];
  notes: string;
}

