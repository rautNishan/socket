import { Repository } from "typeorm";
import { BaseRepository } from "../../../common/database/base/repository/base.repository";

import { RoomEntity } from "../entity/room.entity";

export class RoomRepository extends BaseRepository<RoomEntity> {
  constructor(private readonly repo: Repository<RoomEntity>) {
    super(repo);
  }
}
