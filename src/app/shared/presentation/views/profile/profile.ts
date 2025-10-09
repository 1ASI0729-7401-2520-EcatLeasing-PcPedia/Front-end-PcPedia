import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageSwitcherComponent } from '../../components/language-switcher/language-switcher';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LanguageSwitcherComponent, TranslatePipe],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile {
  usuario = {
    username: 'sebastian',
    email: 'sebastian@pcpedia.com',
    password: '12345'
  };

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
