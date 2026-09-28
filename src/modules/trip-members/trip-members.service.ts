import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  TripMember,
} from './entities/trip-member.entity';
import { NotificationType, TripMemberRole, TripMemberStatus } from 'src/constant';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TripMembersService {
  constructor(
    @InjectRepository(TripMember)
    private readonly tripMembersRepository: Repository<TripMember>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async addMember(
    tripId: string,
    userId: string,
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

    const member =
      this.tripMembersRepository.create({
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

  async leaveTrip(
    tripId: string,
    userId: string,
  ) {
    const member =
      await this.tripMembersRepository.findOne({
        where: {
          tripId,
          userId,
        },
      });

    if (!member) {
      throw new NotFoundException(
        'You are not a member of this trip',
      );
    }

    if (member.status !== TripMemberStatus.ACTIVE) {
      throw new BadRequestException(
        'You are not an active member of this trip',
      );
    }

    if (member.role === TripMemberRole.OWNER) {
      throw new BadRequestException(
        'Trip owner cannot leave the trip',
      );
    }

    member.status = TripMemberStatus.LEFT;

    const savedMember =
    await this.tripMembersRepository.save(member);

  // Find trip owner
  const owner =
    await this.tripMembersRepository.findOne({
      where: {
        tripId,
        role: TripMemberRole.OWNER,
        status: TripMemberStatus.ACTIVE,
      },
    });

  if (owner) {
    await this.notificationsService.createNotification({
      userId: owner.userId,
      type: NotificationType.TRIP_MEMBER_LEFT,
      title: 'Trip Member Left',
      message: 'A member has left your trip.',
      referenceId: tripId,
      referenceType: 'TRIP',
    });
  }

  return savedMember;
  }

  async removeMember(
    tripId: string,
    ownerId: string,
    userId: string,
  ) {
    const owner =
      await this.tripMembersRepository.findOne({
        where: {
          tripId,
          userId: ownerId,
          role: TripMemberRole.OWNER,
          status: TripMemberStatus.ACTIVE,
        },
      });

    if (!owner) {
      throw new ForbiddenException(
        'Only the trip owner can remove members',
      );
    }

    const member =
      await this.tripMembersRepository.findOne({
        where: {
          tripId,
          userId,
        },
      });

    if (!member) {
      throw new NotFoundException(
        'Trip member not found',
      );
    }

    if (member.status !== TripMemberStatus.ACTIVE) {
      throw new BadRequestException(
        'User is not an active member of this trip',
      );
    }

    if (member.role === TripMemberRole.OWNER) {
      throw new BadRequestException(
        'Trip owner cannot be removed',
      );
    }

    member.status = TripMemberStatus.REMOVED;

    const savedMember =
    await this.tripMembersRepository.save(member);

  // Notify removed member
  await this.notificationsService.createNotification({
    userId: member.userId,
    type: NotificationType.TRIP_MEMBER_REMOVED,
    title: 'Removed From Trip',
    message: 'You have been removed from the trip.',
    referenceId: tripId,
    referenceType: 'TRIP',
  });

  return savedMember;
  }
}