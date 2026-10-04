import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TripMessage } from './entities/trip-message.entity';
import { TripChatController } from './trip-chat.controller';
import { TripChatService } from './trip-chat.service';

import { TripMember } from '../trip-members/entities/trip-member.entity';
import { TripMembersModule } from '../trip-members/trip-members.module';
import { TripChatGateway } from './trip-chat.gateway';
import { NotificationsModule } from '../notifications/notifications.module';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TripMessage,
      TripMember,
    ]),
    NotificationsModule,
    TripMembersModule,
  ],
  controllers: [TripChatController],
  providers: [TripChatService,TripChatGateway],
  exports: [TripChatService],
})
export class TripChatModule {}