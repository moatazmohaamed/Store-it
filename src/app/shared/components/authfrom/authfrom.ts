import { Component, inject, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { OTPmodel } from '../otpmodel/otpmodel';
import { Auth } from '../../../core/services/auth/auth';

@Component({
  selector: 'app-authfrom',
  imports: [ReactiveFormsModule, OTPmodel],
  templateUrl: './authfrom.html',
  styleUrl: './authfrom.scss',
})
export class Authfrom {
  @Input({ required: true }) type: 'sign-in' | 'sign-up' = 'sign-up';
  auth = inject(Auth);
  signupForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  accountId: any;
  showOtpModal = false;

  authForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: [''],
    });

    this.updateValidators();
  }

  ngOnChanges() {
    this.updateValidators();
  }

  private updateValidators() {
    const fullNameControl = this.authForm.get('fullName');

    if (this.type === 'sign-up') {
      fullNameControl?.setValidators([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]);
    } else {
      fullNameControl?.clearValidators();
    }

    fullNameControl?.updateValueAndValidity();
  }

  async onSubmit() {
    if (this.authForm.invalid) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';
      let user;
      if (this.type === 'sign-up') {
        user = await this.auth.createAccount(
          this.authForm.value?.fullName || '',
          this.authForm.value.email
        );
        this.accountId = user;
        this.showOtpModal = true;
      } else {
        const result = await this.auth.signInUser(this.authForm.value.email);
        if (result.accountId) {
          this.accountId = result.accountId;
          this.showOtpModal = true;
        } else {
          this.errorMessage =
            result.error || 'Failed to sign in. Please try again.';
        }
      }
    } catch (error) {
      this.errorMessage =
        this.type === 'sign-up'
          ? 'Failed to create an account. Please try again.'
          : 'Failed to sign in. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  navigateToAuth() {
    const route = this.type === 'sign-in' ? 'auth/sign-up' : 'auth/sign-in';
    this.router.navigate([route]);
  }
}
