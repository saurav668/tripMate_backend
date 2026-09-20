import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      console.log('Socket connection received');
      console.log('Handshake auth:', client.handshake.auth);

      const token = client.handshake.auth?.token;

      if (!token) {
        console.log('No token received');
        client.disconnect();
        return;
      }

      console.log('Token received');

      const secret = this.configService.get<string>('JWT_ACCESS_SECRET');

      console.log('JWT secret exists:', !!secret);

      if (!secret) {
        console.error('JWT_ACCESS_SECRET is not configured');
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      console.log('JWT payload:', payload);

      const userId = payload.sub;

      if (!userId) {
        console.log('No user ID found in JWT payload');
        client.disconnect();
        return;
      }

      client.data.userId = userId;

      await client.join(`user:${userId}`);

      console.log(`User ${userId} joined room user:${userId}`);
    } catch (error) {
      console.error('Socket authentication failed:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`User ${client.data.userId} disconnected`);
  }

  sendNotification(userId: string, notification: any) {
    this.server
      .to(`user:${userId}`)
      .emit('notification', notification);
  }
}