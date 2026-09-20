import {
  ConflictException,
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  TripPartner,
} from './entities/trip-partner.entity';

import { TripsService } from '../trips/trips.service';
import { NotificationType, TripMemberRole, TripPartnerStatus } from 'src/constant';
import { NotificationsService } from '../notifications/notifications.service';
import { TripMembersService } from '../trip-members/trip-members.service';

@Injectable()
export class TripPartnerService {
  constructor(
    @InjectRepository(TripPartner)
    private readonly requestsRepository: Repository<TripPartner>,
    private readonly notificationsService: NotificationsService,
    private readonly tripsService: TripsService,
    private readonly tripsMemberService:TripMembersService,
  ) {}

 async sendRequest(
  tripId: string,
  senderId: string,
) {
  const trip =
    await this.tripsService.getTripById(
      tripId,
    );

  // Prevent requesting your own trip
  if (trip.createdBy === senderId) {
    throw new BadRequestException(
      'You cannot send a request to your own trip',
    );
  }

  // Check existing pending request
  const existingRequest =
    await this.requestsRepository.findOne({
      where: {
        tripId,
        senderId,
        status: TripPartnerStatus.PENDING,
      },
    });

  if (existingRequest) {
    throw new ConflictException(
      'You already have a pending request for this trip',
    );
  }

  // Create request
  const request =
    this.requestsRepository.create({
      tripId,
      senderId,
      receiverId: trip.createdBy,
      status: TripPartnerStatus.PENDING,
    });

  // Save request
  const savedRequest =
    await this.requestsRepository.save(
      request,
    );

  // Create notification for trip owner
  await this.notificationsService.createNotification({
    userId: trip.createdBy,
    type: NotificationType.TRIP_REQUEST,
    title: 'New Trip Partner Request',
    message:
      'Saurav has requested to join your trip.',
    referenceId: savedRequest.id,
    referenceType: 'TRIP_PARTNER_REQUEST',
  });

  return savedRequest;
}

async acceptRequest(
  requestId: string,
  userId: string,
) {
  const request = await this.requestsRepository.findOne({
    where: {
      id: requestId,
    },
  });

  if (!request) {
    throw new NotFoundException('Trip partner request not found');
  }
  if (request.receiverId !== userId) {
    throw new ForbiddenException(
      'You are not authorized to accept this request',
    );
  }
  if (request.status !== TripPartnerStatus.PENDING) {
    throw new BadRequestException(
      `Request is already ${request.status.toLowerCase()}`,
    );
  }

  request.status = TripPartnerStatus.ACCEPTED;

  const savedRequest =
    await this.requestsRepository.save(request);

  await this.tripsMemberService.addMember(
    request.tripId,
    request.senderId,
    TripMemberRole.MEMBER,
  );

  await this.notificationsService.createNotification({
    userId: request.senderId,
    type: NotificationType.REQUEST_ACCEPTED,
    title: 'Trip Partner Request Accepted',
    message: 'Your trip partner request has been accepted.',
    referenceId: request.id,
    referenceType: 'TRIP_PARTNER_REQUEST',
  });

  return savedRequest;
}

async rejectRequest(
  requestId: string,
  userId: string,
) {
  const request = await this.requestsRepository.findOne({
    where: {
      id: requestId,
    },
  });

  if (!request) {
    throw new NotFoundException('Trip partner request not found');
  }

  // Only the receiver can reject the request
  if (request.receiverId !== userId) {
    throw new ForbiddenException(
      'You are not authorized to reject this request',
    );
  }

  if (request.status !== TripPartnerStatus.PENDING) {
    throw new BadRequestException(
      `Request is already ${request.status.toLowerCase()}`,
    );
  }

  request.status = TripPartnerStatus.REJECTED;

  const savedRequest =
    await this.requestsRepository.save(request);

  // Notify the sender
  await this.notificationsService.createNotification({
    userId: request.senderId,
    type: NotificationType.REQUEST_REJECTED,
    title: 'Trip Partner Request Rejected',
    message: 'Your trip partner request has been rejected.',
    referenceId: request.id,
    referenceType: 'TRIP_PARTNER_REQUEST',
  });

  return savedRequest;
}
}