export function sampleEventTone(event: string): 'danger' | 'warning' | 'success' | 'info' | 'neutral' {
  if (['rejected', 'rejection_upheld'].includes(event)) return 'danger';
  if (['recollection_started', 'replacement_started', 'recollection_required'].includes(event)) return 'warning';
  if (['collected', 'accepted', 'review_accepted'].includes(event)) return 'success';
  if (['received', 'review_requested', 'collection_started'].includes(event)) return 'info';
  return 'neutral';
}
