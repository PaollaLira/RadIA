import React, { useState, useEffect } from 'react';
import { Patient } from '../../types/patient';
import { UltrasoundExam, UltrasoundSpecialty, TransducerType } from '../../types/ultrasound';
import { useLanguage } from '../../i18n/LanguageContext';
import { X, UserPlus } from 'lucide-react';

interface NewPatientExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient, exam: UltrasoundExam) => void;
}

const DEFAULT_TRANSDUCER: Record<UltrasoundSpecialty, TransducerType> = {
  ABDOMEN: 'CONVEX',
  THYROID: 'LINEAR',
  BREAST: 'LINEAR',
  URINARY_KIDNEYS: 'CONVEX',
  POCUS_FAST: 'SECTOR',
  PELVIC_GYN: 'ENDOCAVITARY',
  VASCULAR_DOPPLER: 'LINEAR',
};

export const NewPatientExamModal: React.FC<NewPatientExamModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { lang, t } = useLanguage();
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>(45);
  const [gender, setGender] = useState<'M' | 'F' | 'Outro'>('F');
  const [roomBed, setRoomBed] = useState(
    lang === 'en' ? 'Emergency Dept - Bay 02' : 'Pronto-Socorro - Box 02'
  );
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [specialty, setSpecialty] = useState<UltrasoundSpecialty>('ABDOMEN');
  const [transducer, setTransducer] = useState<TransducerType>('CONVEX');
  const [initialFindingText, setInitialFindingText] = useState('');

  useEffect(() => {
    setRoomBed((prev) => {
      if (prev === 'Pronto-Socorro - Box 02' && lang === 'en') return 'Emergency Dept - Bay 02';
      if (prev === 'Emergency Dept - Bay 02' && lang === 'pt') return 'Pronto-Socorro - Box 02';
      return prev;
    });
  }, [lang]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const patientId = `pat-${Date.now()}`;
    const examId = `exam-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newPatient: Patient = {
      id: patientId,
      name: name.trim(),
      age: Number(age) || 40,
      gender,
      recordNumber: `HC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      clinicalIndication: clinicalIndication.trim(),
      admissionDate: now,
      roomBed: roomBed.trim(),
      priorExams: [],
      comorbidities: [],
      allergies: [],
      currentMedications: [],
    };

    const newExam: UltrasoundExam = {
      id: examId,
      patientId,
      specialty,
      urgency: 'PRIORITY',
      status: 'PENDING',
      transducer,
      manualFindingText: initialFindingText.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    onSave(newPatient, newExam);
    setName('');
    setClinicalIndication('');
    setInitialFindingText('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t.newPatientModal.title}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-800 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.newPatientModal.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label={t.newPatientModal.cancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.newPatientModal.nameLabel}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.newPatientModal.namePlaceholder}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.newPatientModal.ageLabel}
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.newPatientModal.genderLabel}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'M' | 'F' | 'Outro')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="F">{t.newPatientModal.female}</option>
                <option value="M">{t.newPatientModal.male}</option>
                <option value="Outro">{t.newPatientModal.other}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.newPatientModal.roomLabel}
              </label>
              <input
                type="text"
                value={roomBed}
                onChange={(e) => setRoomBed(e.target.value)}
                placeholder={t.newPatientModal.roomPlaceholder}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.newPatientModal.specialtyLabel}
            </label>
            <select
              value={specialty}
              onChange={(e) => {
                const spec = e.target.value as UltrasoundSpecialty;
                setSpecialty(spec);
                setTransducer(DEFAULT_TRANSDUCER[spec]);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="ABDOMEN">{t.specialties.ABDOMEN}</option>
              <option value="THYROID">{t.specialties.THYROID}</option>
              <option value="BREAST">{t.specialties.BREAST}</option>
              <option value="URINARY_KIDNEYS">{t.specialties.URINARY_KIDNEYS}</option>
              <option value="POCUS_FAST">{t.specialties.POCUS_FAST}</option>
              <option value="PELVIC_GYN">{t.specialties.PELVIC_GYN}</option>
              <option value="VASCULAR_DOPPLER">{t.specialties.VASCULAR_DOPPLER}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.newPatientModal.indicationLabel}
            </label>
            <textarea
              rows={2}
              value={clinicalIndication}
              onChange={(e) => setClinicalIndication(e.target.value)}
              placeholder={t.newPatientModal.indicationPlaceholder}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.newPatientModal.findingLabel}
            </label>
            <textarea
              rows={2}
              value={initialFindingText}
              onChange={(e) => setInitialFindingText(e.target.value)}
              placeholder={t.newPatientModal.findingPlaceholder}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.newPatientModal.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 transition-colors shadow-sm"
            >
              {t.newPatientModal.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
