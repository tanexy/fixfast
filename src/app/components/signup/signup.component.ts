import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { AuthService } from "../../services/auth.service";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "ns-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"],
})
export class SignupComponent implements OnInit {
  // Form properties
  username: string = "";
  email: string = "";
  password: string = "";
  confirmPassword: string = "";
  agreeToTerms: boolean = false;
  isLoading: boolean = false;
  errorMessage = "";

  constructor(
    private routerExtensions: RouterExtensions,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    console.log("✅ Signup component ngOnInit - SIGNUP PAGE LOADED!");
  }

  goToDashboard() {
    this.routerExtensions
      .navigate(["/"], {
        clearHistory: true,
        animated: true,
      })
      .then((success) => {
        console.log(success);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  goToLogin() {
    this.routerExtensions
      .navigate(["/login"], {
        clearHistory: false,
        animated: true,
      })
      .then((success) => {
        console.log("✅ Login navigation result:", success);
      })
      .catch((error) => {
        console.error("❌ Login navigation error:", error);
      });
  }

  // Form validation
  isFormValid(): boolean {
    return (
      this.username.length > 0 &&
      this.email.length > 0 &&
      this.isValidEmail(this.email) &&
      this.password.length >= 6 &&
      this.password === this.confirmPassword &&
      this.agreeToTerms
    );
  }

  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password match check
  passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  // Signup method
  async onSignup() {
    if (!this.isFormValid()) {
      if (!this.agreeToTerms) {
        this.errorMessage = "Please agree to the terms and conditions.";
      } else if (!this.isValidEmail(this.email)) {
        this.errorMessage = "Please enter a valid email address.";
      } else if (this.password.length < 6) {
        this.errorMessage = "Password must be at least 6 characters.";
      } else if (!this.passwordsMatch()) {
        this.errorMessage = "Passwords do not match.";
      } else {
        this.errorMessage = "Please fill in all required fields.";
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";

    const userData = {
      username: this.username,
      email: this.email,
      password: this.password,
    };

    try {
      const response = await this.authService.register(userData);
      this.toast.success(response.message);

      this.goToDashboard();
    } catch (error: any) {
      this.errorMessage = error.message || "Signup failed. Please try again.";
      this.toast.error(this.errorMessage);
      console.error("Signup error:", error);
    } finally {
      this.isLoading = false;
    }
  }

  // Terms and conditions
  onViewTerms() {
    console.log("📄 View terms tapped");
    // Add your terms navigation logic here
  }

  // Navigate to login
  onGoToLogin() {
    console.log("📄 Go to login tapped");
    this.goToLogin();
  }
}
