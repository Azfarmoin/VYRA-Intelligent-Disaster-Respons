interface TriageInput {
  people_count: number
  immediate_danger: boolean
  injury_details: string | null
  medical_needs: string | null
}

interface TriageOutput {
  priority_score: number
  priority_explanation: string
}

export function calculateTriage(input: TriageInput): TriageOutput {
  let score = 0
  const factors: string[] = []

  // Base score from people count (0-40 points)
  const peopleScore = Math.min(input.people_count * 5, 40)
  score += peopleScore
  factors.push(`${input.people_count} people affected (+${peopleScore} points)`)

  // Immediate danger (0-30 points)
  if (input.immediate_danger) {
    score += 30
    factors.push('Immediate danger to life (+30 points)')
  }

  // Injury severity (0-20 points)
  if (input.injury_details) {
    const injuryLower = input.injury_details.toLowerCase()
    if (injuryLower.includes('critical') || injuryLower.includes('life-threatening') || injuryLower.includes('severe')) {
      score += 20
      factors.push('Critical injuries reported (+20 points)')
    } else if (injuryLower.includes('multiple') || injuryLower.includes('serious')) {
      score += 15
      factors.push('Multiple/serious injuries (+15 points)')
    } else if (injuryLower.includes('minor')) {
      score += 5
      factors.push('Minor injuries (+5 points)')
    } else {
      score += 10
      factors.push('Injuries reported (+10 points)')
    }
  }

  // Medical needs (0-10 points)
  if (input.medical_needs) {
    const medicalLower = input.medical_needs.toLowerCase()
    if (medicalLower.includes('ambulance') || medicalLower.includes('emergency')) {
      score += 10
      factors.push('Emergency medical needs (+10 points)')
    } else if (medicalLower.includes('medication') || medicalLower.includes('oxygen')) {
      score += 8
      factors.push('Essential medical supplies needed (+8 points)')
    } else {
      score += 5
      factors.push('Medical support needed (+5 points)')
    }
  }

  // Cap score at 100
  score = Math.min(score, 100)

  // Generate explanation
  const explanation = `Priority score: ${score}/100. ${factors.join('. ')}.`

  return {
    priority_score: score,
    priority_explanation: explanation
  }
}

export function getPriorityCategory(score: number): string {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

export function getPriorityColor(score: number): string {
  if (score >= 80) return 'red'
  if (score >= 60) return 'orange'
  if (score >= 40) return 'yellow'
  return 'green'
}
