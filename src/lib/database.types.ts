export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Rol = 'super_admin' | 'dueno' | 'vendedor' | 'cajero' | 'bodegero'

type Table<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      detalle_venta: Table<
        {
          id: string
          id_venta: string
          id_producto: string
          cantidad: number
          tipo_venta: 'detal' | 'mayor'
          precio_unitario: number
        },
        {
          id?: string
          id_venta: string
          id_producto: string
          cantidad: number
          tipo_venta: 'detal' | 'mayor'
          precio_unitario: number
        },
        {
          id?: string
          id_venta?: string
          id_producto?: string
          cantidad?: number
          tipo_venta?: 'detal' | 'mayor'
          precio_unitario?: number
        }
      >
      productos: Table<
        {
          id: string
          nombre: string
          precio_detal: number
          precio_mayor: number
          codigo_barras: string | null
          stock: number
          imagen_url: string | null
        },
        {
          id?: string
          nombre: string
          precio_detal: number
          precio_mayor: number
          codigo_barras?: string | null
          stock: number
          imagen_url?: string | null
        },
        {
          id?: string
          nombre?: string
          precio_detal?: number
          precio_mayor?: number
          codigo_barras?: string | null
          stock?: number
          imagen_url?: string | null
        }
      >
      solicitudes_producto: Table<
        {
          id: string
          id_producto: string
          nombre_producto: string
          campo: string
          valor_anterior: string | number | null
          valor_nuevo: string | number | null
          estado: string
          created_at: string
          revisado_por: string | null
          revisado_en: string | null
        },
        {
          id?: string
          id_producto: string
          nombre_producto: string
          campo: string
          valor_anterior?: string | number | null
          valor_nuevo?: string | number | null
          estado: string
          created_at?: string
          revisado_por?: string | null
          revisado_en?: string | null
        },
        {
          id?: string
          id_producto?: string
          nombre_producto?: string
          campo?: string
          valor_anterior?: string | number | null
          valor_nuevo?: string | number | null
          estado?: string
          created_at?: string
          revisado_por?: string | null
          revisado_en?: string | null
        }
      >
      usuarios: Table<
        {
          id: string
          nombre: string
          rol: Rol
          pin_hash: string
          activo: boolean
          creado_por: string | null
        },
        {
          id?: string
          nombre: string
          rol: Rol
          pin_hash: string
          activo?: boolean
          creado_por?: string | null
        },
        {
          id?: string
          nombre?: string
          rol?: Rol
          pin_hash?: string
          activo?: boolean
          creado_por?: string | null
        }
      >
      ventas: Table<
        {
          id: string
          id_vendedor: string
          id_cajero: string | null
          total: number
          estado: string
          fecha_hora: string
          confirmada_at: string | null
          aceptada_at: string | null
        },
        {
          id?: string
          id_vendedor: string
          id_cajero?: string | null
          total: number
          estado: string
          fecha_hora?: string
          confirmada_at?: string | null
          aceptada_at?: string | null
        },
        {
          id?: string
          id_vendedor?: string
          id_cajero?: string | null
          total?: number
          estado?: string
          fecha_hora?: string
          confirmada_at?: string | null
          aceptada_at?: string | null
        }
      >
    }
    Views: Record<string, never>
    Functions: {
      incrementar_stock: {
        Args: { p_producto_id: string; p_cantidad: number }
        Returns: number
      }
      pagar_factura: {
        Args: { p_cajero_id: string; p_venta_id: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
