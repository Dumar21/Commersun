'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'

interface Props {
  label: string
  value: string
  min?: string
  max?: string
  onChange: (value: string) => void
  /** 'from' = este calendario elige la fecha inicial, 'to' = elige la fecha final */
  mode?: 'from' | 'to'
  /** Fecha "desde" del rango (YYYY-MM-DD) */
  rangeStart?: string
  /** Fecha "hasta" del rango (YYYY-MM-DD) */
  rangeEnd?: string
}

const WEEKDAYS = [
  { short: 'Lu', full: 'lunes' },
  { short: 'Ma', full: 'martes' },
  { short: 'Mi', full: 'miércoles' },
  { short: 'Ju', full: 'jueves' },
  { short: 'Vi', full: 'viernes' },
  { short: 'Sá', full: 'sábado' },
  { short: 'Do', full: 'domingo' },
]

const DAY_MS = 24 * 60 * 60 * 1000

function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText) - 1
  const day = Number(dayText)
  const date = new Date(Date.UTC(year, month, day))

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month &&
    date.getUTCDate() === day
    ? date
    : null
}

function dateToString(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function todayString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isWithinRange(value: string, min?: string, max?: string): boolean {
  return (!min || value >= min) && (!max || value <= max)
}

function daysBetween(from: string, to: string): number {
  const a = parseDate(from)
  const b = parseDate(to)
  if (!a || !b) return 0
  return Math.round((b.getTime() - a.getTime()) / DAY_MS)
}

function getReferenceDate(value: string, min?: string, max?: string): Date {
  const today = todayString()

  for (const candidate of [value, min, max, today]) {
    if (!candidate) continue
    const date = parseDate(candidate)
    if (date && isWithinRange(candidate, min, max)) return date
  }

  const localToday = new Date()
  return new Date(Date.UTC(localToday.getFullYear(), localToday.getMonth(), localToday.getDate()))
}

function monthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

function shiftMonth(date: Date, amount: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1))
}

function shiftDateByMonths(date: Date, amount: number): Date {
  const month = shiftMonth(date, amount)
  const lastDay = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate()
  return new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), Math.min(date.getUTCDate(), lastDay)))
}

function getCalendarDays(month: Date): Date[] {
  const firstDay = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1))
  const mondayOffset = (firstDay.getUTCDay() + 6) % 7

  return Array.from({ length: 42 }, (_, index) =>
    new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1 - mondayOffset + index)),
  )
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions): string {
  const date = parseDate(value)
  return date
    ? new Intl.DateTimeFormat('es-CO', { ...options, timeZone: 'UTC' }).format(date)
    : ''
}

function formatMonth(month: Date): string {
  const value = new Intl.DateTimeFormat('es-CO', {
    month: 'long',
    timeZone: 'UTC',
  }).format(month)
  return value.charAt(0).toLocaleUpperCase('es-CO') + value.slice(1)
}

function yearHasAvailableDate(year: number, min?: string, max?: string): boolean {
  if (year < 1 || year > 9999) return false
  const firstDay = `${year}-01-01`
  const lastDay = `${year}-12-31`
  return (!min || lastDay >= min) && (!max || firstDay <= max)
}

function decadeHasAvailableDate(start: number, min?: string, max?: string): boolean {
  return Array.from({ length: 12 }, (_, index) => start - 1 + index)
    .some((year) => yearHasAvailableDate(year, min, max))
}

function monthHasAvailableDate(month: Date, min?: string, max?: string): boolean {
  const year = month.getUTCFullYear()
  if (year < 1 || year > 9999) return false

  const firstDay = dateToString(monthStart(month))
  const lastDay = dateToString(
    new Date(Date.UTC(year, month.getUTCMonth() + 1, 0)),
  )
  return (!min || lastDay >= min) && (!max || firstDay <= max)
}

function findAvailableMonth(year: number, preferredMonth: number, min?: string, max?: string): Date | null {
  for (let offset = 0; offset < 12; offset += 1) {
    const month = (preferredMonth + offset) % 12
    const candidate = new Date(Date.UTC(year, month, 1))
    if (monthHasAvailableDate(candidate, min, max)) return candidate
  }
  return null
}

