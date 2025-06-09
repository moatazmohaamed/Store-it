import { Component } from '@angular/core';
import { DashboardLayout } from '../../../layout/dashboard-layout/dashboard-layout';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardLayout,RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

}
