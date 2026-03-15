export interface UserEntity {
  uuid: string;
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
