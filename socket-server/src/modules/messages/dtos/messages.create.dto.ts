import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class MessageCreateDto {
  @IsNotEmpty()
  @IsNumber()
  from: number;

  @IsNotEmpty()
  @IsNumber()
  roomId: number;

  @IsNotEmpty()
  @IsString()
  message: string;
}
