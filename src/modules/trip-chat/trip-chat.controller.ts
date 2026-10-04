import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { TripChatService } from './trip-chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripChatController {
  constructor(
    private readonly tripChatService: TripChatService,
  ) {}

  @Post(':tripId/messages')
  async sendMessage(
    @Param('tripId') tripId: string,
    @Req() req: any,
    @Body() dto: SendMessageDto,
  ) {
    return this.tripChatService.sendMessage(
      tripId,
      req.user.userId,
      dto,
    );
  }

  @Get(':tripId/messages')
  async getMessages(
    @Param('tripId') tripId: string,
    @Req() req: any,
  ) {
    return this.tripChatService.getMessages(
      tripId,
      req.user.userId,
    );
  }
}