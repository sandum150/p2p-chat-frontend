import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {RoomComponent} from "./room/room.component";

const routes: Routes = [
    { path: 'room/:sessionId', component: RoomComponent },
    { path: 'room', component: RoomComponent },
    { path: '', redirectTo: 'room' , pathMatch: 'full'},
    { path: '**', redirectTo: 'room' },
];

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
