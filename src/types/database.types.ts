// Hand-authored to match supabase/migrations/0001_init_schema.sql
// Once the project is linked to the Supabase CLI, regenerate with:
//   npx supabase gen types typescript --project-id jyadvumukpmivghattyg > src/types/database.types.ts

export type UserRole =
  | "admin" | "manager" | "decorator" | "photographer"
  | "videographer" | "driver" | "designer" | "freelancer";

export type BookingStatus =
  | "new" | "contacted" | "meeting" | "quotation_sent" | "negotiation"
  | "confirmed" | "decoration_started" | "completed" | "cancelled";

export type BookingPriority = "low" | "medium" | "high" | "urgent";
export type ContactMethod = "phone" | "email" | "whatsapp";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";
export type QuotationStatus = "draft" | "sent" | "approved" | "rejected" | "expired";
export type InvoiceStatus = "draft" | "sent" | "partial" | "paid" | "overdue" | "cancelled";
export type PaymentMethod = "cash" | "bank" | "card" | "stripe" | "other";
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";
export type NotificationType =
  | "new_booking" | "payment_received" | "upcoming_event" | "staff_assignment"
  | "reminder" | "quotation_approved" | "invoice_paid" | "system";

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: {
      create_booking_public: {
        Args: {
          p_full_name: string;
          p_phone: string;
          p_email: string | null;
          p_preferred_contact: ContactMethod;
          p_event_type: string;
          p_event_date: string;
          p_event_time: string | null;
          p_venue: string | null;
          p_guest_count: number | null;
          p_budget: number | null;
          p_theme: string | null;
          p_color_preferences: string | null;
          p_custom_notes: string | null;
          p_services: string[];
        };
        Returns: { id: string; booking_code: string }[];
      };
    };
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          designation: string | null;
          is_active: boolean;
          hourly_rate: number | null;
          monthly_salary: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & {
          id: string;
          full_name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          email: string | null;
          preferred_contact: ContactMethod;
          address: string | null;
          budget_range_min: number | null;
          budget_range_max: number | null;
          favorite_decorations: string[] | null;
          is_favorite: boolean;
          tags: string[];
          notes: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["customers"]["Row"]> & {
          full_name: string;
          phone: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Row"]>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          booking_code: string;
          customer_id: string | null;
          full_name: string;
          phone: string;
          email: string | null;
          preferred_contact: ContactMethod;
          event_type: string;
          event_date: string;
          event_time: string | null;
          venue: string | null;
          venue_lat: number | null;
          venue_lng: number | null;
          guest_count: number | null;
          budget: number | null;
          theme: string | null;
          color_preferences: string | null;
          custom_notes: string | null;
          status: BookingStatus;
          priority: BookingPriority;
          payment_status: PaymentStatus;
          quotation_status: QuotationStatus | null;
          invoice_status: InvoiceStatus | null;
          assigned_staff_id: string | null;
          is_favorite: boolean;
          labels: string[];
          color_tag: string | null;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bookings"]["Row"]> & {
          full_name: string;
          phone: string;
          event_type: string;
          event_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
        Relationships: [];
      };
      booking_services: {
        Row: {
          id: string;
          booking_id: string;
          service_name: string;
          notes: string | null;
          estimated_price: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["booking_services"]["Row"]> & {
          booking_id: string;
          service_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["booking_services"]["Row"]>;
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          booking_id: string | null;
          customer_id: string | null;
          user_id: string | null;
          action: string;
          description: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["activity_logs"]["Row"]> & {
          action: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_logs"]["Row"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          type: NotificationType;
          title: string;
          message: string | null;
          link: string | null;
          is_read: boolean;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & {
          type: NotificationType;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };
      quotations: {
        Row: {
          id: string;
          quotation_number: string;
          booking_id: string;
          customer_id: string | null;
          version: number;
          status: QuotationStatus;
          items: Array<{ name: string; description?: string; qty: number; unit_price: number; total: number }>;
          subtotal: number;
          discount_type: string | null;
          discount_value: number | null;
          tax_percent: number | null;
          total: number;
          notes: string | null;
          valid_until: string | null;
          approved_at: string | null;
          approved_by_signature: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["quotations"]["Row"]> & {
          booking_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["quotations"]["Row"]>;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          booking_id: string;
          customer_id: string | null;
          quotation_id: string | null;
          status: InvoiceStatus;
          items: Array<{ name: string; description?: string; qty: number; unit_price: number; total: number }>;
          subtotal: number;
          discount_value: number | null;
          tax_percent: number | null;
          total: number;
          amount_paid: number;
          amount_due: number;
          due_date: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["invoices"]["Row"]> & {
          booking_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Row"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string | null;
          booking_id: string;
          customer_id: string | null;
          amount: number;
          method: PaymentMethod;
          is_advance: boolean;
          reference_number: string | null;
          receipt_url: string | null;
          paid_at: string;
          received_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
          booking_id: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          booking_id: string | null;
          assigned_to: string | null;
          title: string;
          description: string | null;
          status: TaskStatus;
          due_date: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tasks"]["Row"]> & { title: string };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
        Relationships: [];
      };
      staff_availability: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          is_available: boolean;
          note: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["staff_availability"]["Row"]> & {
          user_id: string;
          date: string;
        };
        Update: Partial<Database["public"]["Tables"]["staff_availability"]["Row"]>;
        Relationships: [];
      };
      vendor_payments: {
        Row: {
          id: string;
          vendor_id: string;
          booking_id: string | null;
          amount: number;
          paid_at: string;
          notes: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["vendor_payments"]["Row"]> & {
          vendor_id: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["vendor_payments"]["Row"]>;
        Relationships: [];
      };
      inventory_bookings: {
        Row: {
          id: string;
          inventory_id: string;
          booking_id: string;
          quantity_used: number;
          reserved_from: string | null;
          reserved_to: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["inventory_bookings"]["Row"]> & {
          inventory_id: string;
          booking_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["inventory_bookings"]["Row"]>;
        Relationships: [];
      };
      vendors: {
        Row: {
          id: string;
          name: string;
          category: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          rating: number | null;
          contract_url: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["vendors"]["Row"]> & {
          name: string;
          category: string;
        };
        Update: Partial<Database["public"]["Tables"]["vendors"]["Row"]>;
        Relationships: [];
      };
      inventory: {
        Row: {
          id: string;
          name: string;
          category: string;
          sku: string | null;
          barcode: string | null;
          qr_code: string | null;
          quantity: number;
          unit: string | null;
          supplier_id: string | null;
          purchase_price: number | null;
          is_available: boolean;
          location: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["inventory"]["Row"]> & {
          name: string;
          category: string;
        };
        Update: Partial<Database["public"]["Tables"]["inventory"]["Row"]>;
        Relationships: [];
      };
      settings: {
        Row: { key: string; value: unknown; updated_at: string };
        Insert: { key: string; value: unknown };
        Update: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
        Relationships: [];
      };
      customer_notes: {
        Row: {
          id: string;
          customer_id: string;
          booking_id: string | null;
          user_id: string | null;
          note: string;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["customer_notes"]["Row"]> & {
          customer_id: string;
          note: string;
        };
        Update: Partial<Database["public"]["Tables"]["customer_notes"]["Row"]>;
        Relationships: [];
      };
      files: {
        Row: {
          id: string;
          booking_id: string | null;
          customer_id: string | null;
          uploaded_by: string | null;
          file_name: string;
          file_url: string;
          file_type: string | null;
          file_size: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["files"]["Row"]> & {
          file_name: string;
          file_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["files"]["Row"]>;
        Relationships: [];
      };
    };
  };
}

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type BookingService = Database["public"]["Tables"]["booking_services"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Quotation = Database["public"]["Tables"]["quotations"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
export type InventoryItem = Database["public"]["Tables"]["inventory"]["Row"];
export type Settings = Database["public"]["Tables"]["settings"]["Row"];
export type CustomerNote = Database["public"]["Tables"]["customer_notes"]["Row"];
export type FileRecord = Database["public"]["Tables"]["files"]["Row"];
export type StaffUser = Database["public"]["Tables"]["users"]["Row"];
export type StaffAvailability = Database["public"]["Tables"]["staff_availability"]["Row"];
export type VendorPayment = Database["public"]["Tables"]["vendor_payments"]["Row"];
export type InventoryBooking = Database["public"]["Tables"]["inventory_bookings"]["Row"];
