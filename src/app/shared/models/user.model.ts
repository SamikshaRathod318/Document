export interface UserModel {
  userId: number;
  fullName: string;
  email: string;
  roleId?: number | null;
  roleName?: string;
  createdAt?: string;
}


