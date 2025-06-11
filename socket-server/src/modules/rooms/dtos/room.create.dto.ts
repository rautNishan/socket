import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class RoomCreateDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  type: string;
}
