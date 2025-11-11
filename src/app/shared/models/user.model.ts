export interface UserModel {
  userId: number;
  fullName: string;
  email: string;
  roleId?: number | null;
  roleName?: string;
  departmentId?: number | null;
  departmentName?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  roleId: number;
  departmentId?: number;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  roleId?: number;
  departmentId?: number;
  isActive?: boolean;
}

export interface Role {
  roleId: number;
  roleName: string;
  description?: string;
}

export interface Department {
  departmentId: number;
  departmentName: string;
  description?: string;
}


