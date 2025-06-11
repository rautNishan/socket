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
import { RoomRepository } from "../repository/room.repository";
import { RoomEntity } from "../entity/room.entity";
import { RoomCreateDto } from "../dtos/room.create.dto";

export class RoomService {
  private _roomRepository: RoomRepository;

  private static _roomInstance: RoomService;

  private constructor() {
    const _repo: Repository<RoomEntity> =
      DBConnection.getConnection().getRepository(RoomEntity);
    this._roomRepository = new RoomRepository(_repo);
  }

  public static getInstance(): RoomService {
    if (!RoomService._roomInstance) {
      //If it is static use Class name instead of this keyword
      RoomService._roomInstance = new RoomService();
    }
    return RoomService._roomInstance;
  }

  async create(data: RoomCreateDto, options?: ICreateOptions) {
    return await this._roomRepository.create(data, options);
  }

  async update(
    data: DeepPartial<RoomEntity>,
    options?: IUpdateOptions
  ): Promise<RoomEntity> {
    return await this._roomRepository.update(data, options);
  }

  async getById(
    id: number,
    options?: IFindByIdOptions<RoomEntity>
  ): Promise<RoomEntity | null> {
    return await this._roomRepository.getById(id, options);
  }

  async getOne(
    options?: IFindOneOption<RoomEntity>
  ): Promise<RoomEntity | null> {
    return await this._roomRepository.getOne(options);
  }

  async getAll(
    options?: IFindAllOptions<RoomEntity>
  ): Promise<IPaginatedData<RoomEntity>> {
    return this._roomRepository.getAll(options);
  }

  async softDelete(
    entity: RoomEntity,
    options?: IOnlyEntityManager
  ): Promise<RoomEntity> {
    return await this._roomRepository.softDelete(entity, options);
  }
  async restore(
    entity: RoomEntity,
    options?: IOnlyEntityManager
  ): Promise<RoomEntity> {
    return await this._roomRepository.restore(entity, options);
  }

  async hardDelete(
    entity: RoomEntity,
    options?: IOnlyEntityManager
  ): Promise<RoomEntity> {
    return await this._roomRepository.hardDelete(entity, options);
  }

  async findOneOrFail(
    options?: IFindOneOption<RoomEntity>
  ): Promise<RoomEntity> {
    const data: RoomEntity | null = await this._roomRepository.getOne(options);
    if (!data) {
      throw new HttpException(HttpStatusCode.NOT_FOUND, "User Not Found");
    }
    return data;
  }
}
