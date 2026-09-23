// src/pages/ShareExportPage.tsx
import { useState } from 'react'
import { Download, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Disclaimer } from '@/components/common/Disclaimer'
import { RAVI_OBSERVATIONS, RAVI_BASELINE, RAVI } from '@/data/demoData'
import { exportReportPDF } from '@/lib/pdfExport'
import { formatDate, formatDateTime, capitalize } from '@/lib/utils'
import type { Report } from '@/types'

const DISCLAIMER_TEXT =
  'BaselineBeacon organizes caregiver-reported observations and does not diagnose, treat, or replace professional medical advice. All information is caregiver-reported and should be discussed with a qualified healthcare professional.'

export function ShareExportPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 14)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const [summaryNote, setSummaryNote] = useState(
    'This summary covers caregiver-reported observations over the selected period. Please discuss any concerns with a qualified healthcare professional.',
  )
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)

  const filteredObs = RAVI_OBSERVATIONS.filter((o) => {
    const d = new Date(o.observedAt)
    return d >= new Date(startDate) && d <= new Date(endDate + 'T23:59:59')
  })

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const report: Report = {
        id: crypto.randomUUID(),
        careRecipientId: RAVI.id,
        generatedBy: 'caregiver-demos-001',
        dateRangeStart: startDate,
        dateRangeEnd: endDate,
        observations: filteredObs as unknown as Report['observations'],
        baselineSnapshot: RAVI_BASELINE,
        summaryMarkdown: summaryNote,
        createdAt: new Date().toISOString(),
      }
      exportReportPDF(report, RAVI.name)
      toast.success('PDF downloaded successfully.')
    } catch (err) {
      toast.error('PDF export failed. Please try again.')
      console.error(err)
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/share/demo-token-${Date.now()}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Share link copied! (Demo link — not persisted)')
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast.error('Could not copy link. Please copy manually.')
    }
  }

  const changedFields = filteredObs.flatMap((o) =>
    o.extractedFields.filter((f) => f.differentFromBaseline && f.caregiverConfirmed),
  )

  return (
    <div className="flex flex-col gap-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Conversation Summary</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a caregiver-reported summary to share with a healthcare professional.
        </p>
      </div>

      {/* Date range */}
      <div className="bg-white rounded-2xl shadow-soft p-5">
        <h2 className="text-sm font-semibold text-navy-700 mb-3">Date Range</h2>
        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label htmlFor="start-date" className="text-xs text-gray-500 font-medium">From</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 min-h-[44px]"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label htmlFor="end-date" className="text-xs text-gray-500 font-medium">To</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 min-h-[44px]"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {filteredObs.length} observation{filteredObs.length !== 1 ? 's' : ''} in selected period
        </p>
      </div>

      {/* Caregiver summary note */}
      <div className="bg-white rounded-2xl shadow-soft p-5">
        <label htmlFor="summary-note" className="text-sm font-semibold text-navy-700 block mb-2">
          Caregiver summary note <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="summary-note"
          value={summaryNote}
          onChange={(e) => setSummaryNote(e.target.value)}
          rows={4}
          maxLength={2000}
          className="w-full px-4 py-3 rounded-xl border border-cream-300 text-sm text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 resize-none"
          placeholder="Add any additional context for the healthcare professional…"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{summaryNote.length}/2000</p>
      </div>

      {/* Preview */}
      <div
        className="bg-white rounded-2xl shadow-soft overflow-hidden"
        aria-label="Report preview"
        role="region"
      >
        {/* Report header */}
        <div className="bg-navy-800 text-white px-5 py-4">
          <h2 className="font-bold text-lg">BaselineBeacon — Caregiver Observation Report</h2>
          <p className="text-xs text-navy-300 mt-0.5">
            Generated: {formatDateTime(new Date().toISOString())} · Period: {formatDate(startDate)} – {formatDate(endDate)}
          </p>
        </div>

        {/* Disclaimer inside report */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3">
          <p className="text-xs text-amber-900">{DISCLAIMER_TEXT}</p>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Recipient */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Care Recipient</p>
            <p className="text-sm font-semibold text-navy-900">{RAVI.name}</p>
            <p className="text-xs text-gray-500">Age range: {RAVI.ageRange} · Relationship: {RAVI.relationship}</p>
          </div>

          {/* Caregiver summary */}
          {summaryNote && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Caregiver Summary</p>
              <p className="text-sm text-navy-800 italic">"{summaryNote}"</p>
            </div>
          )}

          {/* Caregiver-reported changes */}
          {changedFields.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Caregiver-Reported: Different from Usual
              </p>
              <div className="flex flex-col gap-2">
                {changedFields.slice(0, 8).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge variant="noteworthy">Different</Badge>
                    <span className="text-navy-800">
                      <span className="font-medium capitalize">{f.category}: </span>
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Baseline */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Saved Baseline (Usual Patterns for {RAVI.name})
            </p>
            <div className="divide-y divide-cream-100">
              {RAVI_BASELINE.map((b) => (
                <div key={b.id} className="flex justify-between py-1.5 text-sm gap-4">
                  <span className="text-gray-500 capitalize">{b.field.replace(/_/g, ' ')}</span>
                  <span className="text-navy-900 font-medium">{b.value}{b.unit ? ` ${b.unit}` : ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Observation log */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Observation Log ({filteredObs.length} entries)
            </p>
            {filteredObs.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No observations recorded in this period.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredObs.map((obs) => {
                  const variant =
                    obs.severity === 'incident' ? 'incident' :
                    obs.severity === 'noteworthy' ? 'noteworthy' : 'routine'
                  return (
                    <div key={obs.id} className="border border-cream-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">{formatDate(obs.observedAt)}</span>
                        <Badge variant={variant} className="capitalize">{obs.severity}</Badge>
                      </div>
                      <p className="text-xs text-navy-800 leading-relaxed italic">"{obs.rawText}"</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {obs.extractedFields
                          .filter((f) => f.caregiverConfirmed)
                          .map((f) => (
                            <span
                              key={f.field}
                              className={`text-xs px-2 py-0.5 rounded-full border ${
                                f.differentFromBaseline
                                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                                  : 'bg-cream-50 border-cream-300 text-navy-700'
                              }`}
                            >
                              {capitalize(f.field.replace(/_/g, ' '))}: {f.value}
                            </span>
                          ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export actions */}
      <div className="flex gap-3 flex-wrap">
        <Button
          variant="primary"
          size="lg"
          onClick={handleExportPDF}
          isLoading={isExporting}
          className="flex-1"
          aria-label="Download report as PDF"
        >
          <Download size={18} />
          Download PDF
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleCopyLink}
          className="flex-1"
          aria-label="Copy shareable link"
        >
          {copied ? <Check size={18} className="text-teal-600" /> : <Copy size={18} />}
          {copied ? 'Copied!' : 'Copy Share Link'}
        </Button>
      </div>

      <Disclaimer />
    </div>
  )
}
