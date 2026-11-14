'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { dataService } from '@/services/dataService';
import { Search, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState('All Patient Conditions');
  const [loading, setLoading] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);

  // Add Patient State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    condition: 'Stable',
    doctorId: '',
  });
  const [patientErrors, setPatientErrors] = useState({});
  const [showAddSuccessAlert, setShowAddSuccessAlert] = useState(false);
  const [lastCreatedPatient, setLastCreatedPatient] = useState(null);

  // Edit Patient State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // Delete Confirmation State (SweetAlert-style modal)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Fetch Patients & Doctors
  async function fetchPatients() {
    setLoading(true);
    try {
      const res = await dataService.getPatients({
        page: currentPage,
        limit: 5,
        search,
        condition: conditionFilter,
      });
      setPatients(res.patients);
      setTotal(res.total);
      setTotalPages(res.totalPages);

      const docsRes = await dataService.getDoctors({ page: 1, limit: 100 });
      setAvailableDoctors(docsRes.doctors);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPatients();
  }, [currentPage, search, conditionFilter]);

  // Create Patient Handler
  async function handleCreatePatient(e) {
    e.preventDefault();
    const errors = {};
    if (!newPatient.name.trim()) errors.name = 'Patient name is required';
    if (!newPatient.age) errors.age = 'Patient age is required';
    if (!newPatient.phone.trim()) errors.phone = 'Phone number is required';

    const selectedDocId = newPatient.doctorId || (availableDoctors[0] ? availableDoctors[0]._id : 'doc-1');

    if (Object.keys(errors).length > 0) {
      setPatientErrors(errors);
      return;
    }

    const created = await dataService.createPatient({
      ...newPatient,
      age: Number(newPatient.age),
      doctorId: selectedDocId,
    });

    setIsAddModalOpen(false);
    setNewPatient({
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      condition: 'Stable',
      doctorId: '',
    });
    setPatientErrors({});
    setLastCreatedPatient(created);
    await fetchPatients();
    setShowAddSuccessAlert(true);
  }

  // Open Edit Modal
  function handleOpenEdit(patient) {
    const currentDocId = patient.doctorId?._id || patient.doctorId || '';
    setEditingPatient({
      ...patient,
      doctorId: currentDocId,
    });
    setIsEditModalOpen(true);
  }

  // Save Edit
  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingPatient) return;
    try {
      const payload = {
        name: editingPatient.name,
        age: Number(editingPatient.age),
        gender: editingPatient.gender,
        phone: editingPatient.phone,
        condition: editingPatient.condition,
        doctorId: editingPatient.doctorId?._id || editingPatient.doctorId,
        notes: editingPatient.notes || '',
      };
      await dataService.updatePatient(editingPatient._id, payload);
      setIsEditModalOpen(false);
      setEditingPatient(null);
      await fetchPatients();
    } catch (err) {
      console.error('Failed to update patient:', err);
      alert(err.message || 'Failed to update patient record');
    }
  }

  // Confirm Delete
  function handleOpenDelete(patient) {
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!patientToDelete) return;
    await dataService.deletePatient(patientToDelete._id);
    setIsDeleteModalOpen(false);
    setPatientToDelete(null);
    fetchPatients();
  }

  return (
    <AppLayout
      title="Dedicated Patient Management"
      subtitle="Universal patient registry with health condition tagging & assigned specialists"
      actionButton={
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add New Patient
        </Button>
      }
    >
      {/* CONDITION SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">All Patients</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{total}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
            Total
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Critical Cases</span>
            <div className="text-xl font-bold text-rose-700 mt-0.5">
              {patients.filter((p) => p.condition === 'Critical').length}
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Stable Cases</span>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">
              {patients.filter((p) => p.condition === 'Stable').length}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            ✓
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider">Follow-up / Rec.</span>
            <div className="text-xl font-bold text-teal-700 mt-0.5">
              {patients.filter((p) => p.condition === 'Follow-up' || p.condition === 'Recovered').length}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
            +
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Input
              placeholder="Search patients by name, phone, or condition..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="w-52">
            <Select
              value={conditionFilter}
              onChange={(e) => {
                setConditionFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                'All Patient Conditions',
                'Critical',
                'Stable',
                'Follow-up',
                'Recovered',
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Showing <span className="text-slate-900 font-bold">{patients.length}</span> of{' '}
            <span className="text-slate-900 font-bold">{total}</span> Patients
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Patient
          </Button>
        </div>
      </div>

      {/* PATIENTS TABLE */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200/70">
              <tr>
                <th className="py-3.5 px-6">Patient Name</th>
                <th className="py-3.5 px-5">Age / Gender</th>
                <th className="py-3.5 px-5">Contact Phone</th>
                <th className="py-3.5 px-5">Health Condition</th>
                <th className="py-3.5 px-5">Assigned Specialist</th>
                <th className="py-3.5 px-5">Admitted Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No patients found matching your search.
                  </td>
                </tr>
              ) : (
                patients.map((p) => {
                  const formattedDate = p.admittedDate ? p.admittedDate.split('T')[0] : '2026-11-12';

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px] shrink-0">
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="block text-slate-900 font-bold text-xs">{p.name}</span>
                            <span className="text-[11px] text-slate-400 font-normal">ID: #{p._id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        {p.age} Yrs <span className="text-slate-400">• {p.gender}</span>
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-500">{p.phone}</td>
                      <td className="py-4 px-5">
                        <Badge
                          variant={
                            p.condition === 'Critical'
                              ? 'danger'
                              : p.condition === 'Stable'
                              ? 'success'
                              : p.condition === 'Recovered'
                              ? 'teal'
                              : 'warning'
                          }
                          dot
                          pulse={p.condition === 'Critical'}
                        >
                          {p.condition}
                        </Badge>
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-semibold text-teal-700 block">{p.doctorName}</span>
                        <span className="text-[11px] text-slate-400">{p.doctorSpecialization}</span>
                      </td>
                      <td className="py-4 px-5 text-slate-600 font-mono text-[11px]">
                        {formattedDate}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition cursor-pointer select-none active:scale-95 shadow-2xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(p)}
                          className="px-2.5 py-1 rounded-lg text-rose-600 border border-transparent hover:border-rose-200 hover:bg-rose-50 font-semibold transition cursor-pointer select-none active:scale-95 shadow-2xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={total}
          itemsPerPage={5}
        />
      </Card>

      {/* ==================== EDIT PATIENT MODAL ==================== */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Patient Record"
        description="Update personal details, clinical health condition, and assigned specialist"
      >
        {editingPatient && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Full Patient Name *"
              value={editingPatient.name}
              onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Age *"
                type="number"
                value={editingPatient.age}
                onChange={(e) => setEditingPatient({ ...editingPatient, age: Number(e.target.value) })}
              />
              <Select
                label="Gender *"
                value={editingPatient.gender}
                onChange={(e) => setEditingPatient({ ...editingPatient, gender: e.target.value })}
                options={['Male', 'Female', 'Other']}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Contact Phone *"
                value={editingPatient.phone}
                onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
              />
              <Select
                label="Health Condition *"
                value={editingPatient.condition}
                onChange={(e) => setEditingPatient({ ...editingPatient, condition: e.target.value })}
                options={['Critical', 'Stable', 'Follow-up', 'Recovered']}
              />
            </div>

            <Select
              label="Assigned Specialist Doctor *"
              value={editingPatient.doctorId}
              onChange={(e) => {
                const doc = availableDoctors.find((d) => d._id === e.target.value);
                setEditingPatient({
                  ...editingPatient,
                  doctorId: e.target.value,
                  doctorName: doc ? doc.name : editingPatient.doctorName,
                  doctorSpecialization: doc ? doc.specialization : editingPatient.doctorSpecialization,
                });
              }}
              options={availableDoctors.map((doc) => ({
                value: doc._id,
                label: `${doc.name} (${doc.specialization} • ${doc.hospital})`,
              }))}
            />

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="outline" size="md" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Save Patient Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ==================== SWEETALERT-STYLE DELETE CONFIRMATION MODAL ==================== */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Patient Removal"
        maxWidth="max-w-md"
      >
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Are you sure you want to delete this patient?</h4>
          <p className="text-xs text-slate-500 mt-1">
            Patient record for <strong className="text-slate-800">{patientToDelete?.name}</strong> will be permanently
            removed from the database.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline" size="md" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleConfirmDelete}>
              Yes, Delete Patient
            </Button>
          </div>
        </div>
      </Modal>

      {/* ==================== CREATE PATIENT MODAL ==================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Patient"
        description="Add a new clinical admission case into the universal registry"
      >
        <form onSubmit={handleCreatePatient} className="space-y-4">
          <Input
            label="Full Patient Name *"
            placeholder="e.g. Tanvir Hassan"
            value={newPatient.name}
            onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
            error={patientErrors.name}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Age *"
              type="number"
              placeholder="e.g. 42"
              value={newPatient.age}
              onChange={(e) => setNewPatient({ ...newPatient, age: Number(e.target.value) })}
              error={patientErrors.age}
            />
            <Select
              label="Gender *"
              value={newPatient.gender}
              onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
              options={['Male', 'Female', 'Other']}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Phone *"
              placeholder="+880 1711-234567"
              value={newPatient.phone}
              onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
              error={patientErrors.phone}
            />
            <Select
              label="Health Condition *"
              value={newPatient.condition}
              onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })}
              options={['Stable', 'Critical', 'Follow-up', 'Recovered']}
            />
          </div>

          {/* Assigned Doctor Dropdown */}
          <Select
            label="Assigned Specialist Doctor *"
            value={newPatient.doctorId}
            onChange={(e) => setNewPatient({ ...newPatient, doctorId: e.target.value })}
            options={[
              { value: '', label: 'Select Attending Specialist Doctor...' },
              ...availableDoctors.map((doc) => ({
                value: doc._id,
                label: `${doc.name} (${doc.specialization} • ${doc.hospital})`,
              })),
            ]}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="outline" size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Register Patient
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================== SWEETALERT-STYLE SUCCESS MODAL ==================== */}
      <Modal
        isOpen={showAddSuccessAlert}
        onClose={() => setShowAddSuccessAlert(false)}
        title="Patient Admission Confirmed"
        maxWidth="max-w-sm"
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Patient Admitted Successfully</h4>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            <strong className="text-slate-800">{lastCreatedPatient?.name || 'New Patient'}</strong> has been registered and assigned to attending specialist{' '}
            <strong className="text-teal-700">{lastCreatedPatient?.doctorName || 'Assigned Doctor'}</strong>.
          </p>
          <div className="mt-5">
            <Button variant="primary" size="md" className="w-full" onClick={() => setShowAddSuccessAlert(false)}>
              Done & View Records
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
