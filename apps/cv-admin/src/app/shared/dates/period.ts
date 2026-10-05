// Dates ISO de l'API ("2022-09-01T00:00:00.000Z") : mois et année, en UTC
// pour éviter un décalage d'un jour selon le fuseau.
const MONTH_FORMAT = new Intl.DateTimeFormat('fr-FR', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatMonth(iso: string): string {
  return MONTH_FORMAT.format(new Date(iso));
}

// « mois année – mois année » ou « mois année – en cours » si pas de fin.
export function formatPeriod(startDate: string, endDate: string | null): string {
  const end = endDate === null ? 'en cours' : formatMonth(endDate);
  return `${formatMonth(startDate)} – ${end}`;
}
