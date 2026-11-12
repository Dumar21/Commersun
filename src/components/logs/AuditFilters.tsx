'use client'

import * as Select from '@radix-ui/react-select'
import Link from 'next/link'
import { useId, useState } from 'react'
import type { Rol } from '@/lib/database.types'
import AuditDatePicker from '@/components/logs/AuditDatePicker'
import {
  AUDIT_CATEGORY_OPTIONS,
  AUDIT_ROLE_LABELS,
  type AuditCategory,
} from '@/components/logs/audit-options'

interface ActorOption {
  id: string
  nombre: string
  rol: Rol
  activo: boolean
}

interface Props {
  actor: string
  area: AuditCategory
  from: string
  to: string
  users: ActorOption[]
  filterError: string
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <div>
      <span id={`${id}-label`} className="mb-1.5 block text-xs font-semibold text-muted">
        {label}
      </span>
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger
          aria-labelledby={`${id}-label`}
          className="group flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/50 px-3 text-left text-sm text-ink transition-colors hover:border-primary-bright/50 hover:bg-background/70 focus-visible:outline-2 focus-visible:outline-primary-bright focus-visible:outline-offset-2"
        >
          <Select.Value />
          <Select.Icon className="shrink-0 text-muted transition-transform duration-150 group-data-[state=open]:rotate-180">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            align="start"
            sideOffset={6}
            className="z-[1100] w-[max(var(--radix-select-trigger-width),16rem)] max-h-[min(60vh,24rem)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-xl shadow-black/30"
          >
            <Select.Viewport className="flex flex-col gap-1 p-0.5">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  textValue={option.label}
                  className="product-select-option relative flex min-h-11 cursor-pointer select-none items-center rounded-lg px-3 py-2 pr-10 text-sm text-ink"
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-3 text-primary-bright">
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}

export default function AuditFilters({ actor: initialActor, area: initialArea, from, to, users, filterError }: Props) {
  const id = useId()
  const [actor, setActor] = useState(initialActor || 'all')
  const [area, setArea] = useState<AuditCategory>(initialArea)
  const [fromDate, setFromDate] = useState(from)
  const [toDate, setToDate] = useState(to)
  const actorOptions = [
    { value: 'all', label: 'Todo el equipo' },
    ...users.map((user) => ({
      value: user.id,
      label: `${user.nombre} · ${AUDIT_ROLE_LABELS[user.rol]}${user.activo ? '' : ' (desactivado)'}`,
    })),
  ]

  return (
    <form action="/logs" method="get" className="rounded-xl border border-border/80 bg-surface/90 p-4 sm:p-5">
      <input type="hidden" name="actor" value={actor === 'all' ? '' : actor} />
      <input type="hidden" name="area" value={area} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <SelectField
          id={`${id}-actor`}
          label="Persona"
          value={actor}
          options={actorOptions}
          onChange={setActor}
        />
        <SelectField
          id={`${id}-area`}
          label="Área"
          value={area}
          options={AUDIT_CATEGORY_OPTIONS}
          onChange={(value) => {
            const option = AUDIT_CATEGORY_OPTIONS.find((candidate) => candidate.value === value)
            if (option) setArea(option.value)
          }}
        />
        <input type="hidden" name="from" value={fromDate} />
        <AuditDatePicker
          label="Desde"
          mode="from"
          value={fromDate}
          max={toDate || undefined}
          rangeStart={fromDate}
          rangeEnd={toDate}
          onChange={setFromDate}
        />
        <input type="hidden" name="to" value={toDate} />
        <AuditDatePicker
          label="Hasta"
          mode="to"
          value={toDate}
          min={fromDate || undefined}
          rangeStart={fromDate}
          rangeEnd={toDate}
          onChange={setToDate}
        />
        <button type="submit" className="btn-primary min-h-11 w-full lg:w-auto">Filtrar</button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">Los detalles conservan el nombre y el rol que tenía la persona al realizar la acción.</p>
        <Link href="/logs" className="inline-flex min-h-9 items-center text-xs font-semibold text-primary-bright underline-offset-4 hover:underline">
          Limpiar filtros
        </Link>
      </div>
      {filterError && (
        <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {filterError}
        </p>
      )}
    </form>
  )
}