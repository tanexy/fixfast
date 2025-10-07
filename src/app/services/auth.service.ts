import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Http } from "@nativescript/core";
import { ApplicationSettings } from "@nativescript/core";
import { AuthState,User,RegResponse,LoginResponse} from "../enums/enums";



@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly API_BASE_URL = "https://c76cc83d4b5a.ngrok-free.app";
  private readonly TOKEN_KEY = "auth_token";
  private readonly USER_KEY = "auth_user";

  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  constructor() {
    // Check if user is already logged in on app start
    this.checkStoredAuth();
  }

  /**
   * Get authentication state as Observable
   */
  getAuthState(): Observable<AuthState> {
    return this.authStateSubject.asObservable();
  }

  /**
   * Get current authentication state (synchronous)
   */
  getCurrentAuthState(): AuthState {
    return this.authStateSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Get JWT token
   */
  getToken(): string | null {
    console.log("token", this.authStateSubject.value.token);
    return this.authStateSubject.value.token;
  }

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await Http.request({
        url: `${this.API_BASE_URL}/auth/login`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        content: JSON.stringify({
          username,
          password,
        }),
      });

      // Check response status
      if (response.statusCode !== 200) {
        if (!response.content) {
          throw new Error("No response from server");
        }
        const errorData = response.content.toJSON();
        console.error("Login failed with status:", response.statusCode);
        throw new Error(errorData.message || "Login failed");
      }
      if (!response.content) {
        throw new Error("No response  from server");
      }

      const data: LoginResponse = response.content.toJSON();

      // Validate response
      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      // Store token and user data
      this.storeAuthData(data.token.Token, data.user);

      // Update auth state
      this.authStateSubject.next({
        isAuthenticated: true,
        user: data.user,
        token: data.token.Token,
      });

      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes("401")) {
          throw new Error("Invalid username or password");
        } else if (error.message.includes("Network")) {
          throw new Error("Network error. Please check your connection.");
        } else {
          throw new Error(error.message || "Login failed. Please try again.");
        }
      } else {
        throw new Error("An unexpected error occurred");
      }
    }
  }

  /**
   * Register new user
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<RegResponse> {
    try {
      const response = await Http.request({
        url: `${this.API_BASE_URL}/auth/register`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        content: JSON.stringify(userData),
      });

      if (response.statusCode !== 201 && response.statusCode !== 200) {
        if (!response.content) {
          throw new Error("No response from server");
        }
        const errorData = response.content.toJSON();
        throw new Error(errorData.message || "Registration failed");
      }
      if (!response.content) {
        throw new Error("No response from server");
      }
      if (response.statusCode === 201) {
        const data = response.content.toJSON();

        return data;
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(
        error.message || "Registration failed. Please try again."
      );
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    /*try {
      const token = this.getToken();

      if (token) {
        // Optional: Call backend logout endpoint
        await Http.request({
          url: `${this.API_BASE_URL}/auth/logout`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear stored data
      

      // Update auth state
      this.authStateSubject.next({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    }*/
   this.clearAuthData();
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(): Promise<string> {
    try {
      const currentToken = this.getToken();

      if (!currentToken) {
        throw new Error("No token available");
      }

      const response = await Http.request({
        url: `${this.API_BASE_URL}/auth/refresh`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });
      if (response.statusCode !== 200) {
        if (!response.content) {
          throw new Error("No response from server");
        }
        const errorData = response.content.toJSON();
        throw new Error(errorData.message || "Token refresh failed");
      }
      if (!response.content) {
        throw new Error("No response from server");
      }

      const data = response.content.toJSON();
      const newToken = data.token;

      if (!newToken) {
        throw new Error("No token received");
      }

      // Update stored token
      ApplicationSettings.setString(this.TOKEN_KEY, newToken);

      // Update auth state
      const currentState = this.authStateSubject.value;
      this.authStateSubject.next({
        ...currentState,
        token: newToken,
      });

      return newToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      // If refresh fails, logout user
      await this.logout();
      throw new Error("Session expired. Please login again.");
    }
  }

  /**
   * Verify if token is still valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getToken();

      if (!token) {
        return false;
      }

      const response = await Http.request({
        url: `${this.API_BASE_URL}/auth/verify`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.statusCode === 200;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await Http.request({
        url: `${this.API_BASE_URL}/auth/change-password`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        content: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.statusCode !== 200) {
        if (!response.content) {
          throw new Error("No response from server");
        }
        const errorData = response.content.toJSON();
        throw new Error(errorData.message || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Change password error:", error);
      throw new Error(error.message || "Failed to change password");
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await Http.request({
        url: `${this.API_BASE_URL}/auth/forgot-password`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        content: JSON.stringify({ email }),
      });

      if (response.statusCode !== 200) {
        if (!response.content) {
          throw new Error("No response from server");
        }
        const errorData = response.content.toJSON();
        throw new Error(errorData.message || "Failed to send reset email");
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      throw new Error(error.message || "Failed to send reset email");
    }
  }

  /**
   * Store authentication data locally
   */
  private storeAuthData(token: string, user: User): void {
    ApplicationSettings.setString(this.TOKEN_KEY, token);
    ApplicationSettings.setString(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear stored authentication data
   */
  private clearAuthData(): void {
    ApplicationSettings.remove(this.TOKEN_KEY);
    ApplicationSettings.remove(this.USER_KEY);
  }

  /**
   * Check for stored authentication on app start
   */
  private checkStoredAuth(): void {
    const token = ApplicationSettings.getString(this.TOKEN_KEY);
    const userJson = ApplicationSettings.getString(this.USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);

        // Update auth state
        this.authStateSubject.next({
          isAuthenticated: true,
          user,
          token,
        });

        // Verify token is still valid
        this.verifyToken().then((isValid) => {
          if (!isValid) {
            this.logout();
          }
        });
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        this.clearAuthData();
      }
    }
  }
}
