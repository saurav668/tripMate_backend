import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Notification,
} from './entities/notification.entity';
import { NotificationType } from 'src/constant';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    private readonly notificationsGateway:
      NotificationsGateway,
  ) { }

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    referenceId?: string;
    referenceType?: string;
  }) {
    const notification =
      this.notificationsRepository.create({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        referenceId:
          data.referenceId ?? null,
        referenceType:
          data.referenceType ?? null,
      });

    const savedNotification =
      await this.notificationsRepository.save(
        notification,
      );
    console.log(
      'NOTIFICATION SAVED:',
      savedNotification,
    );

    console.log(
      'SENDING NOTIFICATION TO USER:',
      data.userId,
    );

    this.notificationsGateway.sendNotification(
      data.userId,
      savedNotification,
    );
    console.log(
      'NOTIFICATION SENT TO GATEWAY',
    );

    return savedNotification;
  }

  async getUserNotifications(userId: string) {
    return this.notificationsRepository.find({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getUnreadNotifications(userId: string) {
    return this.notificationsRepository.find({
      where: {
        userId,
        isRead: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getUnreadCount(userId: string) {
    return this.notificationsRepository.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ) {
    const notification =
      await this.notificationsRepository.findOne({
        where: {
          id: notificationId,
          userId,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        'Notification not found',
      );
    }

    notification.isRead = true;

    return this.notificationsRepository.save(
      notification,
    );
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepository.update(
      {
        userId,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    return {
      message: 'All notifications marked as read',
    };
  }
}