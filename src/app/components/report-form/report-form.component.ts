import { Component, OnInit } from '@angular/core'
import { RouterExtensions } from '@nativescript/angular'
import { TicketService } from '../../services/ticket.service'
import { NotificationsService } from '../../services/notifications.service'

export interface FaultReport {
  title: string
  description: string
  location: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  attachments: string[]
  reporterName: string
  reporterContact: string
}

@Component({
  selector: 'ns-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.css']
})
export class ReportFormComponent implements OnInit {
  report: FaultReport = {
    title: '',
    description: '',
    location: '',
    severity: 'medium',
    attachments: [],
    reporterName: '',
    reporterContact: ''
  }

  severityOptions = [
    { key: 'low', display: 'Low Priority' },
    { key: 'medium', display: 'Medium Priority' },
    { key: 'high', display: 'High Priority' },
    { key: 'critical', display: 'Critical' }
  ]

  isSubmitting: boolean = false

  constructor(
    private ticketService: TicketService,
    private notificationsService: NotificationsService,
    private routerExtensions: RouterExtensions
  ) {}

  ngOnInit(): void {}

  onSubmit(): void {
    if (!this.validateForm()) {
      return
    }

    this.isSubmitting = true
    
    this.ticketService.createTicket(this.report).then(() => {
      this.notificationsService.showSuccess('Report submitted successfully!')
      this.resetForm()
      this.routerExtensions.navigate(['/tickets'])
    }).catch(error => {
      this.notificationsService.showError('Failed to submit report. Please try again.')
      console.error('Report submission error:', error)
    }).finally(() => {
      this.isSubmitting = false
    })
  }

  addAttachment(): void {
    // TODO: Implement camera/gallery picker
    console.log('Add attachment functionality')
  }

  removeAttachment(index: number): void {
    this.report.attachments.splice(index, 1)
  }

  private validateForm(): boolean {
    if (!this.report.title.trim()) {
      this.notificationsService.showError('Please enter a title')
      return false
    }
    
    if (!this.report.description.trim()) {
      this.notificationsService.showError('Please enter a description')
      return false
    }
    
    if (!this.report.location.trim()) {
      this.notificationsService.showError('Please specify a location')
      return false
    }

    return true
  }

  private resetForm(): void {
    this.report = {
      title: '',
      description: '',
      location: '',
      severity: 'medium',
      attachments: [],
      reporterName: '',
      reporterContact: ''
    }
  }
}