import { Injectable } from '@angular/core';
import {Socket} from "ngx-socket-io";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SignalingService {

  constructor(private socket: Socket) {  }

  sendOffer(offer: RTCSessionDescriptionInit) {
    this.socket.emit('client-offer', JSON.stringify(offer));
  }

  sendAnswer(answer: RTCSessionDescriptionInit) {
    this.socket.emit('client-answer', JSON.stringify(answer))
  }

  getOffer(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('server-offer', (msg: string) => {
        observer.next(JSON.parse(msg));
      })
    })
  }
}
