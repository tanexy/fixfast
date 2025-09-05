import { Component, OnInit } from '@angular/core'
import { TicketService } from '../../services/ticket.service'

export interface UserProfile {
  name: string
  email: string
  role: string
  department: string
  joinDate: Date
  totalTicketsReported: number
  totalTicketsResolved: number
}

export interface UserStats {
  ticketsThisMonth: number
  averageResolutionTime: number
  mostCommonIssueType: string
  lastActivity: Date
}

@Component({
  selector: 'ns-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  profile: UserProfile = {
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Facility Manager',
    department: 'Operations',
    joinDate: new Date('2022-01-15'),
    totalTicketsReported: 0,
    totalTicketsResolved: 0
  }

  stats: UserStats = {
    ticketsThisMonth: 0,
    averageResolutionTime: 0,
    mostCommonIssueType: 'HVAC Issues',
    lastActivity: new Date()
  }

  recentTickets: any[] = []

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadUserProfile()
    this.loadUserStats()
    this.loadRecentTickets()
  }

  loadUserProfile(): void {
    // TODO: Load from user service
    console.log('Loading user profile...')
  }

  loadUserStats(): void {
    this.stats = {
      ticketsThisMonth: 5,
      averageResolutionTime: 2.3,
      mostCommonIssueType: 'HVAC Issues',
      lastActivity: new Date()
    }
    
    this.profile.totalTicketsReported = 23
    this.profile.totalTicketsResolved = 18
  }

  loadRecentTickets(): void {
    this.ticketService.getTicketsByUser(this.profile.email).subscribe(tickets => {
      this.recentTickets = tickets.slice(0, 5) // Show last 5 tickets
    })
  }

  getTicketStatusColor(status: string): string {
    switch (status) {
      case 'open': return '#F44336'
      case 'in-progress': return '#FF9800'
      case 'resolved': return '#4CAF50'
      case 'closed': return '#9E9E9E'
      default: return '#2196F3'
    }
  }

  editProfile(): void {
    // TODO: Navigate to profile edit screen
    console.log('Edit profile')
  }

  logout(): void {
    // TODO: Implement logout
    console.log('Logout')
  }
}