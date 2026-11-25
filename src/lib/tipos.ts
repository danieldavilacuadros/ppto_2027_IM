export type Rol = 'administrador' | 'subadministrador' | 'gerente' | 'usuario'

export interface Perfil {
  id: string
  email: string
  nombre: string
  cargo: string
  rol: Rol
  activo: boolean
}

export interface Jefatura {
  id: string
  sede: string
  nombre: string
  jefe: string | null
  marcas: string[]
}

export interface Linea {
  id: string
  nombre: string
  formato: string
  tipo: 'sm' | 'sede' | 'global'
  con_consolidado: boolean
  extras: [string, string][]
  orden: number
}

export interface Acceso {
  id?: number
  perfil_id: string
  linea: string
  sede: string
  alcance: string
  puede_editar: boolean
}

/** Estado de una casilla de la matriz: sin acceso, ve o edita */
export type Nivel = '' | 'v' | 'e'

export const claveAcceso = (linea: string, sede: string, alcance: string) => `${linea}|${sede}|${alcance}`
