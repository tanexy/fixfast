import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "@nativescript/angular";

import { FaultDetectionComponent } from "./components/fault-detection/fault-detection.component";
import { ReportFormComponent } from "./components/report-form/report-form.component";
import { SignalDetectionComponent } from "./components/signal-detection/signal-detection.component";
import { TicketsComponent } from "./components/tickets/tickets.component";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";
import { LoginComponent } from "./components/login/login.component";
import { SignupComponent } from "./components/signup/signup.component";
import { UserManagementComponent } from "./components/user-management/user-management.component";
import{UserTasksComponent} from "./components/user-tasks/user-tasks.component"
import{InventoryComponent} from "./components/inventory/inventory.component"

const routes: Routes = [
  {
    path: "",
    redirectTo: "/login",
    pathMatch: "full",
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "fault-detection",
    component: FaultDetectionComponent,
  },
  {
    path: "report-form",
    component: ReportFormComponent,
  },
  {
    path: "tickets",
    component: TicketsComponent,
  },
  {
    path: "signal-detection",
    component: SignalDetectionComponent,
  },
  {
    path: "profile",
    component: UserProfileComponent,
  },
  {
    path: "signup",
    component: SignupComponent,
  },
  {
    path: "users",
    component: UserManagementComponent,
  },
  {
    path: "usertasks",
    component: UserTasksComponent,
  },
  {
    path: "inventory",
    component: InventoryComponent,
  },
];

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {}
