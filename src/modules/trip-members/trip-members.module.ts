import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TripMember } from './entities/trip-member.entity';
import { TripMembersService } from './trip-members.service';
import { TripMembersController } from './trip-members.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripMember]),
    NotificationsModule
  ],
  controllers: [TripMembersController],
  providers: [TripMembersService],
  exports: [TripMembersService],
})
export class TripMembersModule {}