'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import {
  UserRound,
  Users,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState({
    stats: { totalDoctors: 0, totalPatients: 0, patientsPerDoctorAvg: '0', criticalCases: 0 },
    patientsPerDoctor: [],
    admissionTrends: [],
    recentDoctors: [],
  });
  const [loading, setLoading] = useState(true);

  // Add Doctor Modal State directly on Dashboard
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: 'Cardiology',
    hospital: '',
    phone: '',
    email: '',
    status: 'Active',
  });
  const [doctorErrors, setDoctorErrors] = useState({});
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Refresh dashboard data strictly from live database
  async function refreshDashboard() {
    setLoading(true);
    try {
      const result = await dataService.getDashboardAnalytics();
      const docsResult = await dataService.getDoctors({ page: 1, limit: 5 });
      setData({
        ...result,
        recentDoctors: docsResult.doctors || [],
      });
    } catch (err) {
      console.error('Failed to load live dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshDashboard();
  }, []);

  // Handle Create Doctor directly from Dashboard
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

    try {
      await dataService.createDoctor(newDoctor);
      setIsAddDoctorModalOpen(false);
      setNewDoctor({
        name: '',
        specialization: 'Cardiology',
        hospital: '',
        phone: '',
        email: '',
        status: 'Active',
      });
      setDoctorErrors({});
      await refreshDashboard();
      setShowSuccessAlert(true);
    } catch (err) {
      setDoctorErrors({ email: err.message || 'Failed to register doctor' });
    }
  }

  const maxPatientCount = Math.max(
    ...(data.patientsPerDoctor.map((p) => p.count) || []),
    5
  );

  return (
    <AppLayout
      title="Hospital Analytics Dashboard"
      subtitle="Live Doctor-Patient Monitoring & Metrics Overview (Connected to MongoDB Atlas)"
      actionButton={
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddDoctorModalOpen(true)}
        >
          New Doctor
        </Button>
      }
    >
      {/* 4 KPI METRIC CARDS (REAL DATABASE DATA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Total Doctors */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Doctors</span>
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <UserRound className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {loading ? (
                <span className="inline-block w-8 h-7 bg-slate-100 rounded animate-pulse"></span>
              ) : (
                data.stats.totalDoctors
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Registered Specialists</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Patients */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {loading ? (
                <span className="inline-block w-8 h-7 bg-slate-100 rounded animate-pulse"></span>
              ) : (
                data.stats.totalPatients.toLocaleString()
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active in Database</span>
            </div>
          </div>
        </div>

        {/* Card 3: Patients per Doctor Ratio */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patients per Doctor</span>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {loading ? (
                <span className="inline-block w-12 h-7 bg-slate-100 rounded animate-pulse"></span>
              ) : (
                data.stats.patientsPerDoctorAvg
              )}{' '}
              <span className="text-xs font-normal text-slate-500">avg/dr</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-teal-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span>Computed Workload</span>
            </div>
          </div>
        </div>

        {/* Card 4: Critical Cases */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical Cases</span>
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-600">
              {loading ? (
                <span className="inline-block w-8 h-7 bg-slate-100 rounded animate-pulse"></span>
              ) : (
                data.stats.criticalCases
              )}{' '}
              <span className="text-xs font-normal text-slate-500">patients</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Needs immediate review</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Patients per Doctor (Distribution Bar Visualization) */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Patients per Doctor (Distribution)</CardTitle>
              <CardDescription>Live patient allocation across registered specialists</CardDescription>
            </div>
            <Badge variant="teal">Live Database</Badge>
          </CardHeader>
          <CardContent>
            {data.patientsPerDoctor.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading doctor workload metrics...</div>
            ) : (
              <div className="space-y-4 pt-1">
                {data.patientsPerDoctor.slice(0, 5).map((item, idx) => {
                  const percentage = Math.round((item.count / maxPatientCount) * 100) || 5;

                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span className="text-slate-800 font-semibold">
                          {item.name} <span className="text-slate-400 font-normal">({item.specialty})</span>
                        </span>
                        <span className="text-teal-700 font-bold">{item.count} patients</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart 2: Date-based Patient Admissions (Area Wave Visualizer) */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Date-based Patient Admissions</CardTitle>
              <CardDescription>Historical admission velocity (Last 14 Days)</CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Admissions
            </div>
          </CardHeader>
          <CardContent>
            {data.admissionTrends.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading admission trends from database...</div>
            ) : (
              <div className="h-44 w-full pt-4">
                <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="tealAdmissionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="#f1f5f9" strokeDasharray="4 4" />

                  {/* Gradient Area Fill */}
                  <path
                    d="M 20,120 Q 120,80 220,95 T 380,60 T 480,40 L 480,140 L 20,140 Z"
                    fill="url(#tealAdmissionGrad)"
                  />

                  {/* Area Wave Stroke Line */}
                  <path
                    d="M 20,120 Q 120,80 220,95 T 380,60 T 480,40"
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Data Points */}
                  <circle cx="20" cy="120" r="4.5" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
                  <circle cx="160" cy="90" r="4.5" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
                  <circle cx="280" cy="85" r="4.5" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
                  <circle cx="380" cy="60" r="4.5" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
                  <circle cx="480" cy="40" r="4.5" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
                </svg>

                {/* Dynamic Axis Dates from DB */}
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-2 px-2">
                  {data.admissionTrends.slice(0, 5).map((t, i) => (
                    <span key={i}>{t.date.slice(5)} ({t.admissions})</span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RECENT DOCTORS LIST (REAL ATLAS DATA) */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Active Senior Specialists</CardTitle>
            <CardDescription>Live oversight of doctor records & registered patients from MongoDB Atlas</CardDescription>
          </div>
          <Link href="/doctors">
            <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              View All Doctors
            </Button>
          </Link>
        </CardHeader>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200/60">
              <tr>
                <th className="py-3 px-6">Doctor Name</th>
                <th className="py-3 px-5">Specialization</th>
                <th className="py-3 px-5">Hospital</th>
                <th className="py-3 px-5">Contact</th>
                <th className="py-3 px-5">Assigned Patients</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.recentDoctors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {loading ? 'Loading specialist doctors from database...' : 'No doctors found in database'}
                  </td>
                </tr>
              ) : (
                data.recentDoctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-[11px] shrink-0">
                        {doc.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate">{doc.name}</span>
                    </td>
                    <td className="py-3.5 px-5 font-medium">{doc.specialization}</td>
                    <td className="py-3.5 px-5 text-slate-600">{doc.hospital}</td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500">{doc.phone}</td>
                    <td className="py-3.5 px-5 font-semibold text-teal-600">{doc.patientCount || 0} Patients</td>
                    <td className="py-3.5 px-5">
                      <Badge variant={doc.status === 'Active' ? 'success' : 'warning'} dot>
                        {doc.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link href="/doctors">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 transition cursor-pointer">
                          Manage Patients →
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE DOCTOR MODAL DIRECTLY ON DASHBOARD */}
      <Modal
        isOpen={isAddDoctorModalOpen}
        onClose={() => setIsAddDoctorModalOpen(false)}
        title="Add New Doctor"
        description="Quickly register a medical specialist to MongoDB Atlas database"
      >
        <form onSubmit={handleCreateDoctor} className="space-y-4">
          <Input
            label="Doctor Name *"
            placeholder="e.g. Dr. Mohammad Rahman"
            value={newDoctor.name}
            onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
            error={doctorErrors.name}
          />

          <Select
            label="Medical Specialization *"
            value={newDoctor.specialization}
            onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
            options={[
              'Cardiology',
              'Neurology',
              'Orthopedics',
              'Pediatrics',
              'Dermatology',
              'Gynecology',
              'Gastroenterology',
              'Oncology',
            ]}
          />

          <Input
            label="Hospital Affiliation *"
            placeholder="e.g. Square Hospital, Dhaka"
            value={newDoctor.hospital}
            onChange={(e) => setNewDoctor({ ...newDoctor, hospital: e.target.value })}
            error={doctorErrors.hospital}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Phone *"
              placeholder="+880 1712-345678"
              value={newDoctor.phone}
              onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
              error={doctorErrors.phone}
            />
            <Select
              label="Status"
              value={newDoctor.status}
              onChange={(e) => setNewDoctor({ ...newDoctor, status: e.target.value })}
              options={['Active', 'On Leave']}
            />
          </div>

          <Input
            label="Official Email Address *"
            type="email"
            placeholder="m.rahman@squarehospital.bd"
            value={newDoctor.email}
            onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
            error={doctorErrors.email}
          />

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddDoctorModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Register Doctor
            </Button>
          </div>
        </form>
      </Modal>

      {/* SWEETALERT-STYLE SUCCESS MODAL */}
      <Modal
        isOpen={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        title="Doctor Registered"
        maxWidth="max-w-sm"
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Registered to Atlas Database</h4>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            The specialist has been permanently registered to the cloud database and is now live.
          </p>
          <div className="mt-5">
            <Button variant="primary" size="md" className="w-full" onClick={() => setShowSuccessAlert(false)}>
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
