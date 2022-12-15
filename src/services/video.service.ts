import {Injectable} from '@angular/core';
import {from, map, Observable, of, switchMap} from "rxjs";

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

    createConnection(): Observable<RTCPeerConnection> {
        return of(new RTCPeerConnection(this.servers));
    }

    createOffer(connection: RTCPeerConnection, options?: RTCOfferOptions): Observable<RTCSessionDescriptionInit> {
        return from(connection.createOffer(options))
            // .pipe(
            //     switchMap(offer => {
            //         return this.setLocalDescription(connection, offer);
            //     })
            // )

        // return new Observable(observer => {
        //     connection.createOffer(options)
        //         .then((offer) => {
        //                 connection.setLocalDescription(offer).then(res => {
        //                     console.log('iiiiiiiiiii', connection);
        //                     observer.next(offer);
        //                 })
        //             }
        //         )
        //         .catch((error) => {
        //             observer.error(error)
        //         })
        // })
    }

    setLocalDescription(connection: RTCPeerConnection, offer: RTCSessionDescriptionInit): Observable<RTCSessionDescriptionInit> {
        return new Observable<RTCSessionDescriptionInit>(observer => {
            connection.setLocalDescription(offer)
                .then(() => {
                    observer.next(offer);
                })
                .catch(err => {
                    observer.error(err)
                })
        })
    }

    setRemoteDescription(connection: RTCPeerConnection, offer: RTCSessionDescriptionInit): Observable<void> {
        return from(connection.setRemoteDescription(offer))
    }
}
