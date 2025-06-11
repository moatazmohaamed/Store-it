import { Component } from '@angular/core';
import { DashboardLayout } from '../../../layout/dashboard-layout/dashboard-layout';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardLayout],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
