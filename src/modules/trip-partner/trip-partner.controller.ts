import {
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { TripPartnerService } from './trip-partner.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class TripPartnerController {
  constructor(
    private readonly requestsService: TripPartnerService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(':tripId/requests')
  async sendRequest(
    @Param('tripId') tripId: string,
    @Req() req: any,
  ) {
    return this.requestsService.sendRequest(
      tripId,
      req.user.userId,
    );
  }

   @UseGuards(JwtAuthGuard)
  @Patch('trip-partner-requests/:requestId/accept')
  async acceptRequest(
    @Param('requestId') requestId: string,
    @Req() req: any,
  ) {
    return this.requestsService.acceptRequest(
      requestId,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('trip-partner-requests/:requestId/reject')
  async rejectRequest(
    @Param('requestId') requestId: string,
    @Req() req: any,
  ) {
    return this.requestsService.rejectRequest(
      requestId,
      req.user.userId,
    );
  }
}