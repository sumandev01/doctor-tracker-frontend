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
import {
  Plus,
  Search,
  X,
  UserPlus,
  Trash2,
  UserCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('All Specializations');
  const [loading, setLoading] = useState(false);
  const [showDoctorSuccess, setShowDoctorSuccess] = useState(false);

  // Add Doctor Modal State
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: 'Cardiology',
    hospital: '',
    phone: '',
    email: '',
    status: 'Active',
  });
  const [doctorErrors, setDoctorErrors] = useState({});

  // Slide-over Drawer State for Patient Pool
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Add Patient to Doctor State
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    condition: 'Stable',
  });

  // SweetAlert-style delete patient confirmation
  const [patientToRemove, setPatientToRemove] = useState(null);

  // Load doctors list
  async function fetchDoctors() {
    setLoading(true);
    try {
      const res = await dataService.getDoctors({
        page: currentPage,
        limit: 5,
        search,
        specialization,
      });
      setDoctors(res.doctors);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, [currentPage, search, specialization]);

  // Open Drawer & load doctor's assigned patients
  async function handleOpenDrawer(doctor) {
    setSelectedDoctor(doctor);
    setIsDrawerOpen(true);
    const patients = await dataService.getPatientsByDoctor(doctor._id);
    setDoctorPatients(patients);
  }

  // Create new doctor
  async function handleCreateDoctor(e) {
    e.preventDefault();
    const errors = {};
    if (!newDoctor.name.trim()) errors.name = 'Doctor name is required';
    if (!newDoctor.hospital.trim()) errors.hospital = 'Hospital name is required';
    if (!newDoctor.phone.trim()) errors.phone = 'Phone number is required';
    if (!newDoctor.email.trim()) errors.email = 'Email address is required';

    if (Object.keys(errors).length > 0) {
      setDoctorErrors(errors);
      return;
    }

    await dataService.createDoctor(newDoctor);
    setIsAddDoctorOpen(false);
    setNewDoctor({
      name: '',
      specialization: 'Cardiology',
      hospital: '',
      phone: '',
      email: '',
      status: 'Active',
    });
    setDoctorErrors({});
    await fetchDoctors();
    setShowDoctorSuccess(true);
  }

  // Add patient under specific doctor
  async function handleAddPatientToDoctor(e) {
    e.preventDefault();
    if (!newPatient.name.trim() || !newPatient.age || !newPatient.phone.trim()) return;

    await dataService.addPatientToDoctor(selectedDoctor._id, {
      ...newPatient,
      age: Number(newPatient.age),
    });

    setIsAddPatientOpen(false);
    setNewPatient({ name: '', age: '', gender: 'Male', phone: '', condition: 'Stable' });

    // Refresh drawer list and table
    const updated = await dataService.getPatientsByDoctor(selectedDoctor._id);
    setDoctorPatients(updated);
    fetchDoctors();
  }

  // Confirm Remove patient
  async function handleConfirmRemove() {
    if (!patientToRemove || !selectedDoctor) return;
    await dataService.removePatientFromDoctor(selectedDoctor._id, patientToRemove._id);
    const updated = await dataService.getPatientsByDoctor(selectedDoctor._id);
    setDoctorPatients(updated);
    setPatientToRemove(null);
    fetchDoctors();
  }

  return (
    <AppLayout
      title="Doctor Directory & Management"
      subtitle="Manage medical staff, search specialists & review assigned patient pools"
      actionButton={
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddDoctorOpen(true)}
        >
          Add New Doctor
        </Button>
      }
    >
      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Input
              placeholder="Search by doctor name, specialization, or hospital..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Specialization Filter */}
          <div className="w-48">
            <Select
              value={specialization}
              onChange={(e) => {
                setSpecialization(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                'All Specializations',
                'Cardiology',
                'Neurology',
                'Pediatrics',
                'Orthopedics',
                'Dermatology',
                'Gynecology',
                'General Surgery',
              ]}
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="text-slate-900 font-bold">{doctors.length}</span> of{' '}
          <span className="text-slate-900 font-bold">{total}</span> Doctors
        </div>
      </div>

      {/* DOCTORS TABLE */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200/70">
              <tr>
                <th className="py-3.5 px-6">Doctor Details</th>
                <th className="py-3.5 px-5">Specialization</th>
                <th className="py-3.5 px-5">Hospital Affiliation</th>
                <th className="py-3.5 px-5">Phone</th>
                <th className="py-3.5 px-5">Assigned Patients</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No doctors found matching your criteria.
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => {
                  const isSelected = selectedDoctor?._id === doc._id && isDrawerOpen;

                  return (
                    <tr
                      key={doc._id}
                      className={`hover:bg-slate-50/70 transition ${
                        isSelected ? 'bg-teal-50/40 border-l-4 border-l-teal-600' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                          {doc.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="block text-slate-900 font-bold text-xs">{doc.name}</span>
                          <span className="text-[11px] text-slate-400 font-normal">{doc.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-medium text-slate-800">{doc.specialization}</td>
                      <td className="py-4 px-5 text-slate-600">{doc.hospital}</td>
                      <td className="py-4 px-5 font-mono text-slate-500">{doc.phone}</td>
                      <td className="py-4 px-5">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(doc)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px] hover:bg-teal-200 transition"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{doc.patientCount || 0} Patients</span>
                        </button>
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant={doc.status === 'Active' ? 'success' : 'warning'} dot>
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDrawer(doc)}
                        >
                          View Patients
                        </Button>
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

      {/* ==================== CREATE DOCTOR MODAL ==================== */}
      <Modal
        isOpen={isAddDoctorOpen}
        onClose={() => setIsAddDoctorOpen(false)}
        title="Create New Doctor"
        description="Register a specialized medical practitioner in the directory"
      >
        <form onSubmit={handleCreateDoctor} className="space-y-4">
          <Input
            label="Doctor Name *"
            placeholder="Dr. Sarah Jenkins"
            value={newDoctor.name}
            onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
            error={doctorErrors.name}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Specialization *"
              value={newDoctor.specialization}
              onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
              options={[
                'Cardiology',
                'Neurology',
                'Pediatrics',
                'Orthopedics',
                'Dermatology',
                'Gynecology',
                'General Surgery',
              ]}
            />
            <Select
              label="Initial Status"
              value={newDoctor.status}
              onChange={(e) => setNewDoctor({ ...newDoctor, status: e.target.value })}
              options={['Active', 'On Leave']}
            />
          </div>

          <Input
            label="Hospital Affiliation *"
            placeholder="Dhaka Medical College & Hospital"
            value={newDoctor.hospital}
            onChange={(e) => setNewDoctor({ ...newDoctor, hospital: e.target.value })}
            error={doctorErrors.hospital}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number *"
              placeholder="+880 1712-345678"
              value={newDoctor.phone}
              onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
              error={doctorErrors.phone}
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="doctor@careguide.bd"
              value={newDoctor.email}
              onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
              error={doctorErrors.email}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="outline" size="md" onClick={() => setIsAddDoctorOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Save Doctor Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================== DOCTOR PATIENT SLIDE-OVER DRAWER ==================== */}
      {isDrawerOpen && selectedDoctor && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside className="w-[420px] max-w-[90vw] bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between shrink-0 z-50 fixed right-0 top-0 bottom-0 animate-in slide-in-from-right duration-200">
          <div>
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-base shadow-md shadow-teal-600/20">
                  {selectedDoctor.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{selectedDoctor.name}</h2>
                  <p className="text-xs text-teal-600 font-semibold">
                    {selectedDoctor.specialization} • {selectedDoctor.hospital}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{selectedDoctor.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                type="button"
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-header & Action */}
            <div className="p-4 bg-teal-50/60 border-b border-teal-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-950">Assigned Patient Pool</span>
                <span className="block text-[11px] text-teal-700">
                  {doctorPatients.length} Active Patients Registered
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={<UserPlus className="w-3.5 h-3.5" />}
                onClick={() => setIsAddPatientOpen(true)}
              >
                Add Patient
              </Button>
            </div>

            {/* Patients List under this Doctor */}
            <div className="p-4 divide-y divide-slate-100 max-h-[calc(100vh-250px)] overflow-y-auto space-y-2">
              {doctorPatients.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No patients assigned to this doctor yet. Click "Add Patient" above.
                </div>
              ) : (
                doctorPatients.map((p) => (
                  <div key={p._id} className="pt-2.5 pb-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {p.name}{' '}
                        <span className="text-[11px] font-normal text-slate-400">
                          (Age: {p.age}, {p.gender})
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500">Phone: {p.phone}</p>
                      <div className="mt-1">
                        <Badge
                          variant={
                            p.condition === 'Critical'
                              ? 'danger'
                              : p.condition === 'Stable'
                              ? 'success'
                              : 'warning'
                          }
                          dot
                          pulse={p.condition === 'Critical'}
                        >
                          {p.condition}
                        </Badge>
                      </div>
                    </div>
                    <button
                      type="button"
                      title="Remove from doctor list"
                      onClick={() => setPatientToRemove(p)}
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500">Doctor Management Active</span>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-teal-700 font-bold hover:underline"
            >
              Close Drawer ✕
            </button>
          </div>
        </aside>
        </>
      )}

      {/* ==================== ADD PATIENT UNDER DOCTOR SUB-MODAL ==================== */}
      <Modal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        title={`Add Patient under ${selectedDoctor?.name}`}
        description="Directly assign a new patient case to this specialist doctor"
      >
        <form onSubmit={handleAddPatientToDoctor} className="space-y-4">
          <Input
            label="Patient Name *"
            placeholder="Patient full name"
            value={newPatient.name}
            onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Age *"
              type="number"
              placeholder="e.g. 45"
              value={newPatient.age}
              onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
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
              label="Phone Number *"
              placeholder="+880 1711-..."
              value={newPatient.phone}
              onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
            />
            <Select
              label="Health Condition *"
              value={newPatient.condition}
              onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })}
              options={['Critical', 'Stable', 'Follow-up', 'Recovered']}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddPatientOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Assign to Doctor
            </Button>
          </div>
        </form>
      </Modal>

      {/* ==================== SWEETALERT-STYLE REMOVE CONFIRMATION ==================== */}
      <Modal
        isOpen={!!patientToRemove}
        onClose={() => setPatientToRemove(null)}
        title="Remove Patient from Doctor"
        maxWidth="max-w-md"
      >
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Remove from Doctor's Pool?</h4>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to remove <strong className="text-slate-800">{patientToRemove?.name}</strong> from{' '}
            {selectedDoctor?.name}'s active patient list?
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline" size="md" onClick={() => setPatientToRemove(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleConfirmRemove}>
              Yes, Remove
            </Button>
          </div>
        </div>
      </Modal>

      {/* ==================== SWEETALERT-STYLE SUCCESS MODAL ==================== */}
      <Modal
        isOpen={showDoctorSuccess}
        onClose={() => setShowDoctorSuccess(false)}
        title="Doctor Registered"
        maxWidth="max-w-sm"
      >
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Registration Complete</h4>
          <p className="text-xs text-slate-500 mt-1">
            New doctor has been successfully registered in the directory.
          </p>
          <div className="mt-5">
            <Button variant="primary" size="md" className="w-full" onClick={() => setShowDoctorSuccess(false)}>
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
