import { Repository } from "typeorm";
import { BaseRepository } from "../../../common/database/base/repository/base.repository";

import { MembersEntity } from "../entity/members.entity";

export class MembersRepository extends BaseRepository<MembersEntity> {
  constructor(private readonly repo: Repository<MembersEntity>) {
    super(repo);
  }
}
