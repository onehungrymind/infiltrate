import { inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { JobProgressEvent } from '@kasita/common-models';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

import { API_URL } from '../../config/api-url.token';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private socket: Socket | null = null;
  private apiUrl = inject(API_URL);
  private ngZone = inject(NgZone);

  /**
   * Get the base URL for WebSocket connection (without /api path)
   */
  private getBaseUrl(): string {
    // API_URL is like 'http://localhost:3333/api', we need 'http://localhost:3333'
    const url = new URL(this.apiUrl);
    return url.origin;
  }

  /**
   * Connect to the WebSocket server (jobs namespace)
   */
  connect(): void {
    if (!this.socket) {
      const baseUrl = this.getBaseUrl();
      console.log(`[WebSocket] Connecting to ${baseUrl}/jobs`);

      this.socket = io(`${baseUrl}/jobs`, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log(`[WebSocket] Connected to server, socket id: ${this.socket?.id}`);
      });

      this.socket.on('disconnect', (reason) => {
        console.log(`[WebSocket] Disconnected: ${reason}`);
      });

      this.socket.on('connect_error', (error) => {
        console.error('[WebSocket] Connection error:', error.message);
      });
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribe to real-time progress events for a specific job
   * Returns an Observable that emits JobProgressEvent objects
   */
  subscribeToJob(jobId: string): Observable<JobProgressEvent> {
    console.log(`[WebSocket] subscribeToJob called for job ${jobId}`);

    return new Observable<JobProgressEvent>((subscriber) => {
      // Ensure we're connected
      this.connect();

      // Subscribe to the job room
      console.log(`[WebSocket] Emitting subscribe for job ${jobId}`);
      this.socket!.emit('subscribe', jobId);

      // Handle progress events
      const handler = (event: JobProgressEvent) => {
        console.log(`[WebSocket] Received progress event:`, event.type, event.message);
        this.ngZone.run(() => {
          subscriber.next(event);

          // Complete the observable if job is done
          if (event.type === 'job-completed' || event.type === 'job-failed') {
            console.log(`[WebSocket] Job ${event.type}, completing observable`);
            subscriber.complete();
          }
        });
      };

      this.socket!.on('progress', handler);
      console.log(`[WebSocket] Registered progress handler for job ${jobId}`);

      // Cleanup on unsubscribe
      return () => {
        console.log(`[WebSocket] Unsubscribing from job ${jobId}`);
        if (this.socket) {
          this.socket.emit('unsubscribe', jobId);
          this.socket.off('progress', handler);
        }
      };
    });
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
