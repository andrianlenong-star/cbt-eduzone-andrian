import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Question, ExamSettings } from '../types';

export interface WorksheetMeta {
  schoolName: string;
  subject: string;
  className: string;
  date: string;
  instructions: string;
  showAnswerKey?: boolean;
}

/**
 * Generate a clean, printer-ready A4 PDF from a DOM element using html2canvas & jsPDF
 */
export async function generateQuizPDF(elementId: string, filename: string = 'Lembar_Kerja_EduZone_CBT.pdf'): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elemen dengan ID "${elementId}" tidak ditemukan.`);
    return false;
  }

  try {
    // Render target element to high-DPI canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x DPI for crisp text & print quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Canvas aspect ratio & scaling
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Subsequent pages if content overflows A4 height
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
    return true;
  } catch (err) {
    console.error('Gagal membuat PDF kuis:', err);
    return false;
  }
}

/**
 * Capture the rendered worksheet as a high-resolution PNG image for easy sharing on social media / chat
 */
export async function exportQuizAsImage(elementId: string, filename: string = 'Soal_Kuis_EduZone.png'): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elemen dengan ID "${elementId}" tidak ditemukan.`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    return true;
  } catch (err) {
    console.error('Gagal mengekspor kuis sebagai gambar PNG:', err);
    return false;
  }
}

/**
 * Export quiz questions into a printer-friendly Microsoft Word (.doc) document
 */
export function exportQuizAsWord(
  questions: Question[],
  settings: ExamSettings,
  meta: WorksheetMeta,
  filename: string = 'Lembar_Kerja_EduZone.doc'
): void {
  const dateStr = meta.date || new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const questionsHtml = questions
    .map((q, idx) => {
      const qType = (q.tipe || q.type || 'PG').toLowerCase();
      let optionsHtml = '';
      if (qType === 'pg' && Array.isArray(q.options)) {
        optionsHtml = `
          <table style="width: 100%; border: none; margin-top: 6px; margin-bottom: 12px;">
            ${q.options
              .map((opt, optIdx) => {
                const letter = String.fromCharCode(65 + optIdx);
                return `
                  <tr>
                    <td style="width: 28px; vertical-align: top; font-weight: bold;">${letter}.</td>
                    <td style="vertical-align: top;">${opt}</td>
                  </tr>
                `;
              })
              .join('')}
          </table>
        `;
      } else if (qType === 'pgk' && Array.isArray(q.options)) {
        optionsHtml = `
          <div style="margin-top: 6px; margin-bottom: 12px; padding-left: 14px;">
            <p style="font-size: 10pt; font-style: italic; color: #475569;">(Pilihlah lebih dari satu jawaban yang benar)</p>
            ${q.options
              .map((opt, optIdx) => {
                const letter = String.fromCharCode(65 + optIdx);
                return `<p style="margin: 4px 0;">[ &nbsp; ] <b>${letter}.</b> ${opt}</p>`;
              })
              .join('')}
          </div>
        `;
      } else if (qType === 'bs') {
        optionsHtml = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px; border: 1px solid #000;">
            <tr style="background-color: #f1f5f9;">
              <th style="border: 1px solid #000; padding: 6px; text-align: left;">Pernyataan</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; width: 70px;">Benar</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; width: 70px;">Salah</th>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px;">${q.content}</td>
              <td style="border: 1px solid #000; text-align: center;">[ &nbsp; ]</td>
              <td style="border: 1px solid #000; text-align: center;">[ &nbsp; ]</td>
            </tr>
          </table>
        `;
      } else if (qType === 'uraian' || qType === 'isian') {
        optionsHtml = `
          <div style="margin-top: 10px; margin-bottom: 16px;">
            <p style="font-size: 10pt; font-weight: bold; margin-bottom: 4px;">Jawaban:</p>
            <div style="border-bottom: 1px dotted #94a3b8; height: 28px; width: 100%;"></div>
            <div style="border-bottom: 1px dotted #94a3b8; height: 28px; width: 100%;"></div>
            <div style="border-bottom: 1px dotted #94a3b8; height: 28px; width: 100%;"></div>
          </div>
        `;
      }

      return `
        <div style="margin-bottom: 16px; page-break-inside: avoid;">
          <p style="margin: 0; font-weight: bold; line-height: 1.4;">
            <span>${idx + 1}.</span> ${q.content}
          </p>
          ${optionsHtml}
        </div>
      `;
    })
    .join('');

  const answerKeyHtml = meta.showAnswerKey
    ? `
      <div style="page-break-before: always; margin-top: 24px;">
        <h3 style="text-align: center; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 6px;">Kunci Jawaban & Pembahasan</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 10pt;">
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #000; padding: 6px; text-align: center; width: 40px;">No</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: left; width: 80px;">Tipe</th>
            <th style="border: 1px solid #000; padding: 6px; text-align: left;">Kunci Jawaban</th>
          </tr>
          ${questions
            .map((q, idx) => {
              const rawAns = q.answer || q.correctAnswer;
              const answerStr = Array.isArray(rawAns)
                ? rawAns.join(', ')
                : String(rawAns ?? '-');
              const qType = (q.tipe || q.type || 'PG').toUpperCase();
              return `
                <tr>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center;">${idx + 1}</td>
                  <td style="border: 1px solid #000; padding: 6px; text-transform: uppercase;">${qType}</td>
                  <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${answerStr}</td>
                </tr>
              `;
            })
            .join('')}
        </table>
      </div>
    `
    : '';

  const wordContent = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${meta.subject || settings.mapel || 'Lembar Soal'}</title>
      <style>
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.35;
          color: #000000;
          margin: 20mm 15mm 20mm 15mm;
        }
        .header-table {
          width: 100%;
          border-bottom: 3px double #000000;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .header-title {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          text-transform: uppercase;
        }
        .meta-table {
          width: 100%;
          margin-bottom: 15px;
          border-collapse: collapse;
          font-size: 10.5pt;
        }
        .meta-table td {
          padding: 3px 6px;
        }
        .score-box {
          border: 1px solid #000;
          text-align: center;
          padding: 8px;
        }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td style="width: 15%; text-align: center;">
            <img src="${settings.logoUrl || '/eduzone-icon.svg'}" width="70" height="70" alt="Logo" />
          </td>
          <td style="width: 85%; text-align: center;">
            <div class="header-title">${meta.schoolName || settings.sekolah || 'SEKOLAH DASAR'}</div>
            <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">LEMBAR KERJA / ASESMEN TERTULIS</div>
            <div style="font-size: 10pt;">Tahun Ajaran 2026/2027 • EduZone CBT Modern Assessment</div>
          </td>
        </tr>
      </table>

      <table class="meta-table">
        <tr>
          <td style="width: 18%; font-weight: bold;">Mata Pelajaran</td>
          <td style="width: 42%;">: ${meta.subject || settings.mapel || 'Ujian'}</td>
          <td style="width: 18%; font-weight: bold;">Nama Siswa</td>
          <td style="width: 22%; border-bottom: 1px solid #000;">: </td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Kelas / Jenjang</td>
          <td>: ${meta.className || 'Semua Kelas'}</td>
          <td style="font-weight: bold;">Nomor Absen</td>
          <td style="border-bottom: 1px solid #000;">: </td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Hari / Tanggal</td>
          <td>: ${dateStr}</td>
          <td style="font-weight: bold;">Nilai / Paraf</td>
          <td style="border: 1px solid #000; text-align: center; font-weight: bold;">[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]</td>
        </tr>
      </table>

      <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 6px 10px; margin-bottom: 16px; font-size: 10pt;">
        <b>Petunjuk Pengerjaan:</b> ${meta.instructions || 'Bacalah setiap butir soal dengan teliti. Pilihlah atau tuliskan jawaban yang paling tepat pada lembar ini!'}
      </div>

      <div class="questions-container">
        ${questionsHtml}
      </div>

      ${answerKeyHtml}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
