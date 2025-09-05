import { NgModule } from '@angular/core'
import { Routes } from '@angular/router'
import { NativeScriptRouterModule } from '@nativescript/angular'

import { FaultDetectionComponent } from './components/fault-detection/fault-detection.component'
import { ReportFormComponent } from './components/report-form/report-form.component'
import { SignalDetectionComponent } from './components/signal-detection/signal-detection.component'
import { TicketsComponent } from './components/tickets/tickets.component'
import { UserProfileComponent } from './components/user-profile/user-profile.component'

const routes: Routes = [
  {
    path: '',
    redirectTo:
      '/(dashboardOutlet:fault-detection//reportOutlet:report-form//ticketsOutlet:tickets//networkOutlet:signal-detection//profileOutlet:profile)',
    pathMatch: 'full',
  },
  {
    path: 'fault-detection',
    component: FaultDetectionComponent,
    outlet: 'dashboardOutlet',
  },
  {
    path: 'report-form',
    component: ReportFormComponent,
    outlet: 'reportOutlet',
  },
  {
    path: 'tickets',
    component: TicketsComponent,
    outlet: 'ticketsOutlet',
  },
  {
    path: 'signal-detection',
    component: SignalDetectionComponent,
    outlet: 'networkOutlet',
  },
  {
    path: 'profile',
    component: UserProfileComponent,
    outlet: 'profileOutlet',
  },
]

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {}
