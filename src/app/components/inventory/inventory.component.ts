import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { NotificationsService } from "../../services/notifications.service";
import { TicketService } from "~/app/services/ticket.service";
import { InventoryLog, EquipmentItem } from "../../enums/enums";
import { from } from "rxjs";

@Component({
  selector: "ns-inventory",
  templateUrl: "./inventory.component.html",
  styleUrls: ["./inventory.component.css"],
})
export class InventoryComponent implements OnInit {
  // Predefined equipment types
  equipmentTypes = [
    { id: 1, name: "Laptops", category: "Computing" },
    { id: 2, name: "Desktop Computers", category: "Computing" },
    { id: 3, name: "Monitors", category: "Computing" },
    { id: 4, name: "Generators", category: "Power" },
    { id: 5, name: "UPS Systems", category: "Power" },
    { id: 6, name: "Printers", category: "Peripherals" },
    { id: 7, name: "Network Switches", category: "Network" },
    { id: 8, name: "Routers", category: "Network" },
    { id: 9, name: "Servers", category: "Infrastructure" },
    { id: 10, name: "Projectors", category: "Presentation" },
    { id: 19, name: "Others", category: "Others" },
  ];

  inventoryLog: InventoryLog = {
    dateLogged: new Date(),
    loggedBy: "Current User",
    equipment: [],
    notes: "",
  };

  currentEquipment: EquipmentItem = this.getEmptyEquipment();
  isSubmitting = false;
  isEditMode = false;
  editingIndex: number = -1;
  showAddForm = false;
  selectedEquipmentId: number = 0;
  savedInventory: any[] = [];
  customItemName: string = "";
  showCustomNameInput: boolean = false;

  constructor(
    private notificationsService: NotificationsService,
    private routerExtensions: RouterExtensions,
    private invService: TicketService
  ) {}

  ngOnInit(): void {
    console.log("Inventory component initialized");
    this.loadSavedInventory();
  }

  getEmptyEquipment(): EquipmentItem {
    return {
      id: 0,
      name: "",
      category: "",
      total: 0,
      functioning: 0,
      inRepair: 0,
      replaced: 0,
      newlyBought: 0,
    };
  }

  // Get available equipment (not yet added to inventory)
  getAvailableEquipment() {
    return this.equipmentTypes.filter(
      (eq) => !this.inventoryLog.equipment.find((inv) => inv.id === eq.id)
    );
  }

  // Show add form with selected equipment
  selectEquipmentToAdd(equipment: any): void {
    if (equipment.id === 19) {
      // Others category
      this.showCustomNameInput = true;
      this.customItemName = "";
    } else {
      this.showCustomNameInput = false;
    }

    this.currentEquipment = {
      ...this.getEmptyEquipment(),
      id: equipment.id,
      name: equipment.name,
      category: equipment.category,
    };
    this.isEditMode = false;
    this.editingIndex = -1;
    this.showAddForm = true;
    this.selectedEquipmentId = equipment.id;
    console.log("Selected equipment:", equipment.name);
  }

  // Edit existing equipment
  editEquipment(index: number): void {
    const item = this.inventoryLog.equipment[index];
    this.currentEquipment = { ...item };
    this.isEditMode = true;
    this.editingIndex = index;
    this.showAddForm = true;
    this.selectedEquipmentId = item.id;

    if (item.id === 19) {
      this.showCustomNameInput = true;
      this.customItemName = item.name !== "Others" ? item.name : "";
    } else {
      this.showCustomNameInput = false;
    }

    console.log("Editing equipment:", item.name);
  }

  validateCounts(): boolean {
    const total = this.currentEquipment.total;
    const sum =
      Number(this.currentEquipment.functioning) +
      Number(this.currentEquipment.inRepair) +
      Number(this.currentEquipment.replaced);

    if (sum > total) {
      console.log("total", total);
      console.log("sum", sum);
      this.notificationsService.showError(
        "Sum of functioning, in repair, and replaced cannot exceed total"
      );
      return false;
    }
    return true;
  }

  addOrUpdateEquipment(): void {
    if (this.currentEquipment.id === 0) {
      this.notificationsService.showError("Please select equipment type");
      return;
    }

    if (this.showCustomNameInput && !this.customItemName.trim()) {
      this.notificationsService.showError(
        "Please enter item name for Others category"
      );
      return;
    }

    if (this.currentEquipment.total <= 0) {
      this.notificationsService.showError("Please enter a valid total count");
      return;
    }

    if (!this.validateCounts()) {
      return;
    }

    // Update name if custom name is provided
    if (this.showCustomNameInput && this.customItemName.trim()) {
      this.currentEquipment.name = this.customItemName.trim();
    }

    if (this.isEditMode && this.editingIndex >= 0) {
      // Update existing
      this.inventoryLog.equipment[this.editingIndex] = {
        ...this.currentEquipment,
      };
      this.notificationsService.showSuccess("Equipment updated");
    } else {
      // Add new
      this.inventoryLog.equipment.push({ ...this.currentEquipment });
      this.notificationsService.showSuccess("Equipment added");
    }

    this.cancelAddForm();
  }

  removeEquipment(index: number): void {
    const removed = this.inventoryLog.equipment.splice(index, 1);
    this.notificationsService.showSuccess(`${removed[0].name} removed`);

    if (this.currentEquipment.id === removed[0].id) {
      this.cancelAddForm();
    }
  }

  cancelAddForm(): void {
    this.currentEquipment = this.getEmptyEquipment();
    this.isEditMode = false;
    this.editingIndex = -1;
    this.showAddForm = false;
    this.selectedEquipmentId = 0;
    this.showCustomNameInput = false;
    this.customItemName = "";
  }

  isFormValid(): boolean {
    return this.inventoryLog.equipment.length > 0;
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) {
      this.notificationsService.showError(
        "Please add at least one equipment entry"
      );
      return;
    }

    this.isSubmitting = true;
    console.log("📊 Submitting inventory log:", this.inventoryLog);

    try {
      var response = await this.invService.submitInventory(this.inventoryLog);
      if (response) {
        this.isSubmitting = false;
        this.resetForm();
        this.loadSavedInventory(); // Reload saved inventory after submission
      }
    } catch (error: any) {
      this.isSubmitting = false;
      this.notificationsService.showError(error);
    }
  }

  private resetForm(): void {
    this.inventoryLog = {
      dateLogged: new Date(),
      loggedBy: "Current User",
      equipment: [],
      notes: "",
    };
    this.cancelAddForm();
  }

  getEquipmentSummary(): string {
    const total = this.inventoryLog.equipment.reduce(
      (sum, e) => sum + e.total,
      0
    );
    return `${this.inventoryLog.equipment.length} types • ${total} total items`;
  }

  async loadSavedInventory(): Promise<void> {
    const data = await this.invService.getInventoryLog();
    console.log("Loaded inventory data:", data);

    if (data && Array.isArray(data)) {
      this.savedInventory = data;
    }
  }


  getCategoryIcon(category: string): string {
    const icons: any = {
      Computing: "💻",
      Power: "⚡",
      Peripherals: "🖨️",
      Network: "🌐",
      Infrastructure: "🏢",
      Presentation: "📽️",
      Others: "📦",
    };
    return icons[category] || "📋";
  }
}
