// src/pages/ShareExportPage.tsx — Cohesive, Professional & Print-Ready Handoff Summary
import { useState } from 'react'
import {
  Download, Copy, Check, FileText, Calendar, Sparkles,
  Share2, Shield, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Disclaimer } from '@/components/common/Disclaimer'
import { RAVI_BASELINE, RAVI } from '@/data/demoData'
import { exportReportPDF } from '@/lib/pdfExport'
import { formatDate, formatDateTime, capitalize } from '@/lib/utils'
import { useAppStore } from '@/state/appStore'
import type { Report } from '@/types'

export function ShareExportPage() {
  const { observations, selectedRecipient, baselineEntries } = useAppStore()
  const recipientName = selectedRecipient?.name ?? RAVI.name

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

  const filteredObs = observations.filter((o) => {
    const d = new Date(o.observedAt)
    return d >= new Date(startDate) && d <= new Date(endDate + 'T23:59:59')
  })

  const setPresetRange = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    setEndDate(end.toISOString().split('T')[0])
    setStartDate(start.toISOString().split('T')[0])
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const report: Report = {
        id: crypto.randomUUID(),
        careRecipientId: selectedRecipient?.id ?? RAVI.id,
        generatedBy: 'caregiver-demos-001',
        dateRangeStart: startDate,
        dateRangeEnd: endDate,
        observations: filteredObs as unknown as Report['observations'],
        baselineSnapshot: baselineEntries,
        summaryMarkdown: summaryNote,
        createdAt: new Date().toISOString(),
      }
      exportReportPDF(report, recipientName)
      toast.success('Professional PDF report downloaded!')
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
      toast.success('Appointment share link copied to clipboard!')
      setTimeout(() => setCopied(false), 3000)
    } catch {
      toast.error('Could not copy link. Please copy manually.')
    }
  }

  const changedFields = filteredObs.flatMap((o) =>
    o.extractedFields.filter((f) => f.differentFromBaseline && f.caregiverConfirmed),
  )

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
          <FileText size={13} className="text-teal-400" />
          <span>Physician & Nurse Handoff Generator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Appointment Summary Report
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Create an objective, caregiver-reported multi-day summary to share with your loved one's doctor or care team.
        </p>
      </div>

      {/* Date Range Selection & Presets */}
      <div className="bg-navy-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Report Timeframe
          </h2>
          {/* Preset Buttons */}
          <div className="flex gap-1.5">
            {[
              { label: '7 Days', days: 7 },
              { label: '14 Days', days: 14 },
              { label: '30 Days', days: 30 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPresetRange(p.days)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700/80 hover:border-teal-500/50 text-slate-300 hover:text-white transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="start-date" className="text-xs font-semibold text-slate-300">Start Date</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-navy-950 text-sm text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="end-date" className="text-xs font-semibold text-slate-300">End Date</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-navy-950 text-sm text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            />
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          Includes <span className="font-bold text-teal-300">{filteredObs.length} confirmed observations</span> with <span className="font-bold text-amber-300">{changedFields.length} baseline deviations</span>.
        </p>
      </div>

      {/* Caregiver Context Note */}
      <div className="bg-navy-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-2">
        <label htmlFor="summary-note" className="text-sm font-bold text-white block">
          Caregiver Introduction Note <span className="text-xs font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="summary-note"
          value={summaryNote}
          onChange={(e) => setSummaryNote(e.target.value)}
          rows={3}
          maxLength={2000}
          className="w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-navy-950 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 resize-none font-medium leading-relaxed"
          placeholder="Add any specific questions or concerns you want the doctor to address during the visit…"
        />
        <div className="text-right text-xs text-slate-400">{summaryNote.length}/2000</div>
      </div>

      {/* Report Preview Document Card */}
      <div className="bg-navy-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl" role="region" aria-label="Report preview">
        {/* Document Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-teal-950 text-white p-6 sm:p-7 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-teal-300 font-bold block mb-1">
                Clinical Discussion Brief
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                BaselineBeacon Caregiver Report
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Patient: <span className="text-white font-bold">{RAVI.name}</span> • Generated: {formatDateTime(new Date().toISOString())}
              </p>
            </div>
            <div className="bg-teal-500/20 border border-teal-500/40 px-3.5 py-1.5 rounded-xl text-teal-200 text-xs font-bold self-start sm:self-auto">
              {formatDate(startDate)} – {formatDate(endDate)}
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Caregiver Note Box */}
          {summaryNote && (
            <div className="p-4 rounded-2xl bg-navy-950/70 border border-slate-800 text-xs sm:text-sm text-slate-200 italic leading-relaxed">
              "{summaryNote}"
            </div>
          )}

          {/* Key Deviations Highlight */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Observations Different from Usual Baseline ({changedFields.length})
            </h3>
            {changedFields.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No baseline deviations reported in this date range.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {changedFields.map((f, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5"
                  >
                    <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-amber-200">{capitalize(f.category)}: {f.field.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-amber-100 mt-0.5 font-medium">{f.value}</div>
                      {f.sourceQuote && (
                        <div className="text-[10px] text-amber-300/80 mt-1 italic">"{f.sourceQuote}"</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Baseline Reference */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Ravi Kumar's Saved Baseline Habits
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {RAVI_BASELINE.slice(0, 4).map((b) => (
                <div key={b.id} className="p-3 rounded-xl bg-navy-950/70 border border-slate-800 text-xs">
                  <span className="text-slate-400 block truncate">{b.field.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-teal-300 mt-0.5 block">{b.value}{b.unit ? ` ${b.unit}` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="bg-navy-950 p-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            variant="secondary"
            size="md"
            onClick={handleCopyLink}
            className="w-full sm:w-auto text-xs font-bold bg-navy-900 border-slate-700 text-white hover:bg-slate-800"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
            <span>{copied ? 'Link Copied!' : 'Copy Shareable Link'}</span>
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={handleExportPDF}
            isLoading={isExporting}
            className="w-full sm:w-auto font-bold shadow-lg shadow-teal-500/25"
          >
            <Download size={18} />
            <span>Download Physician-Ready PDF</span>
          </Button>
        </div>
      </div>

      <Disclaimer />
    </div>
  )
}
