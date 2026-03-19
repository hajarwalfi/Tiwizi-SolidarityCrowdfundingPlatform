import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserSidebarComponent } from '../shared/user-sidebar/user-sidebar.component';

@Component({
  selector: 'app-user-dashboard-shell',
  standalone: true,
  imports: [RouterOutlet, UserSidebarComponent],
  templateUrl: './user-dashboard-shell.component.html'
})
export class UserDashboardShellComponent {}
