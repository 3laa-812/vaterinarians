"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Select } from "@/components/shared/Select";
import { Button } from "@/components/shared/Button";
import {
  useVaccineCatalog,
  useCreatePetVaccination,
  PetVaccination,
} from "@/hooks/useVaccines";
import { AlertTriangle, Calendar, X } from "lucide-react";

interface VaccinationFormModalProps {
  petId: string;
  species: string;
  existingRecord?: PetVaccination | null;
  onClose: () => void;
}

export function VaccinationFormModal({
  petId,
  species,
  existingRecord,
  onClose,
}: VaccinationFormModalProps) {
  const tForm = useTranslations("form");
  const t = useTranslations("common");
  const locale = useLocale();

  const { data: catalog = [] } = useVaccineCatalog();
  const createMutation = useCreatePetVaccination(petId);

  // Filter catalog for the pet's species (or 'both')
  const availableVaccines = catalog.filter(
    (v) =>
      v.species?.toLowerCase() === species?.toLowerCase() ||
      v.species?.toLowerCase() === "both",
  );

  const [form, setForm] = useState({
    vaccineId: "",
    dateAdministered: new Date().toISOString().split("T")[0],
    nextDueDate: "",
    manufacturer: "",
    lotNumber: "",
    productExpirationDate: "",
    doseNumber: "",
    notes: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (existingRecord) {
      setForm({
        vaccineId: existingRecord.vaccineId,
        dateAdministered: existingRecord.dateAdministered
          ? new Date(existingRecord.dateAdministered)
              .toISOString()
              .split("T")[0]
          : "",
        nextDueDate: existingRecord.nextDueDate
          ? new Date(existingRecord.nextDueDate).toISOString().split("T")[0]
          : "",
        manufacturer: existingRecord.manufacturer || "",
        lotNumber: existingRecord.lotNumber || "",
        productExpirationDate: existingRecord.productExpirationDate
          ? new Date(existingRecord.productExpirationDate)
              .toISOString()
              .split("T")[0]
          : "",
        doseNumber: existingRecord.doseNumber
          ? String(existingRecord.doseNumber)
          : "",
        notes: existingRecord.notes || "",
      });
    }
  }, [existingRecord]);

  const handleVaccineChange = (vaccineId: string) => {
    setForm((prev) => ({ ...prev, vaccineId }));

    // Auto-calculate next due date if possible
    const selected = availableVaccines.find((v) => v.id === vaccineId);
    if (selected && selected.defaultIntervalDays) {
      const administered = form.dateAdministered
        ? new Date(form.dateAdministered)
        : new Date();
      const nextDue = new Date(administered);
      nextDue.setDate(nextDue.getDate() + selected.defaultIntervalDays);
      setForm((prev) => ({
        ...prev,
        nextDueDate: nextDue.toISOString().split("T")[0],
      }));
    }
  };

  const handleDateAdministeredChange = (dateStr: string) => {
    setForm((prev) => ({ ...prev, dateAdministered: dateStr }));

    // Recalculate next due date if vaccine is selected
    if (form.vaccineId) {
      const selected = availableVaccines.find((v) => v.id === form.vaccineId);
      if (selected && selected.defaultIntervalDays) {
        const administered = dateStr ? new Date(dateStr) : new Date();
        const nextDue = new Date(administered);
        nextDue.setDate(nextDue.getDate() + selected.defaultIntervalDays);
        setForm((prev) => ({
          ...prev,
          nextDueDate: nextDue.toISOString().split("T")[0],
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (existingRecord) {
        // Edit is not explicitly defined in the hook, but let's assume we would have one or just allow create for now.
        // For simplicity, we'll implement create. If editing is needed, we'd add an edit hook.
        // The spec mainly talks about logging them. We'll handle edit via the API if needed later.
        alert(
          t('editingRecordsIsNotSupportedYet'),
        );
        onClose();
        return;
      }

      const payload = {
        vaccineId: form.vaccineId,
        dateAdministered: new Date(form.dateAdministered).toISOString(),
        nextDueDate: form.nextDueDate
          ? new Date(form.nextDueDate).toISOString()
          : null,
        manufacturer: form.manufacturer || null,
        lotNumber: form.lotNumber || null,
        productExpirationDate: form.productExpirationDate
          ? new Date(form.productExpirationDate).toISOString()
          : null,
        doseNumber: form.doseNumber ? parseInt(form.doseNumber) : null,
        notes: form.notes || null,
      };

      await createMutation.mutateAsync(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface border border-outline/10 rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-primary">
            {existingRecord
              ? t('vaccinationDetails')
              : t('addNewVaccination')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 bg-surface-container rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pe-2"
        >
          {error && (
            <div className="p-3 bg-error/10 text-error text-sm rounded-xl flex gap-2 items-center">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-primary mb-1">
              {t('vaccine')} *
            </label>
            <Select
              required
              disabled={!!existingRecord}
              value={form.vaccineId}
              onChange={(e) => handleVaccineChange(e.target.value)}
              className="w-full text-sm"
            >
              <option value="">
                {t('selectVaccine')}
              </option>
              {availableVaccines.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}{" "}
                  {v.isCore ? (t('core')) : ""}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-primary mb-1 flex items-center gap-1">
                <Calendar size={14} />{" "}
                {t('dateAdministered')} *
              </label>
              <input
                type="date"
                required
                disabled={!!existingRecord}
                value={form.dateAdministered}
                onChange={(e) => handleDateAdministeredChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary mb-1 flex items-center gap-1">
                <Calendar size={14} />{" "}
                {t('nextDueDate')}
              </label>
              <input
                type="date"
                disabled={!!existingRecord}
                value={form.nextDueDate}
                onChange={(e) =>
                  setForm({ ...form, nextDueDate: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-primary mb-1">
                {t('manufacturer')}
              </label>
              <input
                type="text"
                disabled={!!existingRecord}
                value={form.manufacturer}
                onChange={(e) =>
                  setForm({ ...form, manufacturer: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 text-sm"
                placeholder="e.g. Zoetis"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary mb-1">
                {t('lotNumber')}
              </label>
              <input
                type="text"
                disabled={!!existingRecord}
                value={form.lotNumber}
                onChange={(e) =>
                  setForm({ ...form, lotNumber: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-primary mb-1 flex items-center gap-1">
                <Calendar size={14} />{" "}
                {t('productExpiration')}
              </label>
              <input
                type="date"
                disabled={!!existingRecord}
                value={form.productExpirationDate}
                onChange={(e) =>
                  setForm({ ...form, productExpirationDate: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary mb-1">
                {t('doseNumber')}
              </label>
              <input
                type="number"
                min="1"
                disabled={!!existingRecord}
                value={form.doseNumber}
                onChange={(e) =>
                  setForm({ ...form, doseNumber: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 text-sm"
                placeholder="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-1">
              {t('notes')}
            </label>
            <textarea
              disabled={!!existingRecord}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-outline/20 bg-surface text-primary focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 resize-none h-20 text-sm"
              placeholder={
                t('adverseReactionsEtc')
              }
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
            {!existingRecord && (
              <>
                <Button type="button" variant="secondary" onClick={onClose}>
                  {tForm("cancel", { defaultMessage: "Cancel" })}
                </Button>
                <Button
                  type="submit"
                  loading={createMutation.isPending}
                  className="px-6 py-2 text-sm"
                >
                  {tForm("save", { defaultMessage: "Save" })}
                </Button>
              </>
            )}
            {existingRecord && (
              <Button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm"
              >
                {t('close')}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
