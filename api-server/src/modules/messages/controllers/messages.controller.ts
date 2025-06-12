import { ICreateOptions } from "../../../common/database/interfaces/database.interface";
import { RequestListQueryDto } from "../../../common/request/dtos/query/request.list.query.dto";
import { MessageCreateDto } from "../dtos/messages.create.dto";
import { MessagesService } from "../services/messages.service";

export class MessageController {
  private _messageService: MessagesService;

  constructor() {
    this._messageService = MessagesService.getInstance();
  }

  async create(data: MessageCreateDto, options?: ICreateOptions) {
    try {
      const createdData = await this._messageService.create(data, options);
      return createdData;
    } catch (error) {
      throw error;
    }
  }

  async getAll(options?: RequestListQueryDto) {
    const data = await this._messageService.getAll({
      options: {
        skip: options?.page,
        take: options?.limit,
        select: ["id"],
      },
      withDeleted: options?.withDeleted,
    });
    return data;
  }
}
