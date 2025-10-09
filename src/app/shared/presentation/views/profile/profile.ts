import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../../core/services/auth.service';
import {LanguageSwitcher} from '../../components/language-switcher/language-switcher';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, TranslateModule, LanguageSwitcher],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  usuario: any = null;
  servicios: string[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.usuario = this.authService.getCurrentUser();

    if (this.usuario) {
      this.servicios = this.usuario.servicios;
    }
  }

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
