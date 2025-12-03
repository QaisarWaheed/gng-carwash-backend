import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
