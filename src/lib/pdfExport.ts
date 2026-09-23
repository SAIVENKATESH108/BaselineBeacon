// src/lib/pdfExport.ts
// Generates a caregiver-reported observation PDF.
// All content must use approved non-diagnostic language from AI_AGENT_RULES.md §2.
// Does not render diagnoses, risk scores, or clinical recommendations.

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Report } from '@/types'
import { formatDate, formatDateTime } from '@/lib/utils'

const DISCLAIMER =
  'BaselineBeacon organizes caregiver-reported observations and does not diagnose, treat, or replace professional medical advice. All observations are caregiver-reported and should be discussed with a qualified healthcare professional.'

const NAVY  = [15, 31, 63]   as [number, number, number]
const TEAL  = [26, 158, 158]  as [number, number, number]
const AMBER = [245, 158, 11]  as [number, number, number]
const CREAM = [250, 249, 245] as [number, number, number]
const GRAY  = [100, 116, 139] as [number, number, number]
const WHITE = [255, 255, 255] as [number, number, number]

export function exportReportPDF(report: Report, recipientName: string): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const W = 210 // page width mm
  const MARGIN = 16

  // ─── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, W, 28, 'F')
  doc.setTextColor(...WHITE)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('BaselineBeacon — Caregiver Observation Report', MARGIN, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Generated: ${formatDateTime(report.createdAt)} | Period: ${formatDate(report.dateRangeStart)} – ${formatDate(report.dateRangeEnd)}`,
    MARGIN, 20
  )

  // ─── Disclaimer ──────────────────────────────────────────────────────────────
  doc.setFillColor(255, 251, 235)
  doc.rect(0, 28, W, 14, 'F')
  doc.setTextColor(120, 53, 15)
  doc.setFontSize(7.5)
  doc.text(doc.splitTextToSize(DISCLAIMER, W - MARGIN * 2), MARGIN, 34)

  let y = 50

  // ─── Care Recipient ──────────────────────────────────────────────────────────
  doc.setTextColor(...GRAY)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('CARE RECIPIENT', MARGIN, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...NAVY)
  doc.setFontSize(11)
  doc.text(recipientName, MARGIN, y)
  y += 8

  // ─── Caregiver summary ───────────────────────────────────────────────────────
  if (report.summaryMarkdown) {
    doc.setTextColor(...GRAY)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('CAREGIVER SUMMARY', MARGIN, y)
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(30, 41, 59)
    const summaryLines = doc.splitTextToSize(`"${report.summaryMarkdown}"`, W - MARGIN * 2)
    doc.text(summaryLines, MARGIN, y)
    y += summaryLines.length * 5 + 4
  }

  // ─── Baseline ────────────────────────────────────────────────────────────────
  if (report.baselineSnapshot?.length) {
    doc.setTextColor(...GRAY)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(`SAVED BASELINE (Usual Patterns for ${recipientName})`, MARGIN, y)
    y += 3

    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [['Area', 'Usual Pattern', 'Unit']],
      body: report.baselineSnapshot.map((b) => [
        b.field.replace(/_/g, ' '),
        b.value,
        b.unit ?? '—',
      ]),
      headStyles: {
        fillColor: NAVY,
        textColor: WHITE,
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: CREAM },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 110 },
        2: { cellWidth: 20 },
      },
    })

    // @ts-expect-error — jspdf-autotable adds lastAutoTable
    y = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  }

  // ─── Observations ────────────────────────────────────────────────────────────
  doc.setTextColor(...GRAY)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(`OBSERVATION LOG (${report.observations.length} entries)`, MARGIN, y)
  y += 3

  const obsRows = report.observations.map((obs) => {
    const changedFields = obs.extractedFields
      .filter((f) => f.differentFromBaseline && f.caregiverConfirmed)
      .map((f) => `${f.field.replace(/_/g, ' ')}: ${f.value}`)
      .join('; ')

    return [
      formatDate(obs.observedAt),
      obs.severity ?? 'routine',
      obs.rawText.length > 200 ? obs.rawText.slice(0, 197) + '…' : obs.rawText,
      changedFields || 'Within usual range',
    ]
  })

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Date', 'Severity', 'Caregiver Note (excerpt)', 'Different from Usual']],
    body: obsRows,
    headStyles: {
      fillColor: NAVY,
      textColor: WHITE,
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: CREAM },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 20 },
      2: { cellWidth: 90 },
      3: { cellWidth: 48 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        const val = data.cell.raw as string
        if (val === 'incident') data.cell.styles.textColor = [185, 28, 28]
        else if (val === 'noteworthy') data.cell.styles.textColor = [146, 64, 14]
      }
    },
  })

  // ─── Footer on each page ──────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(...NAVY)
    doc.rect(0, 287, W, 10, 'F')
    doc.setTextColor(...WHITE)
    doc.setFontSize(7)
    doc.text(
      `BaselineBeacon | Caregiver-reported observations only | Page ${i} of ${pageCount}`,
      W / 2, 293,
      { align: 'center' }
    )
  }

  const filename = `BaselineBeacon_${recipientName.replace(/\s+/g, '_')}_${formatDate(report.dateRangeStart)}_to_${formatDate(report.dateRangeEnd)}.pdf`
  doc.save(filename)
}
