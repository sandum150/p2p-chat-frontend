import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {VideoService} from "../../services/video.service";
import {Socket} from "ngx-socket-io";
import {map, Observable, switchMap} from "rxjs";

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

    localVideo: HTMLVideoElement | undefined;
    remoteVideo: HTMLVideoElement | undefined;
    peerConnection!: RTCPeerConnection;
    connectionUrl = '';
    localStream!: MediaStream;
    sessionId: string | null = null;
    connection$!: Observable<RTCPeerConnection>;


    constructor(private videoService: VideoService, private socket: Socket, private route: ActivatedRoute) {
    }

    ngOnInit() {

        this.connection$ = this.videoService.createConnection();

        this.sessionId = this.route.snapshot.paramMap.get('sessionId');

        this.localVideo = document.querySelector('#video-local') as HTMLVideoElement
        this.remoteVideo = document.querySelector('#video-remote') as HTMLVideoElement

        this.videoService.getUserMedia().subscribe((res: MediaStream | null) => {
            if (res) {
                this.localStream = res;
                if (this.localVideo) {
                    this.localVideo.srcObject = res;
                }
            }
        })

        this.socket.on('connection-awaiting', (msg: string) => {
            console.log('server answered', msg);
            this.connectionUrl = `${window.location.href}/${msg}`
        });

        if (this.sessionId) {
            this.socket.on('server-offer', (msg: string) => {
                console.log('got offer: ');
                this.connection$.pipe(
                    switchMap((connection: RTCPeerConnection) => {
                        this.peerConnection = connection;

                        return  this.videoService.setRemoteDescription(connection, JSON.parse(msg))
                    })
                ).subscribe( res => {
                    console.log('set offer', res);
                })
            })
            this.socket.emit('get-offer', this.sessionId);
        }

    }

    getInvitationLink() {
        this.connection$
            .pipe(
                // map((connection: RTCPeerConnection) => {
                //     return this.videoService.setLocalDescription(connection, )
                // }),
                switchMap((connection) => {
                    this.peerConnection = connection;

                    this.peerConnection.ontrack = () => {
                        console.log('on track haha');
                    }

                    this.peerConnection.onicecandidate = (event) => {
                        console.log('icecandidate', event);
                    }

                    this.localStream.getTracks().forEach(track => {
                        console.log('add track', track);
                        connection.addTrack(track, this.localStream)
                    })



                    return this.videoService.createOffer(connection).pipe(
                        switchMap(offer => {
                            console.log('1', JSON.stringify(this.peerConnection));
                            return this.videoService.setLocalDescription(this.peerConnection, offer)
                        })
                    );
                        // .pipe(
                        //     switchMap((offer: RTCSessionDescriptionInit) => {
                        //         console.log('setting offer to local description', offer);
                        //         return this.videoService.setLocalDescription(connection, offer);
                        //     })
                        // );
                })
            )
            .subscribe(res => {
                console.log('offer to send to server: ', res);

                this.socket.emit('client-offer', JSON.stringify(res));
            })
    }


}
