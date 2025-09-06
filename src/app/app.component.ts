import { Component } from '@angular/core'
import { NotificationsService } from './services/notifications.service'
import { FaultDetectionService } from './services/fault-detection.service'

@Component({
  selector: 'ns-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  activeTab = 'dashboard';

  constructor(
    private notificationsService: NotificationsService,
    private faultDetectionService: FaultDetectionService
  ) {
    this.initializeApp()
  }

  private initializeApp(): void {
    this.notificationsService.initialize()
    this.faultDetectionService.startBackgroundMonitoring()
  }

  onTabSelect(tabName: string): void {
    if (this.activeTab !== tabName) {
      this.activeTab = tabName;
    }
  }

  getTabClasses(tabName: string): string {
    const baseClasses = 'nav-item';
    const activeClass = 'nav-item-active';
    
    return this.activeTab === tabName 
      ? `${baseClasses} ${activeClass}`
      : baseClasses;
  }

  getIconClasses(tabName: string): string {
    const baseClasses = 'nav-icon';
    const activeClass = 'nav-icon-active';
    
    return this.activeTab === tabName 
      ? `${baseClasses} ${activeClass}`
      : baseClasses;
  }

  getLabelClasses(tabName: string): string {
    const baseClasses = 'nav-label';
    const activeClass = 'nav-label-active';
    
    return this.activeTab === tabName 
      ? `${baseClasses} ${activeClass}`
      : baseClasses;
  }

  getIndicatorClasses(tabName: string): string {
    const baseClasses = 'nav-indicator';
    const activeClass = 'nav-indicator-active';
    
    return this.activeTab === tabName 
      ? `${baseClasses} ${activeClass}`
      : baseClasses;
  }
}