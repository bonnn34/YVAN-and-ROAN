"use client"

import React, { useState, useEffect } from 'react';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { Plus, Search, Trash2, Edit2, Star, CheckCircle, XCircle, Clock, Users as UsersIcon, Download, RefreshCw, X, UserRound, CalendarCheck, Minus, Info, UserPlus, Check, MessageSquareText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Playfair_Display } from 'next/font/google';
import { cinzel } from '@/lib/fonts';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['500', '600'] });

const MIN_PAX = 1;
const MAX_PAX = 20;

/** Form label: readable sentence-case text with a Required / Optional tag. */
function FieldLabel({ htmlFor, children, required = false }: { htmlFor?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="flex items-center justify-between gap-2 text-[13px] font-medium text-dash-ink">
      <span>{children}</span>
      {required ? (
        <span className="rounded-full bg-dash-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-dash-primary">Required</span>
      ) : (
        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Optional</span>
      )}
    </label>
  );
}

// Types
export type GuestStatus = 'pending' | 'confirmed' | 'declined' | 'request';

export interface Companion {
  name: string;
  relationship: string;
}

export interface Guest {
  id: string;
  name: string;
  role: string;
  email?: string;
  contact?: string;
  message?: string;
  allowedGuests: number;
  companions: Companion[];
  tableNumber: string;
  isVip: boolean;
  status: GuestStatus;
  addedBy?: string; // Track who added the guest
  createdAt?: string;
}

interface ImprovedGuestListProps {
  guests: Guest[];
  onUpdateGuest: (guest: Guest) => void;
  onDeleteGuest: (id: string) => void;
  onAddGuest: (guest: Omit<Guest, 'id'>) => Promise<void>;
}

export const ImprovedGuestList: React.FC<ImprovedGuestListProps> = ({ 
  guests, 
  onUpdateGuest, 
  onDeleteGuest, 
  onAddGuest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | GuestStatus>('all');
  const [vipFilter, setVipFilter] = useState<boolean | 'all'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedGuestName, setSavedGuestName] = useState('');
  const [operationType, setOperationType] = useState<'add' | 'edit' | 'delete'>('add');

  // Form State
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formAllowedGuests, setFormAllowedGuests] = useState(1);
  const [formCompanions, setFormCompanions] = useState<Companion[]>([]);
  const [formTable, setFormTable] = useState('');
  const [formIsVip, setFormIsVip] = useState(false);
  const [formStatus, setFormStatus] = useState<GuestStatus>('pending');
  const [formAddedBy, setFormAddedBy] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);

  useBodyScrollLock(showModal || showSuccessModal || Boolean(guestToDelete));

  // Escape cancels the delete confirmation
  useEffect(() => {
    if (!guestToDelete) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGuestToDelete(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [guestToDelete]);

  // Sync companions array with allowedGuests count
  useEffect(() => {
    const companionCount = Math.max(0, formAllowedGuests - 1);
    if (formCompanions.length !== companionCount) {
      const newCompanions = [...formCompanions];
      if (newCompanions.length < companionCount) {
        // Add slots
        for (let i = newCompanions.length; i < companionCount; i++) {
          newCompanions.push({ name: '', relationship: '' });
        }
      } else {
        // Remove slots
        newCompanions.splice(companionCount);
      }
      setFormCompanions(newCompanions);
    }
  }, [formAllowedGuests]);

  // Filter guests
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredGuests = guests.filter(g => {
    const guestName = typeof g.name === 'string' ? g.name.toLowerCase() : '';
    const guestRole = typeof g.role === 'string' ? g.role.toLowerCase() : '';
    const companions = Array.isArray(g.companions) ? g.companions : [];
    const matchesSearch = g.status !== 'request' &&
      (guestName.includes(normalizedSearchTerm) ||
       guestRole.includes(normalizedSearchTerm) ||
       companions.some(c =>
         (typeof c?.name === 'string' ? c.name.toLowerCase() : '').includes(normalizedSearchTerm)
       ));
    
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    const matchesVip = vipFilter === 'all' || g.isVip === vipFilter;
    
    return matchesSearch && matchesStatus && matchesVip;
  });

  const resetForm = () => {
    setShowHelp(false);
    setFormName('');
    setFormRole('');
    setFormEmail('');
    setFormContact('');
    setFormMessage('');
    setFormAllowedGuests(1);
    setFormCompanions([]);
    setFormTable('');
    setFormIsVip(false);
    setFormStatus('pending');
    setFormAddedBy('');
    setEditingGuest(null);
  };

  const handleEdit = (guest: Guest) => {
    setShowHelp(false);
    setEditingGuest(guest);
    setFormName(guest.name);
    setFormRole(guest.role);
    setFormEmail(guest.email || '');
    setFormContact(guest.contact || '');
    setFormMessage(guest.message || '');
    setFormAllowedGuests(guest.allowedGuests);
    setFormCompanions(guest.companions || []);
    setFormTable(guest.tableNumber);
    setFormIsVip(guest.isVip);
    setFormStatus(guest.status);
    setFormAddedBy(guest.addedBy || '');
    setShowModal(true);
  };

  const handleCompanionChange = (index: number, field: keyof Companion, value: string) => {
    setFormCompanions(prev => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setOperationType(editingGuest ? 'edit' : 'add');
    
    const guestData = {
      name: formName,
      role: formRole,
      email: formEmail,
      contact: formContact,
      message: formMessage,
      allowedGuests: formAllowedGuests,
      companions: formCompanions,
      tableNumber: formTable,
      isVip: formIsVip,
      status: formStatus,
      addedBy: formAddedBy,
      createdAt: editingGuest?.createdAt || new Date().toISOString(),
    };

    try {
      if (editingGuest) {
        onUpdateGuest({ ...editingGuest, ...guestData });
      } else {
        await onAddGuest(guestData);
      }
      
      // Store guest name for success modal
      setSavedGuestName(formName);
      
      // Wait a bit for the save to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving guest:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setShowModal(false);
    resetForm();
  };

  // Delete asks first in a styled dialog; confirmDeleteGuest does the work
  const handleDeleteGuest = (guest: Guest) => {
    setGuestToDelete(guest);
  };

  const confirmDeleteGuest = async () => {
    const guest = guestToDelete;
    if (!guest) return;
    setGuestToDelete(null);

    setIsSaving(true);
    setOperationType('delete');
    setSavedGuestName(guest.name);

    try {
      onDeleteGuest(guest.id);
      
      // Wait a bit for the delete to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error deleting guest:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    // Create CSV content
    let csv = 'Name,Role,Email,Contact,Status,Allowed Guests,Table,VIP,Added By,Companions\n';
    
    filteredGuests.forEach(guest => {
      const companionsStr = guest.companions
        .map(c => `${c.name} (${c.relationship})`)
        .join('; ');
      
      csv += `"${guest.name}","${guest.role}","${guest.email || ''}","${guest.contact || ''}","${guest.status}",${guest.allowedGuests},"${guest.tableNumber}","${guest.isVip}","${guest.addedBy || ''}","${companionsStr}"\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guest-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: GuestStatus) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'declined': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: GuestStatus) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-700 border-green-300',
      declined: 'bg-red-100 text-red-700 border-red-300',
      pending: 'bg-amber-100 text-amber-700 border-amber-300',
      request: 'bg-blue-100 text-blue-700 border-blue-300',
    };
    return colors[status] || colors.pending;
  };

  // Statistics
  const stats = {
    total: filteredGuests.length,
    confirmed: filteredGuests.filter(g => g.status === 'confirmed').length,
    pending: filteredGuests.filter(g => g.status === 'pending').length,
    declined: filteredGuests.filter(g => g.status === 'declined').length,
    vip: filteredGuests.filter(g => g.isVip).length,
    totalPax: filteredGuests.reduce((sum, g) => sum + g.allowedGuests, 0),
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-dash-border shadow-sm">
          <div className="text-xl sm:text-2xl font-bold text-dash-primary">{stats.total}</div>
          <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">Total Invitations</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200 shadow-sm">
          <div className="text-xl sm:text-2xl font-bold text-green-700">{stats.confirmed}</div>
          <div className="text-[10px] sm:text-xs text-gray-600 uppercase tracking-wide">Confirmed</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 sm:p-4 border border-amber-200 shadow-sm">
          <div className="text-xl sm:text-2xl font-bold text-amber-700">{stats.pending}</div>
          <div className="text-[10px] sm:text-xs text-gray-600 uppercase tracking-wide">Pending</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-200 shadow-sm">
          <div className="text-xl sm:text-2xl font-bold text-red-700">{stats.declined}</div>
          <div className="text-[10px] sm:text-xs text-gray-600 uppercase tracking-wide">Declined</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200 shadow-sm">
          <div className="text-xl sm:text-2xl font-bold text-purple-700">{stats.vip}</div>
          <div className="text-[10px] sm:text-xs text-gray-600 uppercase tracking-wide">VIP Guests</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200 shadow-sm">
          <div className="text-xl sm:text-2xl font-bold text-blue-700">{stats.totalPax}</div>
          <div className="text-[10px] sm:text-xs text-gray-600 uppercase tracking-wide">Total Pax</div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row gap-2.5 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name, role, or companion..." 
            className="w-full pl-10 pr-4 py-2.5 border border-dash-border rounded-lg focus:outline-none focus:ring-2 focus:ring-dash-focus"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-dash-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dash-focus text-sm"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>

          <select 
            value={String(vipFilter)}
            onChange={(e) => setVipFilter(e.target.value === 'all' ? 'all' : e.target.value === 'true')}
            className="border border-dash-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dash-focus text-sm"
          >
            <option value="all">All Guests</option>
            <option value="true">VIP Only</option>
            <option value="false">Regular</option>
          </select>

          <Button 
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="border-dash-border text-dash-primary hover:bg-dash-border"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-dash-primary text-white hover:bg-dash-ink"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Guest cards (phones) */}
      <div className="space-y-3 md:hidden">
        {filteredGuests.length === 0 ? (
          <div className="rounded-xl border border-dash-border bg-white px-4 py-12 text-center text-gray-400">
            <UsersIcon className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm">No guests found matching your filters</p>
          </div>
        ) : (
          filteredGuests.map(guest => (
            <div key={guest.id} className="rounded-xl border border-dash-border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {guest.isVip && <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" />}
                    <p className="truncate font-semibold text-gray-900">{guest.name}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{guest.role}</p>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border ${getStatusBadge(guest.status)} flex items-center gap-1`}>
                  {getStatusIcon(guest.status)}
                  <span className="capitalize">{guest.status}</span>
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-dash-surface px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Pax</p>
                  <p className="mt-0.5 font-semibold text-dash-primary">{guest.allowedGuests}</p>
                </div>
                <div className="rounded-lg bg-dash-surface px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Table</p>
                  <p className="mt-0.5 font-semibold text-gray-700">{guest.tableNumber || 'TBD'}</p>
                </div>
              </div>

              {(guest.email || guest.contact) && (
                <div className="mt-3 space-y-0.5 text-xs text-gray-600 [overflow-wrap:anywhere]">
                  {guest.email && <p>{guest.email}</p>}
                  {guest.contact && <p className="text-gray-500">{guest.contact}</p>}
                </div>
              )}

              <div className="mt-3 flex gap-2 border-t border-dash-tint pt-3">
                <button
                  onClick={() => handleEdit(guest)}
                  className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-dash-border text-sm font-medium text-dash-ink transition-colors active:bg-dash-surface"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteGuest(guest)}
                  disabled={isSaving}
                  className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-100 text-sm font-medium text-red-600 transition-colors active:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Guest Table (tablet & desktop) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-dash-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dash-border text-dash-ink">
              <tr>
                <th className="px-3 py-3 sm:px-6 font-semibold uppercase text-xs">Name</th>
                <th className="px-3 py-3 sm:px-6 font-semibold uppercase text-xs">Role</th>
                <th className="px-3 py-3 sm:px-6 font-semibold uppercase text-xs">Contact</th>
                <th className="px-3 py-3 sm:px-6 font-semibold uppercase text-xs text-center">Pax</th>
                <th className="px-3 py-3 sm:px-6 font-semibold uppercase text-xs text-center">Table</th>
                <th className="px-3 py-3 sm:px-6 font-semibold uppercase text-xs text-center">Status</th>
                <th className="px-3 py-3 sm:px-6 font-semibold uppercase text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-border">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 sm:px-6 py-12 text-center text-gray-400">
                    <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No guests found matching your filters</p>
                  </td>
                </tr>
              ) : (
                filteredGuests.map(guest => (
                  <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          {guest.isVip && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                          <span className="font-medium text-gray-800">{guest.name}</span>
                        </div>
                        {guest.addedBy && (
                          <div className="mt-1 text-[9px] text-gray-400">Added by: {guest.addedBy}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 text-gray-600 text-sm">{guest.role}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 text-xs">
                      {guest.email && <div className="text-gray-600">{guest.email}</div>}
                      {guest.contact && <div className="text-gray-500">{guest.contact}</div>}
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 text-center">
                      <span className="text-sm font-semibold text-dash-primary">{guest.allowedGuests}</span>
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 text-center">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">
                        {guest.tableNumber || 'TBD'}
                      </span>
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="flex items-center justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(guest.status)} flex items-center gap-1`}>
                          {getStatusIcon(guest.status)}
                          <span className="capitalize">{guest.status}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={() => handleEdit(guest)} 
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Edit guest"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteGuest(guest)} 
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete guest"
                          disabled={isSaving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-0 sm:items-center sm:p-4">
          <div className="dash-sheet bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-4xl max-h-[94dvh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* Loading Overlay */}
            {isSaving && (
              <div className="absolute inset-0 z-50 flex items-center justify-center rounded-t-2xl bg-dash-bg/90 backdrop-blur-sm sm:rounded-2xl" role="status" aria-live="polite">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-dash-border border-t-dash-primary" />
                  <p className={`${playfair.className} text-lg font-semibold text-dash-ink`}>
                    {editingGuest ? 'Saving changes…' : 'Adding guest…'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">This only takes a moment.</p>
                </div>
              </div>
            )}

            <div className="sticky top-0 z-20 border-b border-dash-border bg-dash-bg/95 px-4 pt-3 pb-4 backdrop-blur-sm sm:px-6 sm:py-5">
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-300/70 sm:hidden" aria-hidden />
              <button
                type="button"
                onClick={() => setShowHelp(v => !v)}
                aria-label="How adding a guest works"
                aria-expanded={showHelp}
                aria-controls="guest-form-help"
                className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-colors sm:left-auto sm:right-16 sm:top-5 ${
                  showHelp ? 'border-dash-accent bg-dash-accent text-white' : 'border-dash-border bg-white text-dash-primary hover:bg-dash-tint'
                }`}
              >
                <Info className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-dash-border bg-white text-gray-500 shadow-sm transition-colors hover:text-dash-ink sm:right-5 sm:top-5"
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </button>
              <div className="px-10 text-center sm:px-0 sm:pr-24 sm:text-left">
                <p className={`${cinzel.className} text-[10px] font-semibold uppercase tracking-[0.28em] text-dash-accent`}>
                  Guest Invitation
                </p>
                <h2 className={`${playfair.className} mt-1 text-[1.45rem] font-semibold leading-tight text-dash-ink sm:text-2xl`}>
                  {editingGuest ? 'Edit Invitation' : 'Create Invitation'}
                </h2>
                <div className="mx-auto mt-2 flex w-28 items-center gap-1.5 sm:mx-0" aria-hidden>
                  <span className="h-px flex-1 bg-dash-line" />
                  <span className="h-1 w-1 rotate-45 bg-dash-accent" />
                  <span className="h-px flex-1 bg-dash-line sm:hidden" />
                </div>
                <p className="mx-auto mt-2 max-w-xs text-[11px] leading-relaxed text-gray-500 sm:mx-0 sm:max-w-none sm:text-xs">
                  {editingGuest ? 'Update seating, or correct details the guest asked you to change.' : 'Add a guest so they can find their name and RSVP on your invitation.'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="px-4 pt-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* How it works — opens from the ⓘ button in the header */}
              {showHelp && (
                <div id="guest-form-help" className="rounded-xl border border-dash-border bg-dash-surface px-3.5 py-3 text-[12px] leading-relaxed text-dash-text sm:text-[13px]">
                  <p className="font-semibold text-dash-ink">
                    Adding <span className="text-dash-primary">{formName.trim() || 'a guest'}</span> makes their name searchable on your invitation.
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dash-accent" />They search their name in the RSVP section and confirm if they can attend.</li>
                    <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dash-accent" />They add their own phone, email, companions and message.</li>
                    <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dash-accent" />Allowed guests = seats they can confirm, including themselves.</li>
                    <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dash-accent" />Table shows on &quot;Find your table&quot; and the Book of Guests.</li>
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                {/* Primary Guest Section */}
                <div className="space-y-4">
                  <h3 className={`${cinzel.className} flex items-center gap-2 border-b border-dash-border pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-dash-primary sm:text-xs`}>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dash-tint"><UserRound className="h-3.5 w-3.5" /></span>
                    Guest Details
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <FieldLabel htmlFor="guest-name" required>Full name</FieldLabel>
                      <input 
                        id="guest-name"
                        required 
                        autoComplete="off"
                        value={formName} 
                        onChange={e => setFormName(e.target.value)} 
                        type="text" 
                        placeholder="e.g., Maria Santos"
                        className="w-full border border-dash-border rounded-xl bg-dash-bg px-3 py-2.5 transition-colors focus:bg-white focus:border-dash-focus focus:ring-2 focus:ring-dash-focus/40 outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <FieldLabel htmlFor="guest-role">Relationship</FieldLabel>
                      <input 
                        id="guest-role"
                        value={formRole} 
                        onChange={e => setFormRole(e.target.value)} 
                        type="text" 
                        placeholder="e.g., Friend, Family, Colleague"
                        className="w-full border border-dash-border rounded-xl bg-dash-bg px-3 py-2.5 transition-colors focus:bg-white focus:border-dash-focus focus:ring-2 focus:ring-dash-focus/40 outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <FieldLabel htmlFor="guest-added-by">Added by</FieldLabel>
                      <input 
                        id="guest-added-by"
                        value={formAddedBy} 
                        onChange={e => setFormAddedBy(e.target.value)} 
                        type="text" 
                        placeholder="e.g., Bride, Groom, Family"
                        className="w-full border border-dash-border rounded-xl bg-dash-bg px-3 py-2.5 transition-colors focus:bg-white focus:border-dash-focus focus:ring-2 focus:ring-dash-focus/40 outline-none" 
                      />
                    </div>
                  </div>
                </div>

                {/* Seating & Party Section
                    (email, contact, RSVP status and message come from the guest's own RSVP on the site,
                    so they aren't edited here — existing values are kept when saving) */}
                <div className="space-y-4">
                  <h3 className={`${cinzel.className} flex items-center gap-2 border-b border-dash-border pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-dash-primary sm:text-xs`}>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dash-tint"><CalendarCheck className="h-3.5 w-3.5" /></span>
                    Seating & Invitation
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <FieldLabel htmlFor="allowed-pax" required>Allowed guests</FieldLabel>
                      {/* Stepper: − count + */}
                      <div className="flex items-stretch overflow-hidden rounded-xl border border-dash-border bg-dash-bg focus-within:border-dash-focus focus-within:ring-2 focus-within:ring-dash-focus/40">
                        <button
                          type="button"
                          onClick={() => setFormAllowedGuests(n => Math.max(MIN_PAX, n - 1))}
                          disabled={formAllowedGuests <= MIN_PAX}
                          aria-label="Decrease allowed pax"
                          className="flex w-12 shrink-0 items-center justify-center border-r border-dash-border text-dash-primary transition-colors hover:bg-dash-tint active:bg-dash-border disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="flex min-w-0 flex-1 flex-col items-center justify-center py-1.5">
                          <input
                            id="allowed-pax"
                            type="number"
                            inputMode="numeric"
                            min={MIN_PAX}
                            max={MAX_PAX}
                            value={formAllowedGuests}
                            onChange={e => {
                              const n = parseInt(e.target.value)
                              setFormAllowedGuests(Number.isNaN(n) ? MIN_PAX : Math.min(MAX_PAX, Math.max(MIN_PAX, n)))
                            }}
                            className="dash-stepper-input w-16 bg-transparent text-center text-xl font-bold leading-none text-dash-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                            {formAllowedGuests === 1 ? 'guest' : 'guests'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormAllowedGuests(n => Math.min(MAX_PAX, n + 1))}
                          disabled={formAllowedGuests >= MAX_PAX}
                          aria-label="Increase allowed pax"
                          className="flex w-12 shrink-0 items-center justify-center border-l border-dash-border text-dash-primary transition-colors hover:bg-dash-tint active:bg-dash-border disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <FieldLabel htmlFor="guest-table">Table</FieldLabel>
                        <input 
                          id="guest-table"
                          value={formTable} 
                          onChange={e => setFormTable(e.target.value)} 
                          type="text" 
                          placeholder="e.g., 5 or VIP-A"
                          className="w-full border border-dash-border rounded-xl bg-dash-bg px-3 py-2.5 transition-colors focus:bg-white focus:border-dash-focus focus:ring-2 focus:ring-dash-focus/40 outline-none" 
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="flex items-center justify-between gap-2 text-[13px] font-medium text-dash-ink">
                          <span>Guest type</span>
                          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Optional</span>
                        </span>
                        <label
                          htmlFor="vip-check"
                          className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold leading-normal transition-colors ${
                            formIsVip ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-dash-border bg-dash-bg text-dash-ink'
                          }`}
                        >
                          <input
                            id="vip-check"
                            type="checkbox"
                            checked={formIsVip}
                            onChange={e => setFormIsVip(e.target.checked)}
                            className="sr-only"
                          />
                          <Star className={`h-4 w-4 ${formIsVip ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
                          VIP Guest
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest's RSVP response — only when editing, so the couple can fix details
                  a guest asks them to correct. New invitations leave these to the guest. */}
              {editingGuest && (
                <div className="space-y-4 rounded-2xl border border-dash-border bg-dash-bg p-3.5 sm:p-5">
                  <div>
                    <h3 className={`${cinzel.className} flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-dash-primary sm:text-xs`}>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white ring-1 ring-dash-border"><MessageSquareText className="h-3.5 w-3.5" /></span>
                      Guest&apos;s RSVP Response
                    </h3>
                    <p className="mt-1.5 text-[11px] leading-snug text-gray-500 sm:text-xs">
                      Submitted by the guest. Edit only when they ask you to correct something.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                      <FieldLabel htmlFor="guest-status">RSVP status</FieldLabel>
                      <div id="guest-status" role="radiogroup" className="grid grid-cols-3 gap-2">
                        {([
                          { value: 'confirmed', label: 'Attending', active: 'border-green-300 bg-green-50 text-green-700' },
                          { value: 'pending', label: 'Pending', active: 'border-amber-300 bg-amber-50 text-amber-700' },
                          { value: 'declined', label: 'Declined', active: 'border-red-200 bg-red-50 text-red-700' },
                        ] as const).map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            role="radio"
                            aria-checked={formStatus === opt.value}
                            onClick={() => setFormStatus(opt.value)}
                            className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                              formStatus === opt.value ? opt.active : 'border-dash-border bg-white text-gray-500 hover:text-dash-ink'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <FieldLabel htmlFor="guest-contact">Phone</FieldLabel>
                      <input
                        id="guest-contact"
                        type="tel"
                        value={formContact}
                        onChange={e => setFormContact(e.target.value)}
                        placeholder="09XX XXX XXXX"
                        className="w-full border border-dash-border rounded-xl bg-dash-bg px-3 py-2.5 transition-colors focus:bg-white focus:border-dash-focus focus:ring-2 focus:ring-dash-focus/40 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <FieldLabel htmlFor="guest-email">Email</FieldLabel>
                      <input
                        id="guest-email"
                        type="email"
                        value={formEmail === 'Pending' ? '' : formEmail}
                        onChange={e => setFormEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full border border-dash-border rounded-xl bg-dash-bg px-3 py-2.5 transition-colors focus:bg-white focus:border-dash-focus focus:ring-2 focus:ring-dash-focus/40 outline-none"
                      />
                    </div>
                  </div>

                  {formCompanions.length > 0 && (
                    <div className="space-y-2">
                      <p className="flex items-center justify-between text-[13px] font-medium text-dash-ink">
                        <span>Companions</span>
                        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                          {formCompanions.filter(c => c.name.trim()).length} of {formCompanions.length} named
                        </span>
                      </p>
                      {formCompanions.map((comp, idx) => (
                        <div key={idx} className="grid grid-cols-[1.75rem_1fr] gap-2 sm:grid-cols-[1.75rem_1fr_1fr]">
                          <span className="row-span-2 mt-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-dash-primary ring-1 ring-dash-border sm:row-span-1">
                            {idx + 2}
                          </span>
                          <input
                            aria-label={`Guest ${idx + 2} name`}
                            value={comp.name}
                            onChange={e => handleCompanionChange(idx, 'name', e.target.value)}
                            placeholder="Full name"
                            className="w-full border border-dash-border rounded-xl bg-dash-bg px-3 py-2.5 transition-colors focus:bg-white focus:border-dash-focus focus:ring-2 focus:ring-dash-focus/40 outline-none"
                          />
                          <input
                            aria-label={`Guest ${idx + 2} relationship`}
                            value={comp.relationship}
                            onChange={e => handleCompanionChange(idx, 'relationship', e.target.value)}
                            placeholder="Relationship"
                            className="w-full border border-dash-border rounded-xl bg-dash-bg px-3 py-2.5 transition-colors focus:bg-white focus:border-dash-focus focus:ring-2 focus:ring-dash-focus/40 outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1">
                    <FieldLabel htmlFor="guest-message">Message to the couple</FieldLabel>
                    <textarea
                      id="guest-message"
                      rows={3}
                      value={formMessage}
                      onChange={e => setFormMessage(e.target.value)}
                      placeholder="No message yet"
                      className="w-full border border-dash-border rounded-xl bg-dash-bg px-3 py-2.5 transition-colors focus:bg-white focus:border-dash-focus focus:ring-2 focus:ring-dash-focus/40 outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-2 border-t border-dash-border bg-white px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:flex-row sm:justify-end sm:gap-3 sm:px-0 sm:pt-6 sm:pb-0">
                <Button 
                  type="button" 
                  onClick={() => { setShowModal(false); resetForm(); }}
                  variant="outline"
                  className="h-11 w-full rounded-full border-dash-border px-7 text-sm font-medium text-gray-600 hover:bg-dash-surface hover:text-dash-ink sm:w-auto"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="h-11 w-full rounded-full px-8 text-sm font-semibold tracking-wide bg-dash-primary text-white shadow-[0_10px_22px_-10px_color-mix(in_srgb,var(--color-dash-ink)_70%,transparent)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving…
                    </span>
                  ) : editingGuest ? (
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Save Changes
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Add to Guest List
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {guestToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-dash-ink-strong/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-guest-title"
          aria-describedby="delete-guest-desc"
          onClick={() => setGuestToDelete(null)}
        >
          <div
            className="dash-sheet w-full max-w-sm overflow-hidden rounded-t-3xl border border-dash-danger-border bg-dash-bg shadow-[0_30px_60px_-25px_color-mix(in_srgb,var(--color-dash-ink-strong)_55%,transparent)] sm:rounded-3xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 pt-4 pb-6 text-center sm:pt-7">
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-300/70 sm:hidden" aria-hidden />
              <span className="dash-pop-badge mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-dash-danger-soft ring-8 ring-dash-danger-softer">
                <AlertTriangle className="h-6 w-6 text-dash-danger-text" />
              </span>
              <p className={`${cinzel.className} mt-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-dash-danger-text/80`}>
                Remove guest
              </p>
              <h3 id="delete-guest-title" className={`${playfair.className} mt-1 text-[1.4rem] font-semibold leading-tight text-dash-ink`}>
                Delete this invitation?
              </h3>

              <div className="mx-auto mt-4 max-w-[17rem] rounded-2xl border border-dash-border bg-white px-4 py-3">
                <p className={`${playfair.className} flex items-center justify-center gap-1.5 text-base font-semibold text-dash-ink [overflow-wrap:anywhere]`}>
                  {guestToDelete.isVip && <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" />}
                  {guestToDelete.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {guestToDelete.allowedGuests} {guestToDelete.allowedGuests === 1 ? 'seat' : 'seats'}
                  {guestToDelete.tableNumber ? ` · Table ${guestToDelete.tableNumber}` : ''}
                  {` · ${guestToDelete.status.charAt(0).toUpperCase()}${guestToDelete.status.slice(1)}`}
                </p>
              </div>

              <p id="delete-guest-desc" className="mx-auto mt-3 max-w-[17rem] text-sm leading-relaxed text-gray-600">
                They&apos;ll be removed from your guest list and won&apos;t be able to find their name to RSVP. This can&apos;t be undone.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 pb-[env(safe-area-inset-bottom)] sm:flex-row sm:pb-0">
                <Button
                  type="button"
                  variant="outline"
                  autoFocus
                  onClick={() => setGuestToDelete(null)}
                  className="h-11 w-full rounded-full border-dash-border bg-white text-sm font-medium text-dash-ink hover:bg-dash-surface sm:flex-1"
                >
                  Keep Guest
                </Button>
                <Button
                  type="button"
                  onClick={() => void confirmDeleteGuest()}
                  className="h-11 w-full rounded-full bg-dash-danger text-sm font-semibold text-white shadow-[0_10px_22px_-10px_color-mix(in_srgb,var(--color-dash-danger)_70%,transparent)] transition-all hover:brightness-110 active:scale-[0.99] sm:flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Yes, Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (() => {
        const isDelete = operationType === 'delete';
        const isEdit = operationType === 'edit';
        const title = isDelete ? 'Guest Removed' : isEdit ? 'Changes Saved' : 'Guest Added';
        const eyebrow = isDelete ? 'Guest list updated' : isEdit ? 'Invitation updated' : 'Invitation ready';
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-dash-ink-strong/45 p-4 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-success-title"
          >
            <div className="dash-pop relative w-full max-w-sm overflow-hidden rounded-3xl border border-dash-border bg-dash-bg shadow-[0_30px_60px_-25px_color-mix(in_srgb,var(--color-dash-ink-strong)_55%,transparent)]">
              {/* Header band */}
              <div className="relative overflow-hidden bg-dash-primary px-6 pt-7 pb-12 text-center">
                <span className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/10" aria-hidden />
                <span className="pointer-events-none absolute -right-8 top-6 h-20 w-20 rounded-full bg-white/10" aria-hidden />
                <p className={`${cinzel.className} relative text-[10px] font-semibold uppercase tracking-[0.3em] text-white/75`}>
                  {eyebrow}
                </p>
                <h3 id="guest-success-title" className={`${playfair.className} relative mt-1.5 text-[1.6rem] font-semibold leading-tight text-white`}>
                  {title}
                </h3>
              </div>

              {/* Badge overlapping the band */}
              <div className="relative -mt-9 flex justify-center">
                <span className="dash-pop-badge flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-4 border-dash-bg bg-white shadow-lg">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-full ${isDelete ? 'bg-dash-danger-soft text-dash-danger-text' : 'bg-dash-tint text-dash-primary'}`}>
                    {isDelete ? <Trash2 className="h-6 w-6" /> : <Check className="h-7 w-7" strokeWidth={2.5} />}
                  </span>
                </span>
              </div>

              <div className="px-6 pt-4 pb-6 text-center">
                <p className={`${playfair.className} text-lg font-semibold text-dash-ink [overflow-wrap:anywhere]`}>
                  {savedGuestName}
                </p>
                <div className="mx-auto mt-2 flex w-24 items-center gap-1.5" aria-hidden>
                  <span className="h-px flex-1 bg-dash-line" />
                  <span className="h-1 w-1 rotate-45 bg-dash-accent" />
                  <span className="h-px flex-1 bg-dash-line" />
                </div>
                <p className="mx-auto mt-3 max-w-[17rem] text-sm leading-relaxed text-gray-600">
                  {isDelete
                    ? 'has been removed from your guest list and can no longer RSVP.'
                    : isEdit
                      ? 'is up to date. Your changes are saved to the guest list.'
                      : 'can now search their name on your invitation and confirm their RSVP.'}
                </p>

                <div className="mt-6 flex flex-col gap-2">
                  <Button
                    onClick={handleSuccessModalClose}
                    className="h-11 w-full rounded-full bg-dash-primary text-sm font-semibold tracking-wide text-white shadow-[0_10px_22px_-10px_color-mix(in_srgb,var(--color-dash-ink)_70%,transparent)] transition-all hover:brightness-110 active:scale-[0.99]"
                  >
                    Done
                  </Button>
                  {operationType === 'add' && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setShowSuccessModal(false); resetForm(); }}
                      className="h-11 w-full rounded-full border-dash-border bg-white text-sm font-medium text-dash-ink hover:bg-dash-surface"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Another Guest
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Global Loading Modal (for delete operations) */}
      {isSaving && !showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dash-ink-strong/45 p-4 backdrop-blur-[2px]" role="status" aria-live="polite">
          <div className="dash-pop w-full max-w-xs rounded-3xl border border-dash-border bg-dash-bg p-7 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-dash-border border-t-dash-primary" />
            <h3 className={`${playfair.className} text-lg font-semibold text-dash-ink`}>
              {operationType === 'delete' ? 'Removing guest…' : 'Saving…'}
            </h3>
            <p className="mt-1 text-xs text-gray-500">This only takes a moment.</p>
          </div>
        </div>
      )}
    </div>
  );
};

