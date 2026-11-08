import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Image as ImageIcon,
  FileSpreadsheet,
  X,
  Settings,
  CheckCircle2,
  Calendar,
  Building,
  BookOpen,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { Question, ExamSettings } from '../types';
import { FormattedText } from './FormattedText';
import { generateQuizPDF, exportQuizAsImage, exportQuizAsWord, WorksheetMeta } from '../utils/generateQuizPDF';

interface WorksheetGeneratorProps {
  questions: Question[];
  settings: ExamSettings;
  onClose: () => void;
}

export const WorksheetGenerator: React.FC<WorksheetGeneratorProps> = ({
  questions,
  settings,
  onClose,
}) => {
  const [schoolName, setSchoolName] = useState(settings.sekolah || 'EduZone');
  const [subject, setSubject] = useState(settings.mapel || 'Simulasi Ujian');
  const [className, setClassName] = useState('Kelas 5 & 6');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [instructions, setInstructions] = useState(
    '1. Berdoalah sebelum mengerjakan soal. 2. Tulis nama dan identitas pada kolom yang tersedia. 3. Pilih atau tulis jawaban yang benar pada lembar soal.'
  );
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    setFeedbackMsg('Sedang memproses PDF A4...');
    try {
      const success = await generateQuizPDF(
        'quiz-printable-worksheet-content',
        `Lembar_Kerja_${subject.replace(/\s+/g, '_')}.pdf`
      );
      if (success) {
        setFeedbackMsg('✅ Berhasil mengunduh Lembar Kerja PDF!');
      } else {
        setFeedbackMsg('❌ Terjadi kendala saat menghasilkan PDF.');
      }
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  const handleDownloadImage = async () => {
    setIsExportingImage(true);
    setFeedbackMsg('Sedang memproses Gambar PNG...');
    try {
      const success = await exportQuizAsImage(
        'quiz-printable-worksheet-content',
        `Lembar_Kerja_${subject.replace(/\s+/g, '_')}.png`
      );
      if (success) {
        setFeedbackMsg('✅ Berhasil mengunduh gambar kuis PNG!');
      } else {
        setFeedbackMsg('❌ Terjadi kendala saat menghasilkan gambar.');
      }
    } finally {
      setIsExportingImage(false);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  const handleDownloadWord = () => {
    const meta: WorksheetMeta = {
      schoolName,
      subject,
      className,
      date: formattedDate,
      instructions,
      showAnswerKey,
    };
    exportQuizAsWord(questions, settings, meta, `Lembar_Kerja_${subject.replace(/\s+/g, '_')}.doc`);
    setFeedbackMsg('✅ Berhasil mengekspor dokumen Word (.doc)!');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in select-none">
      {/* Top Navbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>Worksheet Generator & Cetak Soal</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-black uppercase">
                A4 Offline / Printable
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Ubah kuis menjadi lembar kerja siap cetak (PDF, Word, PNG) untuk penggunaan di ruang kelas offline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {feedbackMsg && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 animate-in fade-in">
              {feedbackMsg}
            </span>
          )}

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Unduh Lembar Soal dalam format PDF A4"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Menyiapkan...' : 'Unduh PDF'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExportingImage}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Unduh Soal sebagai format Gambar PNG untuk media sosial / WA"
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isExportingImage ? 'Memproses...' : 'Unduh Gambar (PNG)'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadWord}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer"
            title="Unduh Soal dalam format Microsoft Word (.doc)"
          >
            <FileText className="w-4 h-4" />
            <span>Unduh Word (.doc)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Langsung</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Body: Sidebar Settings + A4 Live Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Dynamic Settings */}
        <div className="w-80 sm:w-96 bg-white border-r border-slate-200 p-5 overflow-y-auto space-y-4 shrink-0 text-left">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Settings className="w-4 h-4 text-cyan-600" />
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Pengaturan Lembar Kerja
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Nama Sekolah / Lembaga</span>
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-cyan-500 focus:bg-white"
                placeholder="Contoh: EduZone"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Mata Pelajaran / Topik</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-cyan-500 focus:bg-white"
                placeholder="Contoh: Literasi & Numerasi"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kelas / Jenjang</span>
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-cyan-500 focus:bg-white"
                  placeholder="Kelas 5 & 6"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tanggal</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-cyan-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">
                Petunjuk Pengerjaan
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-cyan-500 focus:bg-white"
              />
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showAnswerKey}
                  onChange={(e) => setShowAnswerKey(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  Sertakan Kunci Jawaban di Halaman Terakhir
                </span>
              </label>
            </div>

            <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-200 text-xs text-cyan-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-700" />
                <span>Statistik Soal:</span>
              </div>
              <p>Total: <strong>{questions.length} butir soal</strong></p>
              <p>
                PG: {questions.filter((q) => (q.tipe || q.type || '').toLowerCase() === 'pg').length} | PGK: {questions.filter((q) => (q.tipe || q.type || '').toLowerCase() === 'pgk').length} | B/S: {questions.filter((q) => (q.tipe || q.type || '').toLowerCase() === 'bs').length} | Uraian: {questions.filter((q) => { const t = (q.tipe || q.type || '').toLowerCase(); return t === 'uraian' || t === 'isian'; }).length}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: High Fidelity A4 Paper Layout Preview */}
        <div className="flex-1 bg-slate-200/80 p-6 overflow-y-auto flex justify-center">
          <div
            id="quiz-printable-worksheet-content"
            className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 sm:p-12 shadow-2xl rounded-sm text-left font-serif leading-relaxed printable-worksheet"
            style={{ boxSizing: 'border-box' }}
          >
            {/* Kop Surat Header Sekolah */}
            <div className="border-b-4 border-double border-black pb-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                <img
                  src={settings.logoUrl || '/eduzone-logo.png'}
                  alt="Logo Sekolah"
                  className="w-20 h-20 object-contain shrink-0"
                />
                <div className="flex-1 text-center">
                  <h1 className="text-xl font-bold uppercase tracking-wider text-black">
                    {schoolName}
                  </h1>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-black mt-0.5">
                    LEMBAR KERJA PESERTA DIDIK (LKPD) / ASESMEN TERTULIS
                  </h2>
                  <p className="text-xs text-slate-700 mt-1">
                    Tahun Ajaran 2026/2027 • Sistem Asesmen Berbasis Kurikulum Nasional
                  </p>
                </div>
                <div className="w-20 h-20 border border-black p-1 text-center flex flex-col justify-center items-center text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">NILAI</span>
                  <div className="w-full h-8 border-t border-black mt-1"></div>
                </div>
              </div>
            </div>

            {/* Identitas Siswa & Ujian */}
            <div className="border border-black p-3.5 mb-6 text-xs bg-slate-50/50">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div className="flex">
                  <span className="w-32 font-bold">Mata Pelajaran</span>
                  <span className="font-semibold">: {subject}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-bold">Nama Siswa</span>
                  <span className="border-b border-dotted border-black flex-1">: </span>
                </div>
                <div className="flex">
                  <span className="w-32 font-bold">Kelas / Jenjang</span>
                  <span className="font-semibold">: {className}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-bold">No. Absen / NISN</span>
                  <span className="border-b border-dotted border-black flex-1">: </span>
                </div>
                <div className="flex">
                  <span className="w-32 font-bold">Hari / Tanggal</span>
                  <span>: {formattedDate}</span>
                </div>
                <div className="flex">
                  <span className="w-28 font-bold">Paraf Guru</span>
                  <span className="border-b border-dotted border-black flex-1">: </span>
                </div>
              </div>
            </div>

            {/* Petunjuk Soal */}
            <div className="bg-slate-100 border-l-4 border-black p-3 mb-8 text-xs italic text-slate-800">
              <strong>Petunjuk:</strong> {instructions}
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {questions.map((q, qIdx) => (
                <div key={q.id || qIdx} className="page-break-avoid">
                  <div className="flex items-start gap-2 text-sm leading-relaxed">
                    <span className="font-bold shrink-0">{qIdx + 1}.</span>
                    <div className="flex-1">
                      <div className="font-medium text-black">
                        <FormattedText content={q.content} />
                      </div>

                      {/* Question image if any */}
                      {q.image && (
                        <div className="my-2 max-w-sm rounded border border-slate-300 overflow-hidden">
                          <img src={q.image} alt={`Gambar Soal ${qIdx + 1}`} className="max-h-48 object-contain" />
                        </div>
                      )}

                      {/* Options rendering */}
                      {((q.tipe || q.type || '').toLowerCase() === 'pg') && Array.isArray(q.options) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pl-2">
                          {q.options.map((opt, optIdx) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            return (
                              <div key={optIdx} className="flex items-start gap-2 text-xs">
                                <span className="font-bold w-5">{letter}.</span>
                                <div>
                                  <FormattedText content={opt} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {((q.tipe || q.type || '').toLowerCase() === 'pgk') && Array.isArray(q.options) && (
                        <div className="space-y-1.5 mt-2 pl-2">
                          <span className="text-[11px] italic text-slate-600 block">
                            (Pilihan ganda kompleks - Centang kotak [ &nbsp; ] yang benar)
                          </span>
                          {q.options.map((opt, optIdx) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            return (
                              <div key={optIdx} className="flex items-start gap-2 text-xs">
                                <span className="w-4 h-4 border border-black inline-block shrink-0 mt-0.5"></span>
                                <span className="font-bold">{letter}.</span>
                                <div>
                                  <FormattedText content={opt} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {((q.tipe || q.type || '').toLowerCase() === 'bs') && (
                        <div className="mt-3 pl-2">
                          <table className="w-full border-collapse border border-black text-xs text-center">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="border border-black p-2 text-left font-bold">Pernyataan Soal</th>
                                <th className="border border-black p-2 w-16 font-bold">Benar</th>
                                <th className="border border-black p-2 w-16 font-bold">Salah</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-black p-2.5 text-left font-medium">
                                  <FormattedText content={q.content} />
                                </td>
                                <td className="border border-black p-2">[ &nbsp; ]</td>
                                <td className="border border-black p-2">[ &nbsp; ]</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {((q.tipe || q.type || '').toLowerCase() === 'uraian' || (q.tipe || q.type || '').toLowerCase() === 'isian') && (
                        <div className="mt-3 pl-2 space-y-3">
                          <span className="text-xs font-bold text-slate-700 block">Jawaban Anda:</span>
                          <div className="border-b border-dotted border-black h-6"></div>
                          <div className="border-b border-dotted border-black h-6"></div>
                          <div className="border-b border-dotted border-black h-6"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Answer Key if selected */}
            {showAnswerKey && (
              <div className="mt-12 pt-8 border-t-2 border-black page-break-before">
                <h3 className="text-base font-bold text-center uppercase tracking-wider mb-4">
                  KUNCI JAWABAN & PEMBAHASAN SOAL
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {questions.map((q, idx) => {
                    const rawAns = q.answer || q.correctAnswer;
                    const ans = Array.isArray(rawAns)
                      ? rawAns.join(', ')
                      : String(rawAns ?? '-');
                    const qType = (q.tipe || q.type || 'PG').toUpperCase();
                    return (
                      <div key={idx} className="p-2 border border-black flex justify-between bg-slate-50">
                        <span className="font-bold">No. {idx + 1} ({qType}):</span>
                        <span className="font-black text-black">{ans}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-16 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500 flex justify-between">
              <span>{schoolName} • Dokumen Resmi Asesmen</span>
              <span>EduZone CBT Modern Assessment • Dicetak Otomatis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
