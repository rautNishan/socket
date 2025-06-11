import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { UserEntity } from "../../users/entity/user.entity";
import { RoomEntity } from "../../rooms/entity/room.entity";
import { DataBaseBaseEntity } from "../../../common/database/base/entities/base.entity";

export const MessagesEntityName = "messages";
@Entity({
  name: MessagesEntityName,
})
export class MessagesEntity extends DataBaseBaseEntity {
  @Column({
    type: "text",
    name: "message",
    nullable: true,
    unique: false,
  })
  message: string;

  @ManyToOne(() => UserEntity, (user) => user.messages)
  @JoinColumn({ name: "from" })
  @Index()
  from: UserEntity;

  @ManyToOne(() => RoomEntity, (room) => room.messages)
  @JoinColumn({ name: "room_id" })
  @Index()
  roomId: RoomEntity;
}
