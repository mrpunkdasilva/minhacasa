import { UserEntity } from "@/app/domain/entity/user/user.entity";

export const userMock: UserEntity = {
  id: "user-123",
  name: "João Silva",
  email: "joao.silva@example.com",
  password: "hashed_password",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
  houseId: "house-123",
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-01T10:00:00Z"),
};
