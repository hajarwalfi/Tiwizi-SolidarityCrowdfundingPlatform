import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../shared/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-dashboard-shell',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent],
  templateUrl: './admin-dashboard-shell.component.html',
})
export class AdminDashboardShellComponent {}
