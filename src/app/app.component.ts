import {Component, OnInit} from '@angular/core';
import {VideoService} from "../services/video.service";
import { Socket } from "ngx-socket-io";
import { switchMap } from "rxjs";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    localVideo: HTMLVideoElement | undefined;
    peerConnection!: RTCPeerConnection;
    connectionUrl = '';
    localStream!: MediaStream;


    constructor(private videoService: VideoService, private socket: Socket) {

    }

    ngOnInit() {
        this.localVideo = document.querySelector('#video-local') as HTMLVideoElement
        this.videoService.getUserMedia().subscribe((res: MediaStream | null) => {
            if (res) {
                this.localStream = res;
                if (this.localVideo) {
                    console.log('res', res);
                    this.localVideo.srcObject = res;

                }
            }
        })

        this.socket.on('connection-awaiting', (msg: string) => {
            console.log('server answered', msg);
            this.connectionUrl = window.location.href + msg
        });

    }

    getInvitationLink() {
        this.videoService.getPeerConnection()
            .pipe(
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
                    return this.videoService.getOffer(connection);
                })
            )
            .subscribe(res => {
                console.log(res);

                this.socket.emit('client-offer', JSON.stringify(res));
            })
    }


}
