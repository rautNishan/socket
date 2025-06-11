import { RoomService } from "../services/room.service";
import { RoomCreateDto } from "../dtos/room.create.dto";
import { ICreateOptions } from "../../../common/database/interfaces/database.interface";
import { RequestListQueryDto } from "../../../common/request/dtos/query/request.list.query.dto";

export class RoomController {
  private _roomService: RoomService;

  constructor() {
    this._roomService = RoomService.getInstance();
  }

  async create(data: RoomCreateDto, options?: ICreateOptions) {
    try {
      const createdData = await this._roomService.create(data, options);
      return createdData;
    } catch (error) {
      throw error;
    }
  }

  async getAll(options?: RequestListQueryDto) {
    const data = await this._roomService.getAll({
      options: {
        skip: options?.page,
        take: options?.limit,
        select: ["id", "type"],
      },
      withDeleted: options?.withDeleted,
    });
    return data;
  }
}
