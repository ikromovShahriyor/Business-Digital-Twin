"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Employee, Branch } from "@/types";
import { UserCheck, Plus, DollarSign, Building, Calendar } from "lucide-react";

export default function EmployeesPage() {
  const { t } = useI18n();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    position: "",
    department: "Sales",
    monthlySalary: 1500,
    branchId: "",
  });

  useEffect(() => {
    Promise.all([api.getEmployees(), api.getBranches()])
      .then(([empList, bList]) => {
        setEmployees(empList);
        setBranches(bList);
        if (bList.length > 0) setFormData((prev) => ({ ...prev, branchId: bList[0].id }));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createEmployee(formData);
      setShowModal(false);
      const list = await api.getEmployees();
      setEmployees(list);
    } catch (err: any) {
      alert(err.message || "Failed to add employee");
    }
  };

  const totalPayroll = employees.reduce((sum, e) => sum + e.monthlySalary, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100">{t("employees")}</h1>
            <p className="text-xs text-slate-400">Workforce roster, departmental assignments, salary structure & headcount management</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>

        {/* Payroll Summary Banner */}
        <div className="glass-panel p-4 rounded-xl border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Monthly Payroll</span>
              <p className="text-xl font-black text-slate-100">${totalPayroll.toLocaleString()}</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {employees.length} active employees
          </span>
        </div>

        {/* Employee Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : employees.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs">
              No employees registered.
            </div>
          ) : (
            employees.map((e) => (
              <div key={e.id} className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{e.fullName}</h3>
                    <p className="text-xs text-indigo-400 font-medium">{e.position}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {e.department}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between">
                    <span>Monthly Salary:</span>
                    <span className="font-bold text-slate-200">${e.monthlySalary.toLocaleString()}</span>
                  </div>
                  {e.branchName && (
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="text-slate-300">{e.branchName}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Hired:</span>
                    <span>{new Date(e.hireDateUtc).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-2xl border-slate-700 w-full max-w-md space-y-4">
              <h3 className="text-base font-bold text-slate-100">Add New Employee</h3>
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                      placeholder="Sardor"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                      placeholder="Yusupov"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Position</label>
                    <input
                      type="text"
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                      placeholder="Store Lead"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                      placeholder="Sales"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Monthly Salary ($)</label>
                    <input
                      type="number"
                      required
                      value={formData.monthlySalary}
                      onChange={(e) => setFormData({ ...formData, monthlySalary: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Branch</label>
                    <select
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                  >
                    Save Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
