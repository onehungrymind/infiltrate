import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { JobProgressEvent } from '../jobs/queues/job-data.types';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/jobs',
})
export class ProgressGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[WebSocket] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WebSocket] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, jobId: string) {
    const room = `job:${jobId}`;
    client.join(room);
    console.log(`[WebSocket] Client ${client.id} subscribed to job ${jobId}`);
    return { event: 'subscribed', data: { jobId } };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, jobId: string) {
    const room = `job:${jobId}`;
    client.leave(room);
    console.log(`[WebSocket] Client ${client.id} unsubscribed from job ${jobId}`);
    return { event: 'unsubscribed', data: { jobId } };
  }

  /**
   * Handle progress events from workers via EventEmitter
   * Broadcasts to all clients subscribed to the specific job room
   */
  @OnEvent('job.progress')
  handleJobProgress(event: JobProgressEvent): void {
    const room = `job:${event.buildJobId}`;
    console.log(`[WebSocket] Broadcasting progress event to room ${room}:`, event.type);
    this.server.to(room).emit('progress', event);
  }
}
