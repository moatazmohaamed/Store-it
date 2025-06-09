import { Component } from '@angular/core';
import { Authfrom } from '../../../shared/components/authfrom/authfrom';

@Component({
  selector: 'app-sign-in',
  imports: [Authfrom],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {}
