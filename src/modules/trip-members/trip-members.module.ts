import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TripMember } from './entities/trip-member.entity';
import { TripMembersService } from './trip-members.service';
import { TripMembersController } from './trip-members.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripMember]),
  ],
  controllers: [TripMembersController],
  providers: [TripMembersService],
  exports: [TripMembersService],
})
export class TripMembersModule {}