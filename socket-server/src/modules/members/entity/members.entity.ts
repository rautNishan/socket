import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { DataBaseBaseEntity } from "../../../common/database/base/entities/base.entity";
import { UserEntity } from "../../users/entity/user.entity";
import { RoomEntity } from "../../rooms/entity/room.entity";

export const MembersEntityName = "members";
@Entity({
  name: MembersEntityName,
})
export class MembersEntity extends DataBaseBaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.members)
  @JoinColumn({ name: "user_id" })
  @Index()
  userId: UserEntity;

  @ManyToOne(() => RoomEntity, (room) => room.members)
  @JoinColumn({ name: "room_id" })
  @Index()
  roomId: RoomEntity;
}
