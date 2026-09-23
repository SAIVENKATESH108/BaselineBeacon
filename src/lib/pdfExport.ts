// src/lib/pdfExport.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Report, Observation } from '@/types'
import { formatDate, formatDateTime, capitalize } from './utils'

const DISCLAIMER =
  'BaselineBeacon organizes caregiver-reported observations and does not diagnose, treat, or replace professional medical advice. All information is caregiver-reported and should be discussed with a qualified healthcare professional.'

export function exportReportPDF(report: Report, recipientName: string): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 16

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(15, 31, 63) // navy-800
  doc.rect(0, 0, pageWidth, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('BaselineBeacon', marginX, 13)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Caregiver Observation Report', marginX, 21)
  doc.text(`Generated: ${formatDateTime(new Date().toISOString())}`, pageWidth - marginX, 21, { align: 'right' })

  let y = 40

  // ── Recipient ─────────────────────────────────────────────────────────────
  doc.setTextColor(15, 31, 63)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`Care Recipient: ${recipientName}`, marginX, y)
  y += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(74, 85, 104)
  doc.text(
    `Observation Period: ${formatDate(report.dateRangeStart)} – ${formatDate(report.dateRangeEnd)}`,
    marginX,
    y
  )
  y += 10

  // ── Disclaimer ────────────────────────────────────────────────────────────
  doc.setFillColor(255, 251, 235) // amber-50
  doc.roundedRect(marginX - 2, y - 4, pageWidth - marginX * 2 + 4, 14, 2, 2, 'F')
  doc.setTextColor(180, 83, 9) // amber-800
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('IMPORTANT DISCLAIMER', marginX, y + 1)
  doc.setFont('helvetica', 'normal')
  const disclaimerLines = doc.splitTextToSize(DISCLAIMER, pageWidth - marginX * 2)
  doc.text(disclaimerLines, marginX, y + 6)
  y += 20

  // ── Summary ───────────────────────────────────────────────────────────────
  if (report.summaryMarkdown) {
    doc.setTextColor(15, 31, 63)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Caregiver Summary', marginX, y)
    y += 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(74, 85, 104)
    const summaryLines = doc.splitTextToSize(report.summaryMarkdown, pageWidth - marginX * 2)
    doc.text(summaryLines, marginX, y)
    y += summaryLines.length * 5 + 8
  }

  // ── Baseline Snapshot ─────────────────────────────────────────────────────
  if (report.baselineSnapshot.length) {
    doc.setTextColor(15, 31, 63)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Baseline (Usual Patterns)', marginX, y)
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Category', 'Field', 'Usual Value', 'Unit']],
      body: report.baselineSnapshot.map((b) => [
        capitalize(b.category),
        capitalize(b.field),
        b.value,
        b.unit || '—',
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [22, 46, 92], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 240] },
      margin: { left: marginX, right: marginX },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10
  }

  // ── Observations ──────────────────────────────────────────────────────────
  doc.setTextColor(15, 31, 63)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Caregiver-Reported Observations', marginX, y)
  y += 4

  report.observations.forEach((obs: Observation, idx: number) => {
    const rows = obs.extractedFields
      .filter((f) => f.caregiverConfirmed)
      .map((f) => [
        capitalize(f.category),
        capitalize(f.field),
        f.value,
        f.unit || '—',
        f.differentFromBaseline ? 'Different from usual' : 'Within usual range',
      ])

    autoTable(doc, {
      startY: y,
      head: [
        [
          {
            content: `Observation ${idx + 1} — ${formatDateTime(obs.observedAt)} | Caregiver-noted: ${obs.severity || 'routine'}`,
            colSpan: 5,
            styles: { fillColor: [22, 46, 92], textColor: 255, fontSize: 9 },
          },
        ],
        ['Category', 'Field', 'Value', 'Unit', 'vs Baseline'],
      ],
      body: rows.length
        ? rows
        : [['—', '—', obs.rawText.slice(0, 80), '—', '—']],
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [30, 158, 158], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 240] },
      margin: { left: marginX, right: marginX },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 6
  })

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount = doc.internal.pages.length - 1
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `BaselineBeacon — Caregiver-reported observations only | Page ${p} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
  }

  doc.save(`BaselineBeacon_Report_${recipientName.replace(/\s/g, '_')}_${formatDate(new Date().toISOString())}.pdf`)
}
