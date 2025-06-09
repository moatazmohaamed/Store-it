import { Component } from '@angular/core';
import { AuthLayout } from '../../../layout/auth-layout/auth-layout';
import { Authfrom } from '../../../shared/components/authfrom/authfrom';

@Component({
  selector: 'app-sign-up',
  imports: [Authfrom],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp {}
