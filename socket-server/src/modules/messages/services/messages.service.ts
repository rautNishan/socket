import { DeepPartial, Repository } from "typeorm";
import { DBConnection } from "../../../common/database/connection/database.connection";
import {
  ICreateOptions,
  IFindAllOptions,
  IFindByIdOptions,
  IFindOneOption,
  IOnlyEntityManager,
  IPaginatedData,
  IUpdateOptions,
} from "../../../common/database/interfaces/database.interface";
import * as bcrypt from "bcrypt";
import { HttpException } from "../../../common/exceptions/http.exception";
import { HttpStatusCode } from "../../../common/constants/http.status.code.constant";
import { MessagesRepository } from "../repository/messages.repository";
import { MessagesEntity } from "../entity/messages.entity";
import { MessageCreateDto } from "../dtos/messages.create.dto";
import { RoomRepository } from "../../rooms/repository/room.repository";
import { RoomEntity } from "../../rooms/entity/room.entity";

export class MessagesService {
  private _messagesRepository: MessagesRepository;
  private _roomRepository: RoomRepository;

  private static _messagesInstance: MessagesService;

  private constructor() {
    const _repo: Repository<MessagesEntity> =
      DBConnection.getConnection().getRepository(MessagesEntity);
    this._messagesRepository = new MessagesRepository(_repo);
    const _roomRepo: Repository<RoomEntity> =
      DBConnection.getConnection().getRepository(RoomEntity);

    this._roomRepository = new RoomRepository(_roomRepo);
  }

  public static getInstance(): MessagesService {
    if (!MessagesService._messagesInstance) {
      //If it is static use Class name instead of this keyword
      MessagesService._messagesInstance = new MessagesService();
    }
    return MessagesService._messagesInstance;
  }

  async create(data: MessageCreateDto, options?: ICreateOptions) {
    const existingUser = await this._messagesRepository.getById(data.from);

    if (!existingUser) {
      throw new HttpException(HttpStatusCode.NOT_FOUND, "User not found");
    }

    let existingRoom = await this._roomRepository.getById(data.roomId);

    if (!existingRoom) {
      existingRoom = await this._roomRepository.create({ type: "direct" });
    }

    return await this._messagesRepository.create(
      { from: existingUser, roomId: existingRoom },
      options
    );
  }

  async update(
    data: DeepPartial<MessagesEntity>,
    options?: IUpdateOptions
  ): Promise<MessagesEntity> {
    return await this._messagesRepository.update(data, options);
  }

  async getById(
    id: number,
    options?: IFindByIdOptions<MessagesEntity>
  ): Promise<MessagesEntity | null> {
    return await this._messagesRepository.getById(id, options);
  }

  async getOne(
    options?: IFindOneOption<MessagesEntity>
  ): Promise<MessagesEntity | null> {
    return await this._messagesRepository.getOne(options);
  }

  async getAll(
    options?: IFindAllOptions<MessagesEntity>
  ): Promise<IPaginatedData<MessagesEntity>> {
    return this._messagesRepository.getAll(options);
  }

  async softDelete(
    entity: MessagesEntity,
    options?: IOnlyEntityManager
  ): Promise<MessagesEntity> {
    return await this._messagesRepository.softDelete(entity, options);
  }
  async restore(
    entity: MessagesEntity,
    options?: IOnlyEntityManager
  ): Promise<MessagesEntity> {
    return await this._messagesRepository.restore(entity, options);
  }

  async hardDelete(
    entity: MessagesEntity,
    options?: IOnlyEntityManager
  ): Promise<MessagesEntity> {
    return await this._messagesRepository.hardDelete(entity, options);
  }

  async findOneOrFail(
    options?: IFindOneOption<MessagesEntity>
  ): Promise<MessagesEntity> {
    const data: MessagesEntity | null = await this._messagesRepository.getOne(
      options
    );
    if (!data) {
      throw new HttpException(HttpStatusCode.NOT_FOUND, "User Not Found");
    }
    return data;
  }
}
