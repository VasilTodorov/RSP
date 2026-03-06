import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  // src/app/features/auth/register/register.component.ts
  // 2. Define the form structure
  registerForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]] // Add this
  });

  onSubmit() {
  if (this.registerForm.invalid) return;

  this.isLoading.set(true);
  this.errorMessage.set(null);
  const credentials = this.registerForm.getRawValue();

  this.authService.register(credentials).subscribe({
    next: () => {
      // Registration worked! Now try to login
      this.authService.login(credentials).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/']); // Success: Go Home
        },
        error: () => {
          this.isLoading.set(false);
          // Login failed: Redirect to login page with a success message
          this.router.navigate(['/login'], { 
            queryParams: { message: 'Account created! Please sign in manually.' } 
          });
        }
      });
    },
    error: (cleanMessage: string) => {
      this.isLoading.set(false);
      this.errorMessage.set(cleanMessage); // Shows "This email is already taken"
    }
  });
}
}
