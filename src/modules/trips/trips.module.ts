import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Trip } from './entities/trip.entity';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { TripMembersModule } from '../trip-members/trip-members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip]),
    TripMembersModule
  ],

  controllers: [TripsController],

  providers: [TripsService],

  exports: [TripsService],
})
export class TripsModule {}