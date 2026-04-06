import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getClientFirebaseApp } from '../utils/firebase-client';

type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'closed';

type AdminLead = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  consultationType: string;
  preferredDate?: string;
  preferredTimeSlot: string;
  message?: string;
  status: LeadStatus;
  createdAt?: string;
  updatedAt?: string;
};

@Component({
  selector: 'app-admin-page',
  imports: [FormsModule, DatePipe],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.scss'
})
export class AdminPage {
  protected readonly statusOptions: LeadStatus[] = ['new', 'contacted', 'scheduled', 'closed'];

  protected email = '';
  protected password = '';
  protected authMessage = '';
  protected isLoadingAuth = false;

  protected isAuthenticated = false;
  protected adminEmail = '';
  protected idToken = '';

  protected leads: AdminLead[] = [];
  protected statusFilter = '';
  protected leadLimit = 25;
  protected isLoadingLeads = false;
  protected leadsError = '';
  protected updatingLeadId = '';

  constructor(private readonly meta: Meta) {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow, noarchive' });
  }

  protected async login(): Promise<void> {
    this.isLoadingAuth = true;
    this.authMessage = '';

    try {
      const app = await getClientFirebaseApp();
      const auth = getAuth(app);
      const credential = await signInWithEmailAndPassword(auth, this.email.trim(), this.password);
      this.idToken = await credential.user.getIdToken();
      this.adminEmail = credential.user.email ?? this.email.trim();
      this.isAuthenticated = true;
      this.password = '';
      await this.loadLeads();
    } catch {
      this.authMessage = 'Login failed. Ensure this account exists and has admin role in Firestore.';
      this.isAuthenticated = false;
      this.idToken = '';
    } finally {
      this.isLoadingAuth = false;
    }
  }

  protected async logout(): Promise<void> {
    try {
      const app = await getClientFirebaseApp();
      await signOut(getAuth(app));
    } catch {
      // Keep logout resilient even if auth cleanup fails.
    }

    this.isAuthenticated = false;
    this.idToken = '';
    this.adminEmail = '';
    this.leads = [];
  }

  protected async loadLeads(): Promise<void> {
    if (!this.idToken) {
      this.leadsError = 'Not authenticated.';
      return;
    }

    this.isLoadingLeads = true;
    this.leadsError = '';

    try {
      const params = new URLSearchParams({
        limit: String(this.leadLimit)
      });

      if (this.statusFilter) {
        params.set('status', this.statusFilter);
      }

      const response = await fetch(`/api/admin/leads?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${this.idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed admin lead request');
      }

      const payload = (await response.json()) as { leads?: AdminLead[] };
      this.leads = Array.isArray(payload.leads) ? payload.leads : [];
    } catch {
      this.leadsError = 'Unable to load leads. Verify admin role and backend deployment.';
    } finally {
      this.isLoadingLeads = false;
    }
  }

  protected async updateLeadStatus(leadId: string, status: string): Promise<void> {
    if (!this.idToken || !leadId) {
      return;
    }

    if (!this.statusOptions.includes(status as LeadStatus)) {
      this.leadsError = 'Unsupported status update.';
      return;
    }

    this.updatingLeadId = leadId;

    try {
      const response = await fetch(`/api/admin/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.idToken}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed status update');
      }

      this.leads = this.leads.map((lead) => {
        if (lead.id !== leadId) {
          return lead;
        }

        return {
          ...lead,
          status: status as LeadStatus
        };
      });
    } catch {
      this.leadsError = 'Unable to update lead status right now.';
    } finally {
      this.updatingLeadId = '';
    }
  }
}
