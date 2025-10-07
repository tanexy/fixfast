import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { AuthService } from "../../services/auth.service";
import { LoginResponse } from "../../enums/enums";

@Component({
  selector: "ns-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  // Form properties
  username: string = "";
  password: string = "";
  rememberMe: boolean = false;
  isLoading: boolean = false;
  errorMessage = "";

  constructor(
    private routerExtensions: RouterExtensions,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log("✅ Login component ngOnInit - LOGIN PAGE LOADED!");
  }

  goToDashboard() {
    this.routerExtensions
      .navigate(["/fault-detection"], {
        clearHistory: true,
        animated: true,
      })
      .then((success) => {})
      .catch((error) => {
        console.error(error);
      });
  }
  goToSignup() {
    this.routerExtensions
      .navigate(["/signup"], {
        clearHistory: false,
        animated: true,
      })
      .then((success) => {
        console.log(success);
      })
      .catch((error) => {
        console.error("Signup navigation error:", error);
      });
  }

  // Form validation
  isFormValid(): boolean {
    return this.username.length > 0 && this.password.length > 0;
  }

  // Login method
  async onLogin() {
    if (!this.isFormValid()) {
      this.errorMessage = "Please enter both username and password.";
      return;
    }

    this.isLoading = true;
    try {
      const response: LoginResponse = await this.authService.login(
        this.username,
        this.password
      );

      console.log("Login successful:", response.user);
      // Navigate to home or dashboard
      this.goToDashboard();
    } catch (error: any) {
      this.errorMessage = error.message || "Login failed";
      console.error("Login error:", error);
    } finally {
      this.isLoading = false;
    }
  }

  // Forgot password
  onForgotPassword() {}

  onSignUp() {
    this.goToSignup();
  }
}
