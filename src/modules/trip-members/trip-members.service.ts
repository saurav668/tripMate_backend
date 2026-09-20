import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  TripMember,
} from './entities/trip-member.entity';
import { TripMemberRole, TripMemberStatus } from 'src/constant';

@Injectable()
export class TripMembersService {
  constructor(
    @InjectRepository(TripMember)
    private readonly tripMembersRepository: Repository<TripMember>,
  ) {}

  async addMember(
    tripId: any,
    userId: any,
    role: TripMemberRole = TripMemberRole.MEMBER,
  ) {
    const existingMember =
      await this.tripMembersRepository.findOne({
        where: {
          tripId,
          userId,
        },
      });

    if (existingMember) {
      throw new ConflictException(
        'User is already a member of this trip',
      );
    }

    const member = this.tripMembersRepository.create({
      tripId,
      userId,
      role,
      status: TripMemberStatus.ACTIVE,
    });

    return this.tripMembersRepository.save(member);
  }

  async getTripMembers(tripId: string) {
    return this.tripMembersRepository.find({
      where: {
        tripId,
        status: TripMemberStatus.ACTIVE,
      },
      order: {
        joinedAt: 'ASC',
      },
    });
  }

  async getUserTrips(userId: string) {
    return this.tripMembersRepository.find({
      where: {
        userId,
        status: TripMemberStatus.ACTIVE,
      },
      order: {
        joinedAt: 'DESC',
      },
    });
  }
}