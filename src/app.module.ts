import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './modules/auth/auth.module';

import { UsersModule } from './modules/users/users.module'
import { TripsModule } from './modules/trips/trips.module';
import { TripPartner } from './modules/trip-partner/entities/trip-partner.entity';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TripPartnerModule } from './modules/trip-partner/trip-partner.module';
import { TripMembersModule } from './modules/trip-members/trip-members.module';
import { TripChatModule } from './modules/trip-chat/trip-chat.module';

@Module({

    imports: [

        ConfigModule.forRoot({

            isGlobal: true,

        }),

        TypeOrmModule.forRoot({

            type: "postgres",

            host: process.env.DB_HOST,

            port: Number(process.env.DB_PORT),

            username: process.env.DB_USERNAME,

            password: process.env.DB_PASSWORD,

            database: process.env.DB_NAME,

            autoLoadEntities: true,

            synchronize: true,
            // logging:true,

        }),

        AuthModule,
        UsersModule,
        TripsModule,
        TripPartnerModule,
        NotificationsModule,
        TripMembersModule,
        TripChatModule

    ]

})

export class AppModule { }