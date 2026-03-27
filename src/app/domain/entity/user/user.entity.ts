import { BaseEntity } from "../base.entity";

export interface UserEntity extends BaseEntity {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
}
