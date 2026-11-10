CREATE OR REPLACE FUNCTION public.pagar_factura(
  p_cajero_id uuid,
  p_venta_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_estado text;
  v_id_cajero uuid;
BEGIN
  SELECT v.estado, v.id_cajero
  INTO v_estado, v_id_cajero
  FROM public.ventas AS v
  WHERE v.id = p_venta_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Factura no encontrada';
  END IF;

  IF v_estado <> 'aceptada' THEN
    RAISE EXCEPTION 'La factura debe estar aceptada para poder pagarla';
  END IF;

  IF v_id_cajero IS DISTINCT FROM p_cajero_id THEN
    RAISE EXCEPTION 'El cajero no corresponde a esta factura';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.detalle_venta AS d
    WHERE d.id_venta = p_venta_id
  ) THEN
    RAISE EXCEPTION 'La factura no tiene productos';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.detalle_venta AS d
    WHERE d.id_venta = p_venta_id
      AND d.cantidad <= 0
  ) THEN
    RAISE EXCEPTION 'La factura contiene cantidades no válidas';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.detalle_venta AS d
    LEFT JOIN public.productos AS p ON p.id = d.id_producto
    WHERE d.id_venta = p_venta_id
      AND p.id IS NULL
  ) THEN
    RAISE EXCEPTION 'No se encontró un producto de la factura';
  END IF;

  PERFORM p.id
  FROM public.productos AS p
  JOIN (
    SELECT d.id_producto, SUM(d.cantidad) AS cantidad
    FROM public.detalle_venta AS d
    WHERE d.id_venta = p_venta_id
    GROUP BY d.id_producto
  ) AS cantidades ON cantidades.id_producto = p.id
  ORDER BY p.id
  FOR UPDATE OF p;

  IF EXISTS (
    SELECT 1
    FROM public.productos AS p
    JOIN (
      SELECT d.id_producto, SUM(d.cantidad) AS cantidad
      FROM public.detalle_venta AS d
      WHERE d.id_venta = p_venta_id
      GROUP BY d.id_producto
    ) AS cantidades ON cantidades.id_producto = p.id
    WHERE p.stock IS NULL OR p.stock < cantidades.cantidad
  ) THEN
    RAISE EXCEPTION 'No hay stock suficiente para completar la factura';
  END IF;

  UPDATE public.productos AS p
  SET stock = p.stock - cantidades.cantidad
  FROM (
    SELECT d.id_producto, SUM(d.cantidad) AS cantidad
    FROM public.detalle_venta AS d
    WHERE d.id_venta = p_venta_id
    GROUP BY d.id_producto
  ) AS cantidades
  WHERE p.id = cantidades.id_producto;

  UPDATE public.ventas
  SET estado = 'pagada'
  WHERE id = p_venta_id;
END;
$$;

REVOKE ALL ON FUNCTION public.pagar_factura(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pagar_factura(uuid, uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pagar_factura(uuid, uuid) TO service_role;

NOTIFY pgrst, 'reload schema';
