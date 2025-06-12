import { Column, Entity, OneToMany } from "typeorm";
import { DataBaseBaseEntity } from "../../../common/database/base/entities/base.entity";
import { MessagesEntity } from "../../messages/entity/messages.entity";
import { MembersEntity } from "../../members/entity/members.entity";

export const RoomEntityName = "rooms";
@Entity({
  name: RoomEntityName,
})
export class RoomEntity extends DataBaseBaseEntity {
  @Column({
    type: "varchar",
    name: "type",
    nullable: false,
    unique: false,
  })
  type: string;

  @OneToMany(() => MessagesEntity, (message) => message.roomId)
  messages: MessagesEntity[];

  @OneToMany(() => MembersEntity, (member) => member.roomId)
  members: MembersEntity[];
}
