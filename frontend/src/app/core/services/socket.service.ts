import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('https://mploychek-backend.onrender.com', {
      autoConnect: false,
    });
  }

  connect(userId: string): void {
    this.socket.connect();
    this.socket.emit('join', userId);
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  onNotification(): Observable<{ message: string; type: string }> {
    return new Observable((observer) => {
      this.socket.on('notification', (data) => {
        observer.next(data);
      });
    });
  }
}
