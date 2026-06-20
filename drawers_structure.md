# Estructura de Drawers

## EventSheet (`src/components/event/event-sheet.tsx`)
Este drawer muestra los detalles de un evento seleccionado.

**Configuración base:**
- Variant: `inset`
- Position: desktop (`right`), mobile (`bottom`)

**Contenido:**
1. **DrawerHeader**
   - Título: Tipo de evento (`eventType`)
   - Ubicación (`location`)
   - Badge del tipo de evento
   - Avisos/Alertas (si falta DJ, animadora o hay saldo pendiente)

2. **DrawerPanel (Scrollable)**
   - **Sección "Información General"**
     - Fecha (formato completo)
     - Rango de horas (inicio - fin) y duración
     - Ubicación
   - **Sección "Staff"**
     - Animadora(s)
     - Bailarinas / Staff Lúdico
     - DJ
     - Staff Adicional
     - Muñecos
   - **Sección "Finanzas"**
     - Total Evento
     - Movilidad
     - Adelanto
     - Saldo
     - Pago Personal
     - Ganancia
     - Observación (si existe)

3. **DrawerFooter**
   - Botón "Editar" (Icono de lápiz)
   - Botón "Eliminar" (Icono de papelera)
   - Botón "Generar Recibo" (con icono)

## EventFormSheet (`src/components/event/event-form-sheet.tsx`)
Drawer utilizado para crear o editar un evento.

**Configuración base:**
- Variant: `inset`
- Position: desktop (`right`), mobile (`bottom`)

**Contenido:**
1. **DrawerHeader**
   - Título: "Editar Evento" o "Nuevo Evento" (dependiendo si hay initialData)
   - Descripción: "Modifica los datos del evento." o "Completa la información para crear un nuevo evento."

2. **DrawerPanel**
   - Componente `EventForm` (con initialData, initialDate, onSubmit, onCancel)
