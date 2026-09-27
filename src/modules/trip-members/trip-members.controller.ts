import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TripMembersService } from './trip-members.service';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripMembersController {
  constructor(
    private readonly tripMembersService: TripMembersService,
  ) {}

  @Get('my-memberships')
  async getMyMemberships(@Req() req: any) {
    return this.tripMembersService.getUserTrips(
      req.user.userId,
    );
  }

  @Get(':tripId/members')
  async getTripMembers(
    @Param('tripId') tripId: string,
  ) {
    return this.tripMembersService.getTripMembers(
      tripId,
    );
  }

  @Patch(':tripId/leave')
  async leaveTrip(
    @Param('tripId') tripId: string,
    @Req() req: any,
  ) {
    return this.tripMembersService.leaveTrip(
      tripId,
      req.user.userId,
    );
  }

  @Patch(':tripId/members/:userId/remove')
  async removeMember(
    @Param('tripId') tripId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    return this.tripMembersService.removeMember(
      tripId,
      req.user.userId,
      userId,
    );
  }
}