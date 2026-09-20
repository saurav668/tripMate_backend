import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateTripDto } from './dto/update-trip.dto';

@Controller('trips')
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTrip(
    @Req() req: any,
    @Body() dto: CreateTripDto,
  ) {
  
    return this.tripsService.createTrip(
      req.user.userId,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-trips')
  async getMyTrips(@Req() req: any) {
    return this.tripsService.getMyTrips(
      req.user.userId,
    );
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchTrips(
    @Req() req: any,
    @Query('destination') destination: string,
  ) {
    return this.tripsService.searchTrips(
      req.user.userId,
      destination,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTripsWithID(@Param('id') tripId: string,){
    return this.tripsService.getTripById(
       tripId
    )
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateTrip(
    @Param('id') tripId: string,
    @Req() req: any,
    @Body() dto: UpdateTripDto,
  ) {
    return this.tripsService.updateTrip(
      tripId,
      req.user.userId,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTrip(
    @Param('id') tripId: string,
    @Req() req: any,
  ) {
    return this.tripsService.deleteTrip(
      tripId,
      req.user.userId,
    );
  }
}