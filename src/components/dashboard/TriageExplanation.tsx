import { PriorityBadge } from '../common/Badges'
import { PRIORITY_STYLES } from '@/lib/client'
import { TRIAGE_RULES } from '@/lib/triageRules'
import type { TriagedReport } from '@/lib/types'

const { thresholds } = TRIAGE_RULES

// "Why is this case ranked here?" - every point in the score is listed with its reason.
export default function TriageExplanation({ report }: { report: TriagedReport }) {
  const { triage } = report
  const max = Math.max(...triage.factors.map((f) => f.points), 1)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600">Suggested:</span>
        <PriorityBadge priority={triage.suggestedPriority} />
        <span className="font-mono text-sm text-gray-600">score {triage.score}</span>
        {report.overridden && (
          <>
            <span className="text-gray-400">→</span>
            <span className="text-sm text-purple-700">Responder set</span>
            <PriorityBadge priority={report.priority} />
          </>
        )}
      </div>

      <p className="text-sm text-gray-700">{triage.summary}</p>

      {triage.factors.length ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-gray-500">
              <th className="py-1.5 font-medium">Factor</th>
              <th className="py-1.5 font-medium">Why</th>
              <th className="w-28 py-1.5 text-right font-medium">Points</th>
            </tr>
          </thead>
          <tbody>
            {triage.factors.map((f) => (
              <tr key={f.key} className="border-b border-gray-100 align-top">
                <td className="py-2 pr-2 font-medium">{f.category}</td>
                <td className="py-2 pr-2 text-gray-600">{f.detail}</td>
                <td className="py-2">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-2 w-14 overflow-hidden rounded bg-gray-100">
                      <div className="h-full rounded" style={{ width: `${(f.points / max) * 100}%`, background: PRIORITY_STYLES[triage.suggestedPriority].color }} />
                    </div>
                    <span className="w-8 text-right font-mono">+{f.points}</span>
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={2} className="py-2 text-right text-xs uppercase text-gray-500">Total</td>
              <td className="py-2 text-right font-mono font-semibold">{triage.score}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-gray-500">No risk factors were reported.</p>
      )}

      {!!triage.safetyRules.length && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <p className="font-semibold">Safety rule applied</p>
          {triage.safetyRules.map((r) => (
            <p key={r}>{r}</p>
          ))}
        </div>
      )}

      {!!triage.flags.length && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-semibold">Check before acting</p>
          <ul className="list-disc pl-5">
            {triage.flags.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Thresholds: Critical ≥ {thresholds.critical}, High ≥ {thresholds.high}, Medium ≥ {thresholds.medium}. Suggestion only ({triage.version}) - the
        responder makes the final decision. <a className="underline" href="/api/triage/rules" target="_blank">See all rules</a>
      </p>
    </div>
  )
}