export default function AuditDatePicker({
  label,
  value,
  min,
  max,
  onChange,
  mode,
  rangeStart,
  rangeEnd,
}: Props) {
  const labelId = useId()
  const valueId = useId()
  const dialogId = useId()
  const headingId = useId()
  const yearPanelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLElement>(null)
  const dayRefs = useRef(new Map<string, HTMLButtonElement>())
  const yearRefs = useRef(new Map<number, HTMLButtonElement>())
  const [open, setOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const [hoverDay, setHoverDay] = useState<string | null>(null)
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(getReferenceDate(value, min, max)))
  const [focusedDay, setFocusedDay] = useState(() =>
    dateToString(getReferenceDate(value, min, max)),
  )
  const [yearChooser, setYearChooser] = useState(false)
  const [decadeStart, setDecadeStart] = useState(() =>
    Math.floor(getReferenceDate(value, min, max).getUTCFullYear() / 10) * 10,
  )
  const [focusedYear, setFocusedYear] = useState(() =>
    getReferenceDate(value, min, max).getUTCFullYear(),
  )
  const days = getCalendarDays(visibleMonth)
  const monthLabel = formatMonth(visibleMonth)
  const today = todayString()
  const visibleYear = visibleMonth.getUTCFullYear()
  const years = Array.from({ length: 12 }, (_, index) => decadeStart - 1 + index)

  // Rango efectivo (incluye la vista previa al pasar el mouse)
  let effStart = rangeStart || ''
  let effEnd = rangeEnd || ''
  if (hoverDay) {
    if (mode === 'to' && rangeStart && hoverDay >= rangeStart) effEnd = hoverDay
    if (mode === 'from' && rangeEnd && hoverDay <= rangeEnd) effStart = hoverDay
  }
  const hasRange = Boolean(effStart && effEnd && effStart <= effEnd)
  const rangeTotal = hasRange ? daysBetween(effStart, effEnd) : 0

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  useLayoutEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const trigger = triggerRef.current?.getBoundingClientRect()
      const popup = popupRef.current?.getBoundingClientRect()
      if (!trigger || !popup) return

      const spaceBelow = window.innerHeight - trigger.bottom
      setOpenUpward(spaceBelow < popup.height && trigger.top > spaceBelow)
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [open, visibleMonth, yearChooser])

  useEffect(() => {
    if (open) dayRefs.current.get(focusedDay)?.focus()
  }, [open, focusedDay])

  useEffect(() => {
    if (open && yearChooser) yearRefs.current.get(focusedYear)?.focus()
  }, [open, yearChooser, focusedYear])

  function openCalendar() {
    const reference = getReferenceDate(value, min, max)
    const year = reference.getUTCFullYear()
    setVisibleMonth(monthStart(reference))
    setFocusedDay(dateToString(reference))
    setDecadeStart(Math.floor(year / 10) * 10)
    setFocusedYear(year)
    setYearChooser(false)
    setHoverDay(null)
    setOpen(true)
  }

  function closeCalendar(restoreFocus: boolean) {
    setOpen(false)
    setYearChooser(false)
    setHoverDay(null)
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }

  function moveFocus(date: Date, amount: number, unit: 'day' | 'month') {
    const nextDate = unit === 'day'
      ? new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + amount))
      : shiftDateByMonths(date, amount)
    const nextValue = dateToString(nextDate)
    if (!isWithinRange(nextValue, min, max)) return

    setVisibleMonth(monthStart(nextDate))
    setFocusedDay(nextValue)
  }

  function chooseYear(year: number) {
    const nextMonth = findAvailableMonth(year, visibleMonth.getUTCMonth(), min, max)
    if (!nextMonth) return

    const firstAvailableDay = getCalendarDays(nextMonth).find(
      (date) =>
        date.getUTCMonth() === nextMonth.getUTCMonth() &&
        isWithinRange(dateToString(date), min, max),
    )
    if (!firstAvailableDay) return

    setVisibleMonth(nextMonth)
    setFocusedDay(dateToString(firstAvailableDay))
    setYearChooser(false)
  }

  function handleDayKeyDown(event: KeyboardEvent<HTMLButtonElement>, value: string) {
    const date = parseDate(value)
    if (!date) return

    const dayMoves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    }

    if (event.key in dayMoves) {
      event.preventDefault()
      moveFocus(date, dayMoves[event.key], 'day')
      return
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      const weekday = (date.getUTCDay() + 6) % 7
      moveFocus(date, event.key === 'Home' ? -weekday : 6 - weekday, 'day')
      return
    }

    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault()
      const amount = event.key === 'PageUp' ? -1 : 1
      moveFocus(date, event.shiftKey ? amount * 12 : amount, 'month')
    }
  }

  const previousMonth = shiftMonth(visibleMonth, -1)
  const nextMonth = shiftMonth(visibleMonth, 1)
  const previousDecade = decadeStart - 10
  const nextDecade = decadeStart + 10

  return (
    <div
      ref={rootRef}
      className="relative min-w-0"
      onBlur={(event) => {
        const next = event.relatedTarget
        if (next instanceof Node && !event.currentTarget.contains(next)) {
          setOpen(false)
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          closeCalendar(true)
        }
      }}
    >
      <span id={labelId} className="mb-1.5 block text-xs font-semibold text-muted">
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-labelledby={`${labelId} ${valueId}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        onClick={() => (open ? closeCalendar(false) : openCalendar())}
        className={`group flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary-bright focus-visible:outline-offset-2 ${
          open
            ? 'border-primary-bright/70 bg-background/80 text-ink'
            : 'border-border/70 bg-background/50 text-ink hover:border-primary-bright/50 hover:bg-background/70'
        }`}
      >
        <span
          id={valueId}
          className={`truncate ${value ? 'font-medium text-ink' : 'text-muted'}`}
        >
          {value
            ? formatDate(value, { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Seleccionar fecha'}
        </span>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-2/80 text-primary-bright transition-colors group-hover:bg-surface-2"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
            <rect x="2.5" y="4" width="15" height="13" rx="2" />
            <path d="M6 2.5v3M14 2.5v3M2.5 8h15" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {open && (
        <section
          ref={popupRef}
          id={dialogId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={headingId}
          className={`absolute left-0 z-[1100] max-h-[calc(100dvh-2rem)] w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface p-3 shadow-xl shadow-black/35 ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label={yearChooser ? 'Década anterior' : 'Mes anterior'}
              disabled={
                yearChooser
                  ? !decadeHasAvailableDate(previousDecade, min, max)
                  : !monthHasAvailableDate(previousMonth, min, max)
              }
              onClick={() => {
                if (yearChooser) {
                  setDecadeStart(previousDecade)
                  setFocusedYear(previousDecade)
                } else {
                  setVisibleMonth(previousMonth)
                }
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/70 text-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-bright disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path d="m12.5 4.5-5 5.5 5 5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex min-w-0 flex-col items-center">
              {yearChooser ? (
                <>
                  <h2 id={headingId} className="text-sm font-semibold text-ink">
                    Selecciona un año
                  </h2>
                  <button
                    type="button"
                    aria-label="Volver al calendario"
                    aria-expanded={yearChooser}
                    aria-controls={yearPanelId}
                    onClick={() => setYearChooser(false)}
                    className="inline-flex min-h-8 items-center rounded-md px-2 text-xs font-semibold text-primary-bright transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary-bright"
                  >
                    Volver
                  </button>
                </>
              ) : (
                <>
                  <h2
                    id={headingId}
                    aria-live="polite"
                    className="text-sm font-semibold text-ink"
                  >
                    {monthLabel}
                  </h2>
                  <button
                    type="button"
                    aria-label={`Cambiar año, ${visibleYear}`}
                    aria-expanded={yearChooser}
                    onClick={() => {
                      setDecadeStart(Math.floor(visibleYear / 10) * 10)
                      setFocusedYear(visibleYear)
                      setYearChooser(true)
                    }}
                    className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-primary-bright transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary-bright"
                  >
                    {visibleYear}
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                      <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            <button
              type="button"
              aria-label={yearChooser ? 'Década siguiente' : 'Mes siguiente'}
              disabled={
                yearChooser
                  ? !decadeHasAvailableDate(nextDecade, min, max)
                  : !monthHasAvailableDate(nextMonth, min, max)
              }
              onClick={() => {
                if (yearChooser) {
                  setDecadeStart(nextDecade)
                  setFocusedYear(nextDecade)
                } else {
                  setVisibleMonth(nextMonth)
                }
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/70 text-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-bright disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path d="m7.5 4.5 5 5.5-5 5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {yearChooser ? (
            <div
              id={yearPanelId}
              role="group"
              aria-label={`Años ${decadeStart - 1} a ${decadeStart + 10}`}
              className="grid grid-cols-4 gap-1"
            >
              {years.map((year) => {
                const isSelected = year === visibleYear
                const isCurrentYear = year === Number(today.slice(0, 4))

                return (
                  <button
                    key={year}
                    ref={(element) => {
                      if (element) yearRefs.current.set(year, element)
                      else yearRefs.current.delete(year)
                    }}
                    type="button"
                    aria-label={`Año ${year}`}
                    aria-pressed={isSelected}
                    disabled={!yearHasAvailableDate(year, min, max)}
                    onFocus={() => setFocusedYear(year)}
                    onClick={() => chooseYear(year)}
                    className={`min-h-10 rounded-lg text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-primary-bright disabled:cursor-not-allowed disabled:opacity-30 ${
                      isSelected
                        ? 'bg-primary font-semibold text-white'
                        : isCurrentYear
                          ? 'border border-primary-bright/60 font-semibold text-primary-bright hover:bg-surface-2'
                          : 'text-ink hover:bg-surface-2'
                    }`}
                  >
                    {year}
                  </button>
                )
              })}
            </div>
          ) : (
            <div
              role="grid"
              aria-label={`Calendario de ${monthLabel} ${visibleYear}`}
              className="space-y-1"
              onMouseLeave={() => setHoverDay(null)}
            >
              <div role="row" className="grid grid-cols-7">
                {WEEKDAYS.map((weekday) => (
                  <span
                    key={weekday.full}
                    role="columnheader"
                    aria-label={weekday.full}
                    className="flex h-8 items-center justify-center text-[11px] font-semibold text-muted"
                  >
                    {weekday.short}
                  </span>
                ))}
              </div>
              {Array.from({ length: 6 }, (_, weekIndex) => (
                <div key={weekIndex} role="row" className="grid grid-cols-7">
                  {days.slice(weekIndex * 7, weekIndex * 7 + 7).map((date, dayIndex) => {
                    const dateValue = dateToString(date)
                    const isSelected = dateValue === value
                    const isToday = dateValue === today
                    const isCurrentMonth = date.getUTCMonth() === visibleMonth.getUTCMonth()
                    const isDisabled = !isWithinRange(dateValue, min, max)

                    const inRange = hasRange && dateValue >= effStart && dateValue <= effEnd
                    const isRangeStart = hasRange && dateValue === effStart
                    const isRangeEnd = hasRange && dateValue === effEnd
                    const isSingleDay = hasRange && effStart === effEnd
                    const isEdge = isRangeStart || isRangeEnd
                    const showBand = inRange && !isSingleDay

                    // Degradado: más suave en "desde", más fuerte en "hasta"
                    const progress = rangeTotal > 0 ? daysBetween(effStart, dateValue) / rangeTotal : 0
                    const bandOpacity = 0.12 + progress * 0.33

                    return (
                      <div
                        key={dateValue}
                        role="gridcell"
                        aria-selected={isSelected}
                        className="relative flex h-9 items-center justify-center"
                      >
                        {showBand && (
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none absolute inset-y-0 bg-primary ${
                              isRangeStart ? 'left-1/2' : 'left-0'
                            } ${isRangeEnd ? 'right-1/2' : 'right-0'} ${
                              dayIndex === 0 && !isRangeStart ? 'rounded-l-lg' : ''
                            } ${dayIndex === 6 && !isRangeEnd ? 'rounded-r-lg' : ''}`}
                            style={{ opacity: bandOpacity }}
                          />
                        )}
                        <button
                          ref={(element) => {
                            if (element) dayRefs.current.set(dateValue, element)
                            else dayRefs.current.delete(dateValue)
                          }}
                          type="button"
                          disabled={isDisabled}
                          tabIndex={focusedDay === dateValue ? 0 : -1}
                          aria-label={formatDate(dateValue, {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                          aria-current={isToday ? 'date' : undefined}
                          aria-pressed={isSelected}
                          onFocus={() => setFocusedDay(dateValue)}
                          onMouseEnter={() => {
                            if (!isDisabled) setHoverDay(dateValue)
                          }}
                          onKeyDown={(event) => handleDayKeyDown(event, dateValue)}
                          onClick={() => {
                            onChange(dateValue)
                            closeCalendar(true)
                          }}
                          className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-lg text-xs tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-primary-bright focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-30 ${
                            isSelected || isEdge
                              ? 'bg-primary font-bold text-white'
                              : inRange
                                ? 'font-medium text-ink'
                                : isToday
                                  ? 'border border-primary-bright/60 font-semibold text-primary-bright hover:bg-surface-2'
                                  : isCurrentMonth
                                    ? 'text-ink hover:bg-surface-2'
                                    : 'text-muted hover:bg-surface-2'
                          }`}
                        >
                          {date.getUTCDate()}
                        </button>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex justify-between border-t border-border/70 pt-2">
            <button
              type="button"
              disabled={!value}
              onClick={() => {
                onChange('')
                closeCalendar(true)
              }}
              className="min-h-9 rounded-md px-2 text-xs font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-bright disabled:cursor-not-allowed disabled:opacity-40"
            >
              Limpiar
            </button>
            <button
              type="button"
              disabled={!isWithinRange(today, min, max)}
              onClick={() => {
                onChange(today)
                closeCalendar(true)
              }}
              className="min-h-9 rounded-md px-2 text-xs font-semibold text-primary-bright transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary-bright disabled:cursor-not-allowed disabled:opacity-40"
            >
              Hoy
            </button>
          </div>
        </section>
      )}
    </div>
  )
}