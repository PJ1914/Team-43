export type Role = "faculty" | "coordinator" | "admin";

export interface AuthUser {
  uid: string;
  email?: string;
  role: Role;
  name: string;
  department: string;
}
