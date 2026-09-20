import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Notification } from './entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
    ]),
     JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
    }),
  ],

  controllers: [
    NotificationsController,
  ],

  providers: [
    NotificationsService,
    NotificationsGateway,
  ],

  exports: [
    NotificationsService,
  ],
})
export class NotificationsModule {}