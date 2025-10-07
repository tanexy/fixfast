import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { NavigationEnd, Router } from "@angular/router";
import { AuthService } from "./services/auth.service";

@Component({
  selector: "ns-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  activeTab: string = "login";

  constructor(
    private routerExtensions: RouterExtensions,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check login status and redirect if needed
    this.checkLoginStatus();

    // Listen to route changes to update active tab
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateActiveTab(event.url);
        this.handleRouteProtection(event.url);
      }
    });
  }

  //checking if user is logged in
  get isLoggedIn(): boolean {
    try {
      const token = this.authService.getToken();
      return !!(token && token.trim() !== "");
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }

  private checkLoginStatus() {
    // If logged in and on login page, redirect to dashboard
    if (
      this.isLoggedIn &&
      (this.router.url === "/" || this.router.url.includes("login"))
    ) {
      this.routerExtensions.navigate(["/fault-detection"], {
        clearHistory: true,
        animated: false,
      });
    }
    // If not logged in and not on login page, redirect to login
    else if (!this.isLoggedIn && !this.router.url.includes("login")) {
      this.routerExtensions.navigate(["/login"], {
        clearHistory: true,
        animated: false,
      });
    }
  }

  private handleRouteProtection(url: string) {
    // Protected routes - require authentication
    const protectedRoutes = [
      "fault-detection",
      "report-form",
      "tickets",
      "signal-detection",
      "profile",
    ];

    const isProtectedRoute = protectedRoutes.some((route) =>
      url.includes(route)
    );

    // Redirect to login if trying to access protected route without auth
    if (isProtectedRoute && !this.isLoggedIn) {
      this.routerExtensions.navigate(["/login"], {
        clearHistory: true,
        animated: false,
      });
    }
    // Redirect to dashboard if logged in and trying to access login
    else if ((url.includes("login") || url === "/") && this.isLoggedIn) {
      this.routerExtensions.navigate(["/fault-detection"], {
        clearHistory: true,
        animated: false,
      });
    }
  }

  private updateActiveTab(url: string) {
    if (url.includes("login") || url === "/") {
      this.activeTab = "login";
    } else if (url.includes("fault-detection")) {
      this.activeTab = "dashboard";
    } else if (url.includes("report-form")) {
      this.activeTab = "report";
    } else if (url.includes("tickets")) {
      this.activeTab = "tickets";
    } else if (url.includes("signal-detection")) {
      this.activeTab = "network";
    } else if (url.includes("profile")) {
      this.activeTab = "profile";
    }
  }

  navigateToTab(route: string) {
    // Check if user is logged in before navigating to protected routes
    const protectedRoutes = [
      "fault-detection",
      "report-form",
      "tickets",
      "signal-detection",
      "profile",
    ];

    if (protectedRoutes.includes(route) && !this.isLoggedIn) {
      console.warn(`⚠️ Cannot navigate to ${route} - user not logged in`);
      this.routerExtensions.navigate(["/login"], {
        clearHistory: true,
        animated: false,
      });
      return;
    }

    this.routerExtensions
      .navigate([`/${route}`], {
        clearHistory: true,
        animated: false,
      })
      .then((success) => {
        console.log(`✅ Navigation to ${route} successful:`, success);
      })
      .catch((error) => {
        console.error(`❌ Navigation to ${route} failed:`, error);

        setTimeout(() => {
          console.log(`🔄 Retrying navigation to ${route}...`);
          this.routerExtensions.navigate([`/${route}`], {
            clearHistory: false,
            animated: false,
          });
        }, 100);
      });
  }

  getTabClasses(tab: string): string {
    return `tab-item ${this.activeTab === tab ? "active" : ""}`;
  }

  getIconClasses(tab: string): string {
    return `tab-icon ${this.activeTab === tab ? "active" : ""}`;
  }

  getLabelClasses(tab: string): string {
    return `tab-label ${this.activeTab === tab ? "active" : ""}`;
  }

  getIndicatorClasses(tab: string): string {
    return `tab-indicator ${this.activeTab === tab ? "active" : ""}`;
  }
}