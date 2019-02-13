import { NgModule } from '@angular/core';

import { GameRoutingModule } from './game-routing.module';
import { GameComponent } from './game.component';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { SharedModule } from '../shared.module';

@NgModule({
  declarations: [
    GameComponent,
    KeyboardComponent
  ],
  imports: [
    SharedModule,
    GameRoutingModule
  ]
})
export class GameModule { }
