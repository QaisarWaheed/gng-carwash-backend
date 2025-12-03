import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { JwtAuthGuard } from '../../guards/authGuart';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get('/user/:userId')
  async findAll(@Param('userId') userId: string) {
    return this.notificationsService.findAll(userId);
  }

  @Get('/user/:userId/unread')
  async findUnread(@Param('userId') userId: string) {
    return this.notificationsService.findUnread(userId);
  }

  @Get('/user/:userId/unread-count')
  async getUnreadCount(@Param('userId') userId: string) {
    return {
      count: await this.notificationsService.getUnreadCount(userId),
    };
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch('/:id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('/user/:userId/read-all')
  async markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.notificationsService.delete(id);
  }

  @Delete('/user/:userId')
  async deleteAll(@Param('userId') userId: string) {
    return this.notificationsService.deleteAll(userId);
  }
}
