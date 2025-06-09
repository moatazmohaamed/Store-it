import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/auth/auth';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-otpmodel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otpmodel.html',
  styleUrl: './otpmodel.scss',
})
export class OTPmodel {
  @Input() showModal: Boolean = false;
  @Input() accountId: any = '';
  @Input() email: string = '';
  toastr = inject(ToastrService);

  @ViewChild('otp1') otp1!: ElementRef;
  @ViewChild('otp2') otp2!: ElementRef;
  @ViewChild('otp3') otp3!: ElementRef;
  @ViewChild('otp4') otp4!: ElementRef;
  @ViewChild('otp5') otp5!: ElementRef;
  @ViewChild('otp6') otp6!: ElementRef;

  password: any = '';
  otp: any;
  isLoading: boolean = false;
  otpInputs: string[] = ['', '', '', '', '', ''];

  constructor(private auth: Auth, private router: Router) {}

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!/^\d*$/.test(value)) {
      input.value = '';
      this.otpInputs[index] = '';
      return;
    }

    this.otpInputs[index] = value;

    if (value && index < 5) {
      const nextInput = this[`otp${index + 2}` as keyof OTPmodel] as ElementRef;
      nextInput?.nativeElement.focus();
    }
    const allFilled = this.otpInputs.every((input) => input !== '');

    if (allFilled) {
      this.otp = this.otpInputs.join('');
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') || '';
    if (!/^\d{6}$/.test(pasted)) return;
    for (let i = 0; i < 6; i++) {
      this.otpInputs[i] = pasted[i];
      const inputRef = this[`otp${i + 1}` as keyof OTPmodel] as ElementRef;
      if (inputRef) {
        inputRef.nativeElement.value = pasted[i];
      }
    }
    this.otp = pasted;
  }

  async handleSubmit(): Promise<void> {
    if (!this.otp) return;

    this.isLoading = true;
    try {
      const sessionId = await this.auth.verifySecret(this.accountId, this.otp);
      if (sessionId) {
        this.router.navigate(['/dashboard']);
        this.showModal = false;
      } else {
        this.toastr.error('Failed to verify OTP');
      }
    } catch (error) {
      this.toastr.error('Try again');
    } finally {
      this.isLoading = false;
    }
  }

  async handleResendOtp(): Promise<void> {
    await this.auth.sendEmailOTP(this.email);
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
