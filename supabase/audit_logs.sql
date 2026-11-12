CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid,
  actor_name text NOT NULL,
  actor_role text NOT NULL CHECK (actor_role IN ('super_admin', 'dueno', 'vendedor', 'cajero', 'bodegero', 'sistema')),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  summary text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  result text NOT NULL DEFAULT 'in_progress' CHECK (result IN ('in_progress', 'success', 'failure'))
);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx
  ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_created_at_idx
  ON public.audit_logs (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_action_created_at_idx
  ON public.audit_logs (action, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.audit_logs FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.audit_logs TO service_role;
REVOKE DELETE, TRUNCATE ON public.audit_logs FROM service_role;

CREATE OR REPLACE FUNCTION public.protect_audit_logs()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Audit records cannot be deleted';
  END IF;

  IF OLD.result <> 'in_progress'
    OR NEW.result NOT IN ('success', 'failure')
    OR (to_jsonb(NEW) - 'result' - 'entity_id') IS DISTINCT FROM (to_jsonb(OLD) - 'result' - 'entity_id')
    OR (OLD.entity_id IS NOT NULL AND NEW.entity_id IS DISTINCT FROM OLD.entity_id) THEN
    RAISE EXCEPTION 'Audit records are immutable except for closing an in-progress result';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_logs_protect_mutations ON public.audit_logs;
CREATE TRIGGER audit_logs_protect_mutations
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.protect_audit_logs();

NOTIFY pgrst, 'reload schema';
