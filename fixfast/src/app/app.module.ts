import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptModule } from '@nativescript/angular'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'

// Components
import { FaultDetectionComponent } from './components/fault-detection/fault-detection.component'
import { ReportFormComponent } from './components/report-form/report-form.component'
import { SignalDetectionComponent } from './components/signal-detection/signal-detection.component'
import { TicketsComponent } from './components/tickets/tickets.component'
import { UserProfileComponent } from './components/user-profile/user-profile.component'

// Services
import { FaultDetectionService } from './services/fault-detection.service'
import { NotificationsService } from './services/notifications.service'
import { TicketService } from './services/ticket.service'
import { NetworkService } from './services/network.service'

@NgModule({
  bootstrap: [AppComponent],
  imports: [NativeScriptModule, AppRoutingModule],
  declarations: [
    AppComponent,
    FaultDetectionComponent,
    ReportFormComponent, 
    SignalDetectionComponent,
    TicketsComponent,
    UserProfileComponent
  ],
  providers: [
    FaultDetectionService,
    NotificationsService,
    TicketService,
    NetworkService
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}