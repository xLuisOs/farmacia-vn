export const productos = [
  { id: 1, nombre: 'Amoxicilina 500mg',    categoria: 'Antibiótico',  stock: 142, stockMin: 20, precio: 35.00,  vencimiento: '2026-08-15' },
  { id: 2, nombre: 'Paracetamol 500mg',    categoria: 'Analgésico',   stock: 8,   stockMin: 15, precio: 12.00,  vencimiento: '2026-12-01' },
  { id: 3, nombre: 'Omeprazol 20mg',       categoria: 'Gastro',       stock: 0,   stockMin: 10, precio: 28.00,  vencimiento: '2026-05-20' },
  { id: 4, nombre: 'Ibuprofeno 400mg',     categoria: 'Analgésico',   stock: 67,  stockMin: 20, precio: 18.50,  vencimiento: '2027-03-10' },
  { id: 5, nombre: 'Losartán 50mg',        categoria: 'Cardiov.',     stock: 12,  stockMin: 15, precio: 42.00,  vencimiento: '2026-04-18' },
  { id: 6, nombre: 'Metformina 850mg',     categoria: 'Diabetología', stock: 45,  stockMin: 20, precio: 22.00,  vencimiento: '2026-04-25' },
  { id: 7, nombre: 'Atorvastatina 20mg',   categoria: 'Cardiov.',     stock: 30,  stockMin: 10, precio: 55.00,  vencimiento: '2027-01-10' },
  { id: 8, nombre: 'Ciprofloxacino 500mg', categoria: 'Antibiótico',  stock: 5,   stockMin: 10, precio: 45.00,  vencimiento: '2026-06-30' },
]

export const ventasRecientes = [
  { id: 'V-0089', fecha: '01/04/2026', hora: '09:30', cajero: 'Jorge García',  productos: 3, total: 142.50, metodo: 'Efectivo',      estado: 'COMPLETADA' },
  { id: 'V-0088', fecha: '01/04/2026', hora: '09:15', cajero: 'Ana López',     productos: 1, total: 35.00,  metodo: 'Tarjeta',       estado: 'COMPLETADA' },
  { id: 'V-0087', fecha: '01/04/2026', hora: '08:55', cajero: 'Jorge García',  productos: 5, total: 218.00, metodo: 'Efectivo',      estado: 'COMPLETADA' },
  { id: 'V-0086', fecha: '01/04/2026', hora: '08:40', cajero: 'Ana López',     productos: 2, total: 67.00,  metodo: 'Transferencia', estado: 'COMPLETADA' },
  { id: 'V-0085', fecha: '31/03/2026', hora: '17:20', cajero: 'Jorge García',  productos: 4, total: 195.50, metodo: 'Efectivo',      estado: 'COMPLETADA' },
  { id: 'V-0084', fecha: '31/03/2026', hora: '16:45', cajero: 'Ana López',     productos: 1, total: 28.00,  metodo: 'Tarjeta',       estado: 'ANULADA'    },
]

export const proveedores = [
  { id: 1, nombre: 'Distribuidora Farma GT', contacto: 'Mario Pérez', telefono: '5555-1234', email: 'farma@gt.com',    activo: true  },
  { id: 2, nombre: 'MedSupply S.A.',         contacto: 'Rosa Gómez',  telefono: '5555-5678', email: 'med@supply.com', activo: true  },
  { id: 3, nombre: 'BioFarma Central',       contacto: 'Luis Torres', telefono: '5555-9012', email: 'bio@farma.com',  activo: false },
]

export const compras = [
  { id: 'C-0021', fecha: '28/03/2026', proveedor: 'Distribuidora Farma GT', productos: 8,  total: 3450.00, usuario: 'Jorge García' },
  { id: 'C-0020', fecha: '25/03/2026', proveedor: 'MedSupply S.A.',         productos: 5,  total: 1820.00, usuario: 'Jorge García' },
  { id: 'C-0019', fecha: '20/03/2026', proveedor: 'Distribuidora Farma GT', productos: 12, total: 5200.00, usuario: 'Jorge García' },
]

export const facturas = [
  { id: 'F-0089', venta: 'V-0089', fecha: '01/04/2026', nit: '1234567-8', cliente: 'Pedro Ramírez',     total: 142.50 },
  { id: 'F-0088', venta: 'V-0088', fecha: '01/04/2026', nit: 'CF',        cliente: 'Consumidor Final',  total: 35.00  },
  { id: 'F-0087', venta: 'V-0087', fecha: '01/04/2026', nit: '9876543-2', cliente: 'María López',       total: 218.00 },
]

export const usuarios = [
  { id: 1, nombre: 'Jorge García',   usuario: 'jgarcia',  rol: 'Admin',  activo: true  },
  { id: 2, nombre: 'Ana López',      usuario: 'alopez',   rol: 'Cajero', activo: true  },
  { id: 3, nombre: 'Carlos Mendoza', usuario: 'cmendoza', rol: 'Cajero', activo: false },
]

export const alertas = [
  { tipo: 'danger', texto: 'Omeprazol 20mg sin stock. Reabastecer urgente.', hora: '09:10' },
  { tipo: 'warn',   texto: 'Metformina 850mg vence en 18 días.',             hora: '08:45' },
  { tipo: 'warn',   texto: 'Paracetamol 500mg stock bajo (8 unid.).',        hora: '08:30' },
]

export const ventasSemanales = [
  { dia: 'L', ventas: 52, ingresos: 1850 },
  { dia: 'M', ventas: 65, ingresos: 2400 },
  { dia: 'X', ventas: 45, ingresos: 1600 },
  { dia: 'J', ventas: 78, ingresos: 3100 },
  { dia: 'V', ventas: 60, ingresos: 2200 },
  { dia: 'S', ventas: 38, ingresos: 1400 },
  { dia: 'D', ventas: 28, ingresos: 980  },
]

export const topProductos = [
  { pos: 1, nombre: 'Paracetamol 500mg',  unidades: 380, ingresos: 4560 },
  { pos: 2, nombre: 'Amoxicilina 500mg',  unidades: 210, ingresos: 7350 },
  { pos: 3, nombre: 'Ibuprofeno 400mg',   unidades: 195, ingresos: 3607 },
  { pos: 4, nombre: 'Losartán 50mg',      unidades: 144, ingresos: 6048 },
]