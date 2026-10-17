'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import ChoiceGroup from './ChoiceGroup'
import type { PickedLocation } from './LocationPicker'
import { AREAS, DANGERS, EVACUATION_ABILITY, INJURY_SEVERITIES, MEDICAL_NEEDS, VULNERABILITIES } from '@/lib/constants'
import { api, ApiError, type PublicReport } from '@/lib/client'

const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-gray-100" />,
})

const newClientId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`

const EMPTY = {
  location: null as PickedLocation | null,
  locationAddress: '',
  area: '',
  peopleCount: '',
  dangers: [] as string[],
  dangerDetails: '',
  injurySeverity: '',
  injuryCount: '',
  injuryDetails: '',
  medicalNeedTypes: [] as string[],
  medicalNeeds: '',
  canEvacuate: '',
  vulnerabilities: [] as string[],
  contactName: '',
  contactPhone: '',
}
type FormState = typeof EMPTY

// Unanswered questions are sent as "unknown" (never "no"), so the triage engine
// does not mistake missing information for low risk.
export function toPayload(f: FormState, clientId: string, reporterId: string | null) {
  const num = (v: string) => (v.trim() === '' ? null : Number(v))
  return {
    client_id: clientId,
    reporter_id: reporterId,
    location_lat: f.location!.lat,
    location_lng: f.location!.lng,
    location_source: f.location!.source,
    location_accuracy_m: f.location!.accuracyM ?? null,
    location_address: f.locationAddress,
    area: f.area || null,
    people_count: num(f.peopleCount),
    dangers: f.dangers,
    danger_details: f.dangerDetails,
    injury_severity: f.injurySeverity || 'unknown',
    injury_count: num(f.injuryCount),
    injury_details: f.injuryDetails,
    medical_need_types: f.medicalNeedTypes,
    medical_needs: f.medicalNeeds,
    can_evacuate: f.canEvacuate || 'unknown',
    vulnerabilities: f.vulnerabilities,
    contact_name: f.contactName,
    contact_phone: f.contactPhone,
  }
}

function Section({ step, title, hint, children }: { step: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card p-4 sm:p-5">
      <h2 className="flex items-baseline gap-2 text-base font-semibold">
        <span className="text-primary-600">{step}.</span> {title}
      </h2>
      {hint && <p className="mb-3 mt-0.5 text-sm text-gray-500">{hint}</p>}
      <div className={hint ? '' : 'mt-3'}>{children}</div>
    </section>
  )
}

async function currentUserId(): Promise<string | null> {
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null // anonymous reports are allowed
  }
}

export default function ReportForm({ onSubmitted }: { onSubmitted: (r: PublicReport) => void }) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [clientId] = useState(newClientId) // same id on every retry -> no duplicate reports
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<{ message: string; details?: { path: string; message: string }[] } | null>(null)

  const set = <K extends keyof FormState>(field: K) => (value: FormState[K]) => setForm((f) => ({ ...f, [field]: value }))
  const setText = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))
  const injured = form.injurySeverity && !['none', 'unknown'].includes(form.injurySeverity)

  const unanswered = useMemo(() => {
    const list: string[] = []
    if (!form.dangers.length) list.push('danger')
    if (!form.injurySeverity) list.push('injuries')
    if (!form.peopleCount) list.push('number of people')
    if (!form.canEvacuate) list.push('evacuation')
    return list
  }, [form])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.location) {
      setError({ message: 'Please share your location or tap the map to mark where help is needed.' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const { report } = await api.createReport(toPayload(form, clientId, await currentUserId()))
      onSubmitted(report)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? { message: err.message, details: err.details }
          : { message: 'Could not send the report. Check your connection and press Send again - your answers are kept.' }
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800" role="alert">
          <p className="font-medium">{error.message}</p>
          {!!error.details?.length && (
            <ul className="mt-1 list-disc pl-5">
              {error.details.map((d) => (
                <li key={d.path + d.message}>
                  {d.path}: {d.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Section step={1} title="Where is help needed?" hint="Required. GPS is most accurate; you can also mark the spot on the map.">
        <LocationPicker value={form.location} onChange={set('location')} />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="locationAddress">Landmark or address (optional)</label>
            <input id="locationAddress" className="input" maxLength={300} value={form.locationAddress} onChange={setText('locationAddress')} placeholder="e.g. behind the market, blue gate" />
          </div>
          <div>
            <label className="label" htmlFor="area">Area (optional)</label>
            <select id="area" className="input" value={form.area} onChange={setText('area')}>
              <option value="">Detect from location</option>
              {AREAS.map((a) => (
                <option key={a.name} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section step={2} title="Is anyone in immediate danger?" hint="Select everything that applies.">
        <ChoiceGroup multiple options={DANGERS} value={form.dangers} onChange={set('dangers')} exclusive={['none']} />
        <label className="label mt-3" htmlFor="dangerDetails">Describe the situation (optional)</label>
        <textarea id="dangerDetails" rows={2} maxLength={1000} className="input" value={form.dangerDetails} onChange={setText('dangerDetails')} placeholder="e.g. water rising, family on the roof" />
      </Section>

      <Section step={3} title="How many people need help?">
        <div className="flex flex-wrap items-center gap-3">
          <input type="number" min={1} max={10000} inputMode="numeric" className="input w-32" value={form.peopleCount} onChange={setText('peopleCount')} placeholder="Number" aria-label="Number of people" />
          <span className="text-sm text-gray-500">Leave empty if you are not sure.</span>
        </div>
      </Section>

      <Section step={4} title="Are there injuries?">
        <ChoiceGroup options={INJURY_SEVERITIES} value={form.injurySeverity} onChange={set('injurySeverity')} />
        {injured && (
          <div className="mt-3 grid gap-3 sm:grid-cols-[8rem_1fr]">
            <div>
              <label className="label" htmlFor="injuryCount">How many?</label>
              <input id="injuryCount" type="number" min={1} inputMode="numeric" className="input" value={form.injuryCount} onChange={setText('injuryCount')} />
            </div>
            <div>
              <label className="label" htmlFor="injuryDetails">Injury details</label>
              <input id="injuryDetails" className="input" maxLength={1000} value={form.injuryDetails} onChange={setText('injuryDetails')} placeholder="e.g. broken leg, heavy bleeding" />
            </div>
          </div>
        )}
      </Section>

      <Section step={5} title="Medical needs" hint="Essential medication, equipment or conditions responders should know about.">
        <ChoiceGroup multiple options={MEDICAL_NEEDS} value={form.medicalNeedTypes} onChange={set('medicalNeedTypes')} />
        <label className="label mt-3" htmlFor="medicalNeeds">Details (optional)</label>
        <input id="medicalNeeds" className="input" maxLength={1000} value={form.medicalNeeds} onChange={setText('medicalNeeds')} placeholder="e.g. insulin runs out tonight" />
      </Section>

      <Section step={6} title="Can everyone leave safely on their own?">
        <ChoiceGroup columns={3} options={EVACUATION_ABILITY} value={form.canEvacuate} onChange={set('canEvacuate')} />
        <p className="label mt-4">Is anyone here who may need extra help?</p>
        <ChoiceGroup multiple options={VULNERABILITIES} value={form.vulnerabilities} onChange={set('vulnerabilities')} />
      </Section>

      <Section step={7} title="Contact (optional)" hint="Only for responders, so they can call back.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="contactName">Name</label>
            <input id="contactName" className="input" maxLength={120} autoComplete="name" value={form.contactName} onChange={setText('contactName')} />
          </div>
          <div>
            <label className="label" htmlFor="contactPhone">Phone</label>
            <input id="contactPhone" type="tel" className="input" maxLength={40} autoComplete="tel" value={form.contactPhone} onChange={setText('contactPhone')} placeholder="+92 ..." />
          </div>
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-4 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        {unanswered.length > 0 && form.location && (
          <p className="mb-2 text-xs text-gray-500">
            Not answered: {unanswered.join(', ')}. You can still send - responders will treat it as unknown, not as safe.
          </p>
        )}
        <button type="submit" className="btn-danger w-full py-3 text-base" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send emergency report'}
        </button>
      </div>
    </form>
  )
}
