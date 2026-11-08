import { jsPDF } from 'jspdf';
import { ExamResult, Question, ExamSettings } from '../types';

/**
 * Generates an official, printer-ready A4 PDF Report for an individual student exam result.
 */
export async function generateExamResultPDF(
  result: ExamResult,
  questions: Question[],
  settings: ExamSettings,
  filename?: string
): Promise<boolean> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 16;

    // Header Top Bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUZONE CBT • LAPORAN HASIL ASESMEN SISWA', margin, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(56, 189, 248); // cyan-400
    const schoolName = settings.sekolah || 'EduZone';
    const examTitle = result.mapelNama || settings.mapel || 'Ujian Sekolah';
    doc.text(`${schoolName.toUpperCase()} • T.A. ${settings.tahunAjaran || '2025/2026'}`, margin, 19);

    doc.setTextColor(203, 213, 225);
    doc.setFontSize(8);
    doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')}`, pageWidth - margin - 55, 19);

    y = 36;

    // Student Info Card Box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.roundedRect(margin, y, pageWidth - margin * 2, 34, 3, 3, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('IDENTITAS PESERTA UJIAN', margin + 4, y + 7);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Left Column
    doc.text(`Nama Lengkap   : ${result.nama || 'Peserta Ujian'}`, margin + 4, y + 15);
    doc.text(`Kelas / Rombel : ${result.kelas || '-'}`, margin + 4, y + 22);
    doc.text(`Mata Pelajaran : ${examTitle}`, margin + 4, y + 29);

    // Right Column
    const rightColX = margin + (pageWidth - margin * 2) / 2 + 10;
    doc.text(`Waktu Selesai   : ${result.selesaiPada || '-'}`, rightColX, y + 15);
    doc.text(`Pelanggaran Tab : ${result.pelanggaran || 0} Kali`, rightColX, y + 22);
    const statusIntegritas = (result.pelanggaran || 0) === 0 ? 'BERSIH / TINGGI' : 'PERLU EVALUASI';
    doc.text(`Status Integritas : ${statusIntegritas}`, rightColX, y + 29);

    y += 42;

    // Score Summary Cards
    const cardWidth = (pageWidth - margin * 2 - 12) / 4;
    const cardHeight = 22;

    // 1. Nilai Akhir
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, 'FD');
    doc.setTextColor(67, 56, 202);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('NILAI AKHIR', margin + cardWidth / 2, y + 6, { align: 'center' });
    doc.setFontSize(16);
    doc.text(String(result.nilai), margin + cardWidth / 2, y + 16, { align: 'center' });

    // 2. Jawaban Benar
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(margin + cardWidth + 4, y, cardWidth, cardHeight, 2, 2, 'FD');
    doc.setTextColor(4, 120, 87);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('BENAR', margin + cardWidth + 4 + cardWidth / 2, y + 6, { align: 'center' });
    doc.setFontSize(16);
    doc.text(String(result.benar), margin + cardWidth + 4 + cardWidth / 2, y + 16, { align: 'center' });

    // 3. Jawaban Salah
    doc.setFillColor(254, 242, 242); // rose-50
    doc.setDrawColor(254, 205, 205);
    doc.roundedRect(margin + (cardWidth + 4) * 2, y, cardWidth, cardHeight, 2, 2, 'FD');
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('SALAH', margin + (cardWidth + 4) * 2 + cardWidth / 2, y + 6, { align: 'center' });
    doc.setFontSize(16);
    const salahCount = Math.max(0, (result.totalSoal || questions.length) - (result.benar || 0));
    doc.text(String(salahCount), margin + (cardWidth + 4) * 2 + cardWidth / 2, y + 16, { align: 'center' });

    // 4. Total Butir Soal
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin + (cardWidth + 4) * 3, y, cardWidth, cardHeight, 2, 2, 'FD');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL BUTIR', margin + (cardWidth + 4) * 3 + cardWidth / 2, y + 6, { align: 'center' });
    doc.setFontSize(16);
    doc.text(String(result.totalSoal || questions.length), margin + (cardWidth + 4) * 3 + cardWidth / 2, y + 16, { align: 'center' });

    y += 28;

    // Detailed Question Breakdown Table
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RINCIAN JAWABAN BUTIR SOAL & EVALUASI ANALITIS', margin, y);
    y += 5;

    // Table Header
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');

    const colNo = margin + 3;
    const colTipe = margin + 12;
    const colSoal = margin + 32;
    const colJawabanSiswa = margin + 120;
    const colKunci = margin + 152;
    const colStatus = margin + 172;

    doc.text('NO', colNo, y + 5);
    doc.text('TIPE', colTipe, y + 5);
    doc.text('PERTANYAAN / KONTEN SOAL', colSoal, y + 5);
    doc.text('JAWABAN SISWA', colJawabanSiswa, y + 5);
    doc.text('KUNCI', colKunci, y + 5);
    doc.text('STATUS', colStatus, y + 5);

    y += 7;

    const rowHeight = 7.5;
    const userAnswers = result.answers || {};

    questions.forEach((q, idx) => {
      // Check for page overflow
      if (y > 275) {
        doc.addPage();
        y = 16;
        // Re-draw table header on new page
        doc.setFillColor(30, 41, 59);
        doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text('NO', colNo, y + 5);
        doc.text('TIPE', colTipe, y + 5);
        doc.text('PERTANYAAN / KONTEN SOAL', colSoal, y + 5);
        doc.text('JAWABAN SISWA', colJawabanSiswa, y + 5);
        doc.text('KUNCI', colKunci, y + 5);
        doc.text('STATUS', colStatus, y + 5);
        y += 7;
      }

      const uAns = userAnswers[idx];
      let formattedUserAns = '-';
      if (uAns !== undefined && uAns !== null) {
        formattedUserAns = Array.isArray(uAns) ? uAns.sort().join(', ') : String(uAns);
      }

      let formattedKey = '-';
      if (q.answer !== undefined && q.answer !== null) {
        formattedKey = Array.isArray(q.answer) ? q.answer.sort().join(', ') : String(q.answer);
      }

      // Check correctness
      let isCorrect = false;
      if (q.tipe === 'PGK') {
        const correctArr = Array.isArray(q.answer) ? q.answer : String(q.answer).split(',').map((s) => s.trim());
        if (Array.isArray(uAns)) {
          isCorrect = [...uAns].sort().join(',') === [...correctArr].sort().join(',');
        }
      } else if (q.tipe === 'ISIAN') {
        const accepted = Array.isArray(q.answer)
          ? q.answer.map((a) => a.trim().toLowerCase())
          : String(q.answer).split(/[,;/|]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
        const u = String(uAns || '').trim().toLowerCase();
        isCorrect = accepted.includes(u);
      } else if (q.tipe === 'URAIAN') {
        isCorrect = String(uAns || '').trim().length > 3;
      } else {
        isCorrect = String(uAns || '').trim().toLowerCase() === String(q.answer || '').trim().toLowerCase();
      }

      // Alternate row backgrounds
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'F');
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');

      doc.text(String(idx + 1), colNo, y + 5);
      doc.text(q.tipe || 'PG', colTipe, y + 5);

      const snippet = (q.content || '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 48);
      doc.text(snippet || `Soal Nomor ${idx + 1}`, colSoal, y + 5);

      doc.text(formattedUserAns.slice(0, 16), colJawabanSiswa, y + 5);
      doc.text(formattedKey.slice(0, 14), colKunci, y + 5);

      if (isCorrect) {
        doc.setTextColor(4, 120, 87); // green
        doc.setFont('helvetica', 'bold');
        doc.text('BENAR', colStatus, y + 5);
      } else {
        doc.setTextColor(185, 28, 28); // red
        doc.setFont('helvetica', 'bold');
        doc.text('SALAH', colStatus, y + 5);
      }

      y += rowHeight;
    });

    // Signature Footer
    if (y > 250) {
      doc.addPage();
      y = 20;
    } else {
      y += 10;
    }

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const signatureDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    doc.text(`Divalidasi secara digital pada ${signatureDate}`, margin, y);
    doc.text('Guru Pengampu / Proktor CBT,', pageWidth - margin - 45, y);
    y += 18;
    doc.setFont('helvetica', 'bold');
    doc.text('( Tim Asesmen EduZone CBT )', pageWidth - margin - 48, y);

    const safeName = (result.nama || 'siswa').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const finalFilename = filename || `Laporan_Hasil_${safeName}_EduZone_CBT.pdf`;

    doc.save(finalFilename);
    return true;
  } catch (error) {
    console.error('Gagal membuat PDF hasil ujian:', error);
    return false;
  }
}
