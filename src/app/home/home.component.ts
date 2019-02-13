import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { FormBuilder } from '@angular/forms';
import { generateUID } from '../shared/util';
import { AngularFireDatabase } from '@angular/fire/database';
import { Router } from '@angular/router';

@Component({
  selector: 'hgm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('username') username: ElementRef;

  constructor(private afAuth: AngularFireAuth, private fb: FormBuilder, private db: AngularFireDatabase, private router: Router) { }

  form = this.fb.group({
    username: ['']
  });

  async ngOnInit() {
    await this.afAuth.auth.signInAnonymously();
    this.afAuth.user.subscribe((user: User) => {
      this.username.nativeElement = user.displayName;
    });
  }

  async createGame() {
    const id = generateUID();
    await this.setUsername();
    await this.db.object('/games').update({[id]: {
        gameInfo: {
          maxPlayers: 10,
          category: 'all',
          isNew: true,
          'updated-on': Date.now()
      }
      }});
    this.router.navigate(['game', id]);
  }

  private async setUsername(): Promise<void> {
    const username = this.form.value.username ? this.form.value.username : 'Guest';
    return await this.afAuth.auth.currentUser.updateProfile({displayName: username, photoURL: null});
  }

}
