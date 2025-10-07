import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { Http } from "@nativescript/core";
import { AuthService } from "./auth.service";
import { InventoryLog, Ticket, CreateTicketRequest, User } from "../enums/enums";
import { NotificationsService } from "./notifications.service";

@Injectable({
  providedIn: "root",
})
export class TicketService {
  private readonly API_BASE_URL = "https://c76cc83d4b5a.ngrok-free.app";

  private ticketsSubject = new BehaviorSubject<Ticket[]>([]);
  private tasksSubject = new BehaviorSubject<Task[]>([]);

  constructor(private authService: AuthService,private notificationsService: NotificationsService) {
    this.loadTickets();
  }

  /**
   * Get all tickets as Observable
   */
  getTickets(): Observable<Ticket[]> {
    return this.ticketsSubject.asObservable();
  }

  /**
   * Get all tasks as Observable
   */
  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  /**
   * Load all tickets from backend
   */
  async loadTickets(): Promise<void> {
    try {
      const token = this.authService.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await Http.request({
        url: `${this.API_BASE_URL}/services/alltickets`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.statusCode !== 200) {
        if (!response.content) {
          throw new Error("No response from server");
        }
        const errorData = response.content.toJSON();
        throw new Error(errorData.message || "Failed to fetch tickets");
      }

      if (!response.content) {
        throw new Error("No response from server");
      }

      const data = response.content.toJSON();
      const tickets = this.mapBackendTickets(data);
      this.ticketsSubject.next(tickets);
    } catch (error: any) {
      console.error("Load tickets error:", error);
      throw new Error(error.message || "Failed to load tickets");
    }
  }

  /**
   * Get tickets for a specific user by ID (returns Observable)
   */
  getTicketsByUser(userId: string): Observable<Ticket[]> {
    const userTicketsSubject = new BehaviorSubject<Ticket[]>([]);

    this.loadTicketsByUser(userId)
      .then((tickets) => {
        userTicketsSubject.next(tickets);
      })
      .catch((error) => {
        console.error("Get user tickets error:", error);
        userTicketsSubject.next([]);
      });

    return userTicketsSubject.asObservable();
  }

  /**
   * Load tickets for a specific user by ID
   */
  async loadTicketsByUser(userId: string): Promise<Ticket[]> {
    try {
      const token = this.authService.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await Http.request({
        url: `${this.API_BASE_URL}/services/get-tickets/${userId}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.statusCode !== 200) {
        if (!response.content) {
          throw new Error("No response from server");
        }
        const errorData = response.content.toJSON();
        throw new Error(errorData.message || "Failed to fetch user tickets");
      }

      if (!response.content) {
        throw new Error("No response from server");
      }

      const data = response.content.toJSON();
      return this.mapBackendTickets(data);
    } catch (error: any) {
      console.error("Load user tickets error:", error);
      throw new Error(error.message || "Failed to fetch user tickets");
    }
  }

  /**
   * Get ticket by ID from local cache
   */
  getTicketById(id: string): Ticket | undefined {
    return this.ticketsSubject.value.find((ticket) => ticket.id === id);
  }

  /**
   * Create a new ticket
   */
  async createTicket(reportData: CreateTicketRequest): Promise<Ticket> {
    try {
      const token = this.authService.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await Http.request({
        url: `${this.API_BASE_URL}/services/create-ticket`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        content: JSON.stringify({
          title: reportData.title,
          description: reportData.description,
          severity: reportData.severity,
          location: reportData.location,
          reporterContact: reportData.reporterContact,
          attachments: reportData.attachments || [],
        }),
      });

      if (response.statusCode !== 201 && response.statusCode !== 200) {
        if (!response.content) {
          throw new Error("No response from server");
        }
        const errorData = response.content.toJSON();
        throw new Error(errorData.message || "Failed to create ticket");
      }

      if (!response.content) {
        throw new Error("No response from server");
      }

      const data = response.content.toJSON();
      const newTicket = this.mapBackendTicket(data);

      // Update local cache
      const currentTickets = this.ticketsSubject.value;
      this.ticketsSubject.next([newTicket, ...currentTickets]);

      return newTicket;
    } catch (error: any) {
      console.error("Create ticket error:", error);
      throw new Error(error.message || "Failed to create ticket");
    }
  }

  /**
   * Get all faults from backend
   */
  async getFaults(): Promise<any[]> {
    try {
      const token = this.authService.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await Http.request({
        url: `${this.API_BASE_URL}/services/faults`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.statusCode !== 200) {
        if (!response.content) {
          throw new Error("No response from server");
        }
        const errorData = response.content.toJSON();
        throw new Error(errorData.message || "Failed to fetch faults");
      }

      if (!response.content) {
        throw new Error("No response from server");
      }

      return response.content.toJSON();
    } catch (error: any) {
      console.error("Get faults error:", error);
      throw new Error(error.message || "Failed to fetch faults");
    }
  }

  /**
   * Load all tasks
   */
  async loadTasks(): Promise<void> {
    try {
      const token = this.authService.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await Http.request({
        url: `${this.API_BASE_URL}/services/tasks`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.statusCode !== 200) {
        if (!response.content) {
          throw new Error("No response from server");
        }
        const errorData = response.content.toJSON();
        throw new Error(errorData.message || "Failed to fetch tasks");
      }

      if (!response.content) {
        throw new Error("No response from server");
      }

      const data = response.content.toJSON();
      this.tasksSubject.next(data);
    } catch (error: any) {
      console.error("Load tasks error:", error);
      throw new Error(error.message || "Failed to load tasks");
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<Task> {
    try {
      const token = this.authService.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await Http.request({
        url: `${this.API_BASE_URL}/services/tasks/${id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.statusCode !== 200) {
        if (!response.content) {
          throw new Error("No response from server");
        }
        const errorData = response.content.toJSON();
        throw new Error(errorData.message || "Failed to fetch task");
      }

      if (!response.content) {
        throw new Error("No response from server");
      }

      return response.content.toJSON();
    } catch (error: any) {
      console.error("Get task error:", error);
      throw new Error(error.message || "Failed to fetch task");
    }
  }

  //Update ticket status

  async updateTicketStatus(
    ticketId: string,
    status: Ticket["status"]
  ): Promise<void> {
    try {
      const token = this.authService.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await Http.request({
        url: `${this.API_BASE_URL}/services/tickets/${ticketId}/status`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        content: JSON.stringify({ status }),
      });

      if (response.statusCode !== 200) {
        if (!response.content) {
          throw new Error("No response from server");
        }
        const errorData = response.content.toJSON();
        throw new Error(errorData.message || "Failed to update ticket status");
      }

      // Update local cache
      const tickets = this.ticketsSubject.value;
      const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
      if (ticketIndex !== -1) {
        tickets[ticketIndex].status = status;
        tickets[ticketIndex].updatedAt = new Date();
        this.ticketsSubject.next([...tickets]);
      }
    } catch (error: any) {
      console.error("Update ticket status error:", error);
      throw new Error(error.message || "Failed to update ticket status");
    }
  }

  // Assign ticket to user

  async assignTicket(ticketId: string, assignee: string): Promise<void> {
    try {
      const token = this.authService.getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await Http.request({
        url: `${this.API_BASE_URL}/services/tickets/${ticketId}/assign`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        content: JSON.stringify({ assignee }),
      });

      if (response.statusCode !== 200) {
        if (!response.content) {
          throw new Error("No response from server");
        }
        const errorData = response.content.toJSON();
        throw new Error(errorData.message || "Failed to assign ticket");
      }

      // Update local cache
      const tickets = this.ticketsSubject.value;
      const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
      if (ticketIndex !== -1) {
        tickets[ticketIndex].assignedTo = assignee;
        tickets[ticketIndex].updatedAt = new Date();
        this.ticketsSubject.next([...tickets]);
      }
    } catch (error: any) {
      console.error("Assign ticket error:", error);
      throw new Error(error.message || "Failed to assign ticket");
    }
  }

  /**
   * Map backend ticket data to frontend Ticket interface
   */
  private mapBackendTicket(data: any): Ticket {
    return {
      id: data.id || data.ID,
      title: data.title,
      description: data.description,
      status: data.status || "open",
      priority: data.priority || data.severity || "medium",
      location: data.location,
      assignedTo: data.assignedTo || data.assigned_to,
      reportedBy:
        data.reportedBy ||
        data.reported_by ||
        data.reporterContact ||
        "Anonymous",
      createdAt: new Date(data.createdAt || data.created_at),
      updatedAt: new Date(data.updatedAt || data.updated_at),
      attachments: data.attachments || [],
    };
  }

  /**
   * Map array of backend tickets
   */
  private mapBackendTickets(data: any): Ticket[] {
    if (Array.isArray(data)) {
      return data.map((ticket) => this.mapBackendTicket(ticket));
    } else if (data.tickets && Array.isArray(data.tickets)) {
      return data.tickets.map((ticket: any) => this.mapBackendTicket(ticket));
    }
    return [];
  }

  async submitInventory(inventoryLog: InventoryLog): Promise<any> {
    const token = this.authService.getToken();
    inventoryLog.equipment = inventoryLog.equipment.map((eq) => ({
      ...eq,
      total: Number(eq.total),
      functioning: Number(eq.functioning),
      inRepair: Number(eq.inRepair),
      replaced: Number(eq.replaced),
      newlyBought: Number(eq.newlyBought),
    }));

    const response = await Http.request({
      url: `${this.API_BASE_URL}/services/create-inventory-log`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      content: JSON.stringify(inventoryLog),
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return JSON.parse(response.content.toString());
    } else {
      throw new Error(`Failed to submit inventory: ${response.statusCode}`);
    }
  }
  async getInventoryLog(): Promise<any> {
    try {
      const token = this.authService.getToken();

      const response = await Http.request({
        url: `${this.API_BASE_URL}/services/inventory-logs`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.statusCode !== 200) {
        console.error("API error:", response.content.toString());
        throw new Error(
          `Failed to fetch inventory log: ${response.statusCode}`
        );
      }

      // Safely parse JSON
      let result: InventoryLog | null = null;
      try {
        result = response.content.toJSON() as InventoryLog;
        
      } catch (err) {
        console.error(
          "Failed to parse JSON:",
          err,
          response.content.toString()
        );
      }

      return result;
    } catch (err) {
      console.error("getInventoryLog error:", err);
      return null; // safely return null if something goes wrong
    }
  }
  async getUsers(): Promise<any[]> {
    try {
      const token = this.authService.getToken();

      const response = await Http.request({
        url: `${this.API_BASE_URL}/services/users`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.statusCode !== 200) {
        console.error("API error:", response.content.toString());
        throw new Error(`Failed to fetch users: ${response.statusCode}`);
      }

      // Safely parse JSON
      let result: any[] | null = null;
      try {
        result = response.content.toJSON() as any[];
        console.log("result", result);
      } catch (err) {
        console.error(
          "Failed to parse JSON:",
          err,
          response.content.toString()
        );
      }

      return result;
    } catch (err) {
      console.error("getInventoryLog error:", err);
      return null; // safely return null if something goes wrong
    }
  }
  async deleteUser(userId: number): Promise<void> {
    try {
      const token = this.authService.getToken();

      const response = await Http.request({
        url: `${this.API_BASE_URL}/services/delete-user/${userId}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.statusCode == 200) {
       this.notificationsService.showSuccess("User deleted successfully");
      }
      else{
        this.notificationsService.showError("Failed to delete user");

      }
    } catch (err) {
      console.error("deleteUser error:", err);
      throw new Error("Failed to delete user");
    }
  }
  async changeRole(userId: number): Promise<void> {
    try {
      const token = this.authService.getToken();

      const response = await Http.request({
        url: `${this.API_BASE_URL}/services/change-role/${userId}`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        
      });
      if (response.statusCode == 200) {
       this.notificationsService.showSuccess("User role updated successfully");
      }
      else{
        this.notificationsService.showError("Failed to update user role");

      }
    } catch (err) {
      console.error("changeRole error:", err);
      throw new Error("Failed to change user role");
    }
  }
  async revokeAdminRights(userId: number): Promise<void> {
    try {
      const token = this.authService.getToken();

      const response = await Http.request({
        url: `${this.API_BASE_URL}/services/revoke-admin-rights/${userId}`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        
      });
      if (response.statusCode == 200) {
       this.notificationsService.showSuccess("Admin rights revoked successfully");
      }
      else{
        this.notificationsService.showError("Failed to revoke admin rights");

      }
    } catch (err) {
      console.error("revokeAdminRights error:", err);
      throw new Error("Failed to revoke admin rights");
    }
  }
}
