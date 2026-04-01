import { BaseEntity } from "../base.entity";

export interface HouseEntity extends BaseEntity {
  name: string;
  inviteCode: string; // Permanent code for invitations (e.g. CASA-XY12)
  createdById: string;
}
