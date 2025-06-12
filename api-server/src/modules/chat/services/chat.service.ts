import { Repository } from "typeorm";
import { MembersRepository } from "../../members/repository/members.repository";
import { MessagesEntity } from "../../messages/entity/messages.entity";
import { MessagesRepository } from "../../messages/repository/messages.repository";
import { RoomRepository } from "../../rooms/repository/room.repository";
import { UserRepository } from "../../users/repository/user.repository";
import { DBConnection } from "../../../common/database/connection/database.connection";
import { RoomEntity } from "../../rooms/entity/room.entity";
import { UserEntity } from "../../users/entity/user.entity";
import { MembersEntity } from "../../members/entity/members.entity";
import { HttpException } from "../../../common/exceptions/http.exception";
import { HttpStatusCode } from "../../../common/constants/http.status.code.constant";

export class ChatService {
  private readonly _roomRepo: RoomRepository;
  private readonly _messageRepo: MessagesRepository;
  private readonly _membersRepo: MembersRepository;
  private readonly _userRepo: UserRepository;
  private static _chatInstance: ChatService;
  constructor() {
    const messageRepository: Repository<MessagesEntity> =
      DBConnection.getConnection().getRepository(MessagesEntity);
    this._messageRepo = new MessagesRepository(messageRepository);
    const roomRepository: Repository<RoomEntity> =
      DBConnection.getConnection().getRepository(RoomEntity);
    this._roomRepo = new RoomRepository(roomRepository);
    const userRepository: Repository<UserEntity> =
      DBConnection.getConnection().getRepository(UserEntity);
    this._userRepo = new UserRepository(userRepository);
    const memberRepository: Repository<MembersEntity> =
      DBConnection.getConnection().getRepository(MembersEntity);
    this._membersRepo = new MembersRepository(memberRepository);
  }

  public static getInstance(): ChatService {
    if (!ChatService._chatInstance) {
      //If it is static use Class name instead of this keyword
      ChatService._chatInstance = new ChatService();
    }
    return ChatService._chatInstance;
  }

  //This function will return room
  async startConversation(data: { senderId: number; receverId: number }) {
    const existingRoom = await this._roomRepo
      .createQueryBuilder("room")
      .innerJoin("room.members", "member1", "member1.userId = :senderId", {
        senderId: data.senderId,
      })
      .innerJoin("room.members", "member2", "member2.userId = :receverId", {
        receverId: data.receverId,
      })
      .getOne();

    if (existingRoom) {
      return existingRoom;
    }

    const existingSender = await this._userRepo.getById(data.senderId);
    if (!existingSender) {
      throw new HttpException(HttpStatusCode.NOT_FOUND, "User not found");
    }

    const existingReciver = await this._userRepo.getById(data.receverId);
    if (!existingReciver) {
      throw new HttpException(HttpStatusCode.NOT_FOUND, "User not found");
    }

    const createdRoom = await this._roomRepo.create({ type: "direct" });
    const members: MembersEntity[] = [];

    const member1 = new MembersEntity();
    member1.userId = existingSender;
    member1.roomId = createdRoom;

    const member2 = new MembersEntity();
    member2.userId = existingReciver;
    member2.roomId = createdRoom;

    members.push(member1);
    members.push(member2);

    await this._membersRepo.bulkCreate(members);

    return createdRoom;
  }

  async sendMessage(data: {
    message: string;
    roomId: number;
    senderId: number;
  }) {
    const existingUser = await this._userRepo.getById(data.senderId);
    if (!existingUser) {
      throw new HttpException(HttpStatusCode.NOT_FOUND, "User not found");
    }
    const existingRoom = await this._roomRepo.getById(data.roomId);

    if (!existingRoom) {
      throw new HttpException(HttpStatusCode.NOT_FOUND, "Room not Found");
    }

    const userMemberToRoom = await this._membersRepo
      .createQueryBuilder("member")
      .where("member.roomId = :roomId", { roomId: data.roomId })
      .andWhere("member.userId = :userId", { userId: data.senderId })
      .getOne();

    if (!userMemberToRoom) {
      throw new HttpException(
        HttpStatusCode.BAD_REQUEST,
        "User doesnot belongs to room"
      );
    }

    return await this._messageRepo.create({
      message: data.message,
      from: existingUser,
      roomId: existingRoom,
    });
  }

  async getAllMessages(data: { userId: number }) {
    const messages = await this._roomRepo
      .createQueryBuilder("room")
        .innerJoin("room.members", "member", "member.userId = :userId", {
          userId: data.userId,
        })
      .leftJoinAndSelect("room.messages", "messages")
      .leftJoinAndSelect("messages.from", "sender")
      .leftJoinAndSelect("room.members", "members")
      .leftJoinAndSelect("members.userId", "memberUser")
      .getMany();
    return messages;
  }
}
