import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavComponent } from './shared/nav/nav.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  preserveWhitespaces: true,
})
export class App {}
