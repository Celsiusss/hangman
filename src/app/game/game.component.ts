import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs/index';
import { ActivatedRoute } from '@angular/router';
import { GameInfo } from '../shared/types';

@Component({
  selector: 'hgm-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  word = [['l', 'o', 'a', 'd', 'i', 'n', 'g']];

  game: Observable<any>;

  constructor(private db: AngularFireDatabase, private route: ActivatedRoute) {
    this.game = db.object(`/games/${route.snapshot.params.id}/gameInfo`).valueChanges();
  }

  ngOnInit() {
    this.game.subscribe((game: GameInfo) => {
      this.word = game.letterWord;
    });
  }
}
