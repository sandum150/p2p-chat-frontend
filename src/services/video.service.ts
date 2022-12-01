import {Injectable} from '@angular/core';
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class VideoService {

    private servers = {
        iceServers: [{
            urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
        }]
    }

    constructor() {
    }

    getUserMedia(): Observable<MediaStream> {
        return new Observable(observer => {
            navigator.mediaDevices
                .getDisplayMedia({
                    audio: false, video: {
                        width: {ideal: 1920},
                        height: {ideal: 1080}
                    }
                })
                .then((stream: MediaStream) => {
                    console.log('media display');
                    observer.next(stream);
                })
                .catch((error) => {
                    observer.error(error);
                });
        })
    }

    getPeerConnection(): Observable<RTCPeerConnection> {
        return new Observable<RTCPeerConnection>(observer => {
            observer.next(new RTCPeerConnection(this.servers));
        })
    }

    getOffer(connection: RTCPeerConnection, options?: RTCOfferOptions): Observable<any> {
        return new Observable(observer => {
            connection.createOffer(options)
                .then((offer) => {
                        connection.setLocalDescription(offer).then(res => {
                            observer.next(offer);
                        })
                    }
                )
                .catch((error) => {
                    observer.error(error)
                })
        })
    }

    setLocalDescription(connection: RTCPeerConnection, offer: RTCSessionDescriptionInit) {
        return new Observable(observer => {
            connection.setLocalDescription(offer)
                .then(res => {
                    console.log('local descr', res);
                    observer.next(res);
                })
                .catch(err => {
                    observer.error(err);
                })
        })
    }
}
