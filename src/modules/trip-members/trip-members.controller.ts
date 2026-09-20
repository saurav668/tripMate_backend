import {
  Controller,
  Get,
  Param,
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
    return this.tripMembersService.getTripMembers(tripId);
  }

}