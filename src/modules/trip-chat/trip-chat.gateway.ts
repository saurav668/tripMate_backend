import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

import { TripChatService } from './trip-chat.service';

@WebSocketGateway({
  namespace: '/trip-chat',
  cors: {
    origin: '*',
  },
})
export class TripChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly configService: ConfigService,
    private readonly tripChatService: TripChatService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        client.disconnect();
        return;
      }

      const secret =
        this.configService.get<string>(
          'JWT_ACCESS_SECRET',
        );

      if (!secret) {
        client.disconnect();
        return;
      }

      const payload = jwt.verify(
        token,
        secret,
      ) as {
        sub: string;
        email: string;
      };

      client.data.userId = payload.sub;

      console.log(
        `Trip chat connected: ${client.id}`,
      );
    } catch (error) {
      console.error(
        'Trip chat authentication failed',
      );

      client.disconnect();
    }
  }

  @SubscribeMessage('joinTripRoom')
  async joinTripRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: string },
  ) {
    const userId = client.data.userId;

    await this.tripChatService.getMessages(
      data.tripId,
      userId,
    );

    const room = `trip:${data.tripId}`;

    await client.join(room);

    return {
      event: 'joinedTripRoom',
      tripId: data.tripId,
      room,
    };
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      tripId: string;
      message: string;
    },
  ) {
    const userId = client.data.userId;

    const savedMessage =
      await this.tripChatService.sendMessage(
        data.tripId,
        userId,
        {
          message: data.message,
        },
      );

    const room = `trip:${data.tripId}`;

    this.server.to(room).emit(
      'newMessage',
      savedMessage,
    );

    return savedMessage;
  }
}