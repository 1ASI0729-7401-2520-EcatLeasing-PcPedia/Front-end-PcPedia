import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../../core/auth/services/auth.service';
import { Role } from '../../core/auth/models/user.model';

@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);

  private hasView = false;
  private requiredRole: Role | Role[] | null = null;

  @Input() set hasRole(role: Role | Role[]) {
    this.requiredRole = role;
    this.updateView();
  }

  constructor() {
    effect(() => {
      this.authService.currentUser();
      this.updateView();
    });
  }

  private updateView(): void {
    const shouldShow = this.checkRole();

    if (shouldShow && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!shouldShow && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private checkRole(): boolean {
    if (!this.requiredRole) {
      return false;
    }

    const user = this.authService.currentUser();
    if (!user) {
      return false;
    }

    if (Array.isArray(this.requiredRole)) {
      return this.requiredRole.includes(user.role);
    }

    return user.role === this.requiredRole;
  }
}
