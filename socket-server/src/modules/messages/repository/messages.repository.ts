import { Repository } from "typeorm";
import { BaseRepository } from "../../../common/database/base/repository/base.repository";

import { MessagesEntity } from "../entity/messages.entity";

export class MessagesRepository extends BaseRepository<MessagesEntity> {
  constructor(private readonly repo: Repository<MessagesEntity>) {
    super(repo);
  }
}
