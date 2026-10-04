import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  NotificationType,
  TripMemberStatus,
} from 'src/constant';

import { TripMember } from '../trip-members/entities/trip-member.entity';
import { NotificationsService } from '../notifications/notifications.service';

import { TripMessage } from './entities/trip-message.entity';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class TripChatService {
  constructor(
    @InjectRepository(TripMessage)
    private readonly messagesRepository: Repository<TripMessage>,

    @InjectRepository(TripMember)
    private readonly tripMembersRepository: Repository<TripMember>,

    private readonly notificationsService: NotificationsService,
  ) {}

  private async checkActiveMember(
    tripId: string,
    userId: string,
  ) {
    const member = await this.tripMembersRepository.findOne({
      where: {
        tripId,
        userId,
        status: TripMemberStatus.ACTIVE,
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'Only active trip members can access the chat',
      );
    }

    return member;
  }

  async sendMessage(
    tripId: string,
    userId: string,
    dto: SendMessageDto,
  ) {
    await this.checkActiveMember(
      tripId,
      userId,
    );

    const message = dto.message?.trim();

    if (!message) {
      throw new BadRequestException(
        'Message cannot be empty',
      );
    }

    const tripMessage =
      this.messagesRepository.create({
        tripId,
        senderId: userId,
        message,
        isRead: false,
      });

    const savedMessage =
      await this.messagesRepository.save(
        tripMessage,
      );
    const activeMembers =
      await this.tripMembersRepository.find({
        where: {
          tripId,
          status: TripMemberStatus.ACTIVE,
        },
      });
    for (const member of activeMembers) {
      if (member.userId === userId) {
        continue;
      }

      await this.notificationsService.createNotification({
        userId: member.userId,
        type: NotificationType.NEW_MESSAGE,
        title: 'New Trip Message',
        message: 'You have received a new message in your trip chat.',
        referenceId: savedMessage.id,
        referenceType: 'TRIP_MESSAGE',
      });
    }

    return savedMessage;
  }

  async getMessages(
    tripId: string,
    userId: string,
  ) {
    await this.checkActiveMember(
      tripId,
      userId,
    );

    return this.messagesRepository.find({
      where: {
        tripId,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }
}