# PRD - Sistema de Gestión Grupo INEXO
## Documento de Requisitos del Producto

**Versión:** 1.0
**Fecha:** 15 de enero de 2026
**Desarrollado por:** Javier García (jgarcia@inexo.es)
**Organización:** Grupo INEXO

---

## 1. Resumen Ejecutivo

El Sistema de Gestión Grupo INEXO es una aplicación web de análisis económico y planificación para proyectos de construcción. La aplicación permite comparar y analizar datos de Contrato vs Coste a través de múltiples versiones, realizar planificación temporal, identificar desviaciones y gestionar la certidumbre de las partidas de obra.

### 1.1 Propósito
Proporcionar una herramienta integral para el análisis detallado de proyectos de construcción, permitiendo la comparación de presupuestos contractuales contra costes reales, con capacidad de versionado y análisis temporal.

### 1.2 Alcance
La aplicación gestiona el ciclo completo de análisis económico de obras desde la definición del presupuesto de contrato hasta el seguimiento de costes reales, pasando por la planificación temporal y el análisis de desviaciones.

---

## 2. Visión y Objetivos del Producto

### 2.1 Visión
Ser la herramienta principal de análisis económico y control de gestión para los proyectos de construcción de Grupo INEXO, facilitando la toma de decisiones basada en datos precisos y comparativas en tiempo real.

### 2.2 Objetivos Principales

1. **Transparencia:** Proporcionar visibilidad completa sobre la evolución económica de los proyectos
2. **Control:** Permitir la identificación temprana de desviaciones económicas
3. **Eficiencia:** Automatizar el análisis comparativo entre múltiples versiones de presupuestos
4. **Planificación:** Integrar la dimensión temporal en el análisis económico
5. **Precisión:** Aplicar coeficientes de paso (K) para ajustes económicos precisos

---

## 3. Usuarios y Stakeholders

### 3.1 Usuarios Principales

**Directores de Proyecto**
- Necesidad: Visión general del estado económico del proyecto
- Uso principal: Análisis detallado, comparativas, certidumbre

**Jefes de Obra**
- Necesidad: Control de desviaciones en tiempo real
- Uso principal: Partidas con mayor desviación, análisis de planificación

**Responsables de Compras**
- Necesidad: Identificación de partidas con mayores impactos económicos
- Uso principal: Análisis detallado filtrado por naturaleza

**Equipo Financiero**
- Necesidad: Análisis de versiones y variaciones económicas
- Uso principal: Comparativas de contrato y coste entre versiones

### 3.2 Administradores del Sistema

**Javier García (jgarcia@inexo.es)**
- Rol: Administrador principal
- Responsabilidades: Aprobación de usuarios, gestión de datos, soporte técnico

---

## 4. Características Principales

### 4.1 Autenticación y Control de Acceso

**Sistema de Autenticación Dual**
- Login con email y contraseña (Supabase Auth)
- Sistema de solicitud de acceso para nuevos usuarios
- Flujo de aprobación manual por el administrador
- Notificaciones automáticas al administrador vía Edge Function

**Estados de Usuario:**
- Pendiente de aprobación: Usuario registrado pero sin acceso
- Activo: Usuario con acceso completo al sistema
- Inactivo: Usuario con acceso revocado

### 4.2 Gestión de Obras y Versiones

**Selector de Obras**
- Lista desplegable con todas las obras disponibles
- Carga automática de la primera obra al iniciar sesión
- Persistencia de la selección durante la sesión

**Versionado Múltiple**
- Análisis: Versiones 0, 1, 2
- Contrato: Versiones 0, 1, 2
- Coste: Versiones 0, 1, 2
- Selectores independientes por tipo de dato
- Comparativas entre versiones

**Coeficiente de Paso (K)**
- Campo editable para ajuste económico
- Valor por defecto: 1.0
- Persistencia por obra en base de datos
- Actualización automática de cálculos al modificar

### 4.3 Vista: Análisis Detallado SGI - Árbol

**Estructura Jerárquica en Árbol**
- Organización por niveles (Capítulo → Partida → Descompuesto)
- Expansión/contracción de nodos por nivel
- Indicadores visuales de jerarquía con código de colores

**Columnas de Información**
- Identificación: Código, Nivel, Naturaleza, Descripción, UD
- Contrato: Cantidad, Precio, Importe
- Coste: Cantidad, Precio, Precio.K, Importe.K
- Comparativas: Dif.Medición, Dif.Importe, Varianza %

**Funcionalidades Avanzadas**
- Redimensionamiento de columnas arrastrando
- Ordenación por columnas (Contrato Importe, Coste Importe.K, Diferencias)
- Filtrado por naturaleza (Capítulo, Partida, Material, Mano de obra, etc.)
- Totales calculados en tiempo real
- Codificación por colores según nivel jerárquico
- Visualización de descomposiciones

**Cálculos Automáticos**
- Precio.K = Precio Coste × Coeficiente K
- Importe.K = Cantidad Coste × Precio.K
- Dif.Medición = Cantidad Coste - Cantidad Contrato
- Dif.Importe = Importe Contrato - Importe.K
- Varianza % = (Dif.Importe / Importe Contrato) × 100

**Exportación**
- Formato CSV compatible con Excel
- Inclusión de todas las columnas
- Fila de totales al final
- Codificación UTF-8 con BOM

### 4.4 Vista: Partidas con Mayor Desviación

**Objetivo**
Identificar rápidamente las partidas con mayores diferencias económicas entre contrato y coste.

**Funcionalidades**
- Lista ordenada por desviación (descendente)
- Filtrado automático a partidas (excluye capítulos y descompuestos)
- Presentación tabular clara
- Indicadores visuales de desviación positiva/negativa
- Totales agregados

**Información Mostrada**
- Código y descripción de partida
- Importes de contrato y coste.K
- Diferencia de importe
- Porcentaje de varianza
- Visualización con colores (verde positivo, rojo negativo)

### 4.5 Vista: Comparativa Coste vs Coste

**Objetivo**
Comparar dos versiones de coste para identificar cambios y evolución.

**Funcionalidades**
- Selectores independientes para Coste 1 y Coste 2
- Estructura de árbol jerárquico
- Visualización de diferencias absolutas y porcentuales
- Aplicación del coeficiente K en ambas versiones

**Columnas**
- Identificación de partida
- Coste Versión 1: Cantidad, Precio.K, Importe.K
- Coste Versión 2: Cantidad, Precio.K, Importe.K
- Diferencias: Cantidad, Importe, Varianza %

### 4.6 Vista: Comparativa Contrato vs Contrato

**Objetivo**
Analizar la evolución del presupuesto contractual entre versiones.

**Funcionalidades**
- Selectores independientes para Contrato 1 y Contrato 2
- Estructura de árbol jerárquico
- Identificación de modificados, reformados y revisiones de precio
- Visualización de diferencias sin aplicación de coeficiente K

**Columnas**
- Identificación de partida
- Contrato Versión 1: Cantidad, Precio, Importe
- Contrato Versión 2: Cantidad, Precio, Importe
- Diferencias: Cantidad, Importe, Varianza %

### 4.7 Vista: Análisis Planificación

**Objetivo**
Distribuir temporalmente los importes económicos según la planificación de las partidas.

**Funcionalidades Principales**
- Integración de datos de planificación temporal
- Generación dinámica de columnas mensuales
- Cálculo de rendimientos diarios
- Distribución proporcional de importes por mes
- Selectores: Fuente (Contrato/Coste), Versión, Valor (Cantidad/Importe)

**Columnas Fijas**
- Código, Nat., Descripción, UD, UserText
- Valor según fuente y tipo seleccionado
- Fecha Inicio, Fecha Fin
- Duración en días y meses
- Rendimiento por día

**Columnas Mensuales Dinámicas**
- Generadas según rango de fechas del proyecto
- Formato: "mes N (D/M/AA)"
- Cálculo automático del valor correspondiente al periodo
- Totales por mes en fila de totales

**Cálculos Temporales**
- Días laborables (excluye fines de semana)
- Distribución lineal por días laborables
- Consideración de inicio/fin en medio de mes
- Totales acumulados

**Exportación**
- CSV con todas las columnas mensuales
- Formato compatible con Excel
- Fila de totales incluida

### 4.8 Vista: Certidumbre

**Objetivo**
Evaluar el grado de certeza o incertidumbre de las partidas del proyecto basándose en la completitud de la información.

**Métricas de Certidumbre**
- Completitud de datos de contrato
- Completitud de datos de coste
- Existencia de planificación temporal
- Coherencia entre versiones

**Funcionalidades**
- Visualización jerárquica
- Indicadores de certidumbre por partida
- Filtrado por nivel de certidumbre
- Exportación de análisis

---

## 5. Requisitos Funcionales Detallados

### 5.1 RF-001: Gestión de Usuarios

**RF-001.1** El sistema debe permitir el registro de nuevos usuarios con nombre completo, email y contraseña.

**RF-001.2** Los nuevos usuarios deben quedar en estado "Pendiente de aprobación" hasta que el administrador los active.

**RF-001.3** El sistema debe enviar una notificación automática al administrador cuando se registra un nuevo usuario.

**RF-001.4** Los usuarios no aprobados deben ver un mensaje indicando que su solicitud está pendiente.

**RF-001.5** El administrador debe poder activar/desactivar usuarios desde la tabla Users.

**RF-001.6** El sistema debe mantener una auditoría de cambios de estado de usuarios.

### 5.2 RF-002: Autenticación

**RF-002.1** El sistema debe verificar las credenciales usando Supabase Authentication.

**RF-002.2** El sistema debe validar que el usuario esté aprobado antes de dar acceso.

**RF-002.3** Las sesiones deben persistir hasta que el usuario cierre sesión explícitamente.

**RF-002.4** El sistema debe verificar la autenticación al cargar la aplicación.

**RF-002.5** Debe existir un botón de "Cerrar Sesión" visible en todo momento.

### 5.3 RF-003: Gestión de Obras

**RF-003.1** El sistema debe cargar todas las obras disponibles para el usuario.

**RF-003.2** Debe mostrar un selector desplegable con las obras ordenadas alfabéticamente.

**RF-003.3** Al seleccionar una obra, debe cargar automáticamente sus datos.

**RF-003.4** Debe mantener la obra seleccionada durante toda la sesión.

**RF-003.5** Debe mostrar las versiones disponibles para cada tipo de dato.

### 5.4 RF-004: Gestión del Coeficiente K

**RF-004.1** Debe existir un campo editable para el coeficiente K por obra.

**RF-004.2** El valor por defecto debe ser 1.0.

**RF-004.3** Los cambios deben guardarse automáticamente en la base de datos.

**RF-004.4** Los cálculos deben actualizarse inmediatamente al cambiar el valor.

**RF-004.5** El valor debe cargarse automáticamente al seleccionar una obra.

### 5.5 RF-005: Navegación entre Vistas

**RF-005.1** Debe existir una barra de pestañas para cambiar entre vistas.

**RF-005.2** La vista activa debe estar visualmente destacada.

**RF-005.3** El cambio de vista debe ser inmediato sin recargar la página.

**RF-005.4** Los filtros y configuraciones no deben persistir entre vistas.

**RF-005.5** Debe existir un botón de "Actualizar" global.

### 5.6 RF-006: Análisis Detallado

**RF-006.1** Debe mostrar una estructura jerárquica en árbol.

**RF-006.2** Los nodos deben poder expandirse/contraerse individualmente.

**RF-006.3** Debe existir control de expansión por niveles (+/-).

**RF-006.4** Las columnas deben ser redimensionables.

**RF-006.5** Debe permitir ordenación por columnas numéricas.

**RF-006.6** Debe incluir filtrado por naturaleza con checkbox múltiple.

**RF-006.7** Debe calcular y mostrar totales en tiempo real.

**RF-006.8** Debe permitir exportación a CSV con formato Excel.

**RF-006.9** Los colores deben codificar el nivel jerárquico.

**RF-006.10** Las diferencias positivas/negativas deben tener colores distintivos.

### 5.7 RF-007: Partidas con Mayor Desviación

**RF-007.1** Debe mostrar solo partidas (excluir capítulos y descompuestos).

**RF-007.2** Debe ordenar por desviación de importe (descendente).

**RF-007.3** Debe calcular varianza porcentual.

**RF-007.4** Debe mostrar indicadores visuales de desviación.

**RF-007.5** Debe incluir fila de totales.

**RF-007.6** Debe permitir exportación a CSV.

### 5.8 RF-008: Comparativas

**RF-008.1** Debe permitir seleccionar dos versiones independientes.

**RF-008.2** Debe mantener la estructura jerárquica en árbol.

**RF-008.3** Debe calcular diferencias absolutas y porcentuales.

**RF-008.4** Debe aplicar coeficiente K en comparativas de coste.

**RF-008.5** No debe aplicar coeficiente K en comparativas de contrato.

**RF-008.6** Debe mostrar totales de diferencias.

**RF-008.7** Debe permitir exportación a CSV.

### 5.9 RF-009: Análisis de Planificación

**RF-009.1** Debe integrar datos de planificación temporal.

**RF-009.2** Debe generar columnas mensuales dinámicamente.

**RF-009.3** Debe calcular días laborables excluyendo fines de semana.

**RF-009.4** Debe distribuir valores proporcionalmente por días.

**RF-009.5** Debe permitir cambiar fuente (Contrato/Coste).

**RF-009.6** Debe permitir cambiar tipo de valor (Cantidad/Importe).

**RF-009.7** Debe calcular rendimientos diarios.

**RF-009.8** Debe calcular totales por mes.

**RF-009.9** Debe mostrar fechas de inicio y fin por partida.

**RF-009.10** Debe permitir exportación incluyendo columnas mensuales.

### 5.10 RF-010: Certidumbre

**RF-010.1** Debe evaluar completitud de información por partida.

**RF-010.2** Debe mostrar indicadores de certidumbre.

**RF-010.3** Debe permitir filtrado por nivel de certidumbre.

**RF-010.4** Debe mantener la estructura jerárquica.

**RF-010.5** Debe permitir exportación de análisis.

---

## 6. Requisitos No Funcionales

### 6.1 Rendimiento

**RNF-001** Las consultas a base de datos deben completarse en menos de 3 segundos.

**RNF-002** La carga inicial de la aplicación debe completarse en menos de 2 segundos.

**RNF-003** El cambio entre vistas debe ser instantáneo (<200ms).

**RNF-004** La aplicación debe soportar hasta 50 usuarios simultáneos.

**RNF-005** Debe manejar obras con hasta 10,000 partidas sin degradación de rendimiento.

### 6.2 Usabilidad

**RNF-006** La interfaz debe ser responsive (desktop mínimo 1366x768).

**RNF-007** Los controles deben tener tooltips explicativos.

**RNF-008** Los mensajes de error deben ser claros y accionables.

**RNF-009** El sistema debe usar lenguaje en español.

**RNF-010** Los números deben formatearse según estándar español (1.234,56).

### 6.3 Seguridad

**RNF-011** Todas las contraseñas deben almacenarse hasheadas.

**RNF-012** Las sesiones deben usar tokens JWT.

**RNF-013** Todas las comunicaciones deben usar HTTPS.

**RNF-014** Los usuarios solo deben ver datos de obras autorizadas.

**RNF-015** Las políticas RLS deben proteger todos los datos sensibles.

### 6.4 Disponibilidad

**RNF-016** El sistema debe tener una disponibilidad del 99.5%.

**RNF-017** Las actualizaciones deben realizarse sin tiempo de inactividad.

**RNF-018** Debe existir un plan de recuperación ante desastres.

### 6.5 Mantenibilidad

**RNF-019** El código debe estar documentado con comentarios claros.

**RNF-020** Debe existir documentación técnica actualizada.

**RNF-021** Los componentes deben seguir principios de responsabilidad única.

**RNF-022** Debe existir separación clara entre lógica de negocio y presentación.

### 6.6 Escalabilidad

**RNF-023** La arquitectura debe permitir agregar nuevas vistas sin modificar las existentes.

**RNF-024** El modelo de datos debe soportar nuevas versiones sin cambios estructurales.

**RNF-025** El sistema debe poder escalar horizontalmente según demanda.

---

## 7. Arquitectura Técnica

### 7.1 Stack Tecnológico

**Frontend**
- React 18.3.1 con TypeScript
- Vite como bundler y dev server
- Tailwind CSS para estilos
- Lucide React para iconografía

**Backend**
- Supabase como Backend as a Service
- PostgreSQL como base de datos
- Row Level Security (RLS) para seguridad
- Supabase Edge Functions para lógica serverless

**Autenticación**
- Supabase Auth con email/password
- JWT para gestión de sesiones
- Sistema de aprobación personalizado

### 7.2 Arquitectura de Componentes

```
src/
├── App.tsx                          # Componente principal y enrutamiento
├── main.tsx                         # Punto de entrada
├── components/
│   ├── LoginScreen.tsx              # Autenticación y registro
│   ├── IntegratedTreeView.tsx       # Análisis detallado SGI
│   ├── PartidaDesviacionView.tsx    # Partidas con mayor desviación
│   ├── CosteComparativaTreeView.tsx # Comparativa Coste vs Coste
│   ├── ContratoComparativaTreeView.tsx # Comparativa Contrato vs Contrato
│   ├── AnalisisPlanificacion.tsx    # Análisis temporal
│   ├── CertidumbreView.tsx          # Análisis de certidumbre
│   └── [otros componentes]
├── lib/
│   ├── supabase.ts                  # Cliente y queries Supabase
│   └── dataQuality.ts               # Utilidades de validación
└── index.css                        # Estilos globales
```

### 7.3 Flujo de Datos

1. **Inicialización**
   - Usuario accede a la aplicación
   - Verificación de sesión con Supabase Auth
   - Validación de estado "Aceptado" en tabla Users
   - Carga de obras disponibles

2. **Selección de Obra**
   - Usuario selecciona obra del dropdown
   - Carga de coeficiente K desde obra_coef_k
   - Carga de versiones disponibles desde base_datos_sgi
   - Query a lineas_analisis con versión seleccionada

3. **Enriquecimiento de Datos**
   - Join con lineas_contrato para datos de contrato
   - Join con lineas_coste para datos de coste
   - Join con lineas_planin para datos temporales
   - Aplicación de coeficiente K en cálculos
   - Cálculo de descomposiciones

4. **Renderizado**
   - Construcción de estructura de árbol jerárquico
   - Aplicación de filtros y ordenamientos
   - Cálculo de totales agregados
   - Renderizado responsive de la vista activa

### 7.4 Modelo de Base de Datos

**Tablas Principales**

1. **Users**
   - ID (PK)
   - Nombre
   - Mail (unique)
   - Password (deprecated, solo para migración)
   - Aceptado (boolean)
   - auth_user_id (FK a auth.users)
   - created_at

2. **base_datos_sgi**
   - cod_obra
   - version
   - [campos adicionales de metadatos]

3. **lineas_analisis**
   - id (PK)
   - indice
   - cod_obra
   - version
   - Nivel
   - codigo
   - codigo2
   - resumen
   - nat (naturaleza)
   - ud (unidad)
   - Guid_SGI
   - CodSup (código superior para jerarquía)
   - plan_guid (FK a lineas_planin)
   - clave_compuesta
   - clave_compuesta_cto
   - [otros campos]

4. **lineas_contrato**
   - id (PK)
   - cod_obra
   - version
   - clave_compuesta
   - tipo_informacion
   - canpres (cantidad)
   - pres (precio)
   - imppres (importe)
   - [otros campos]

5. **lineas_coste**
   - id (PK)
   - cod_obra
   - version
   - clave_compuesta
   - tipo_informacion
   - canpres (cantidad)
   - pres (precio)
   - imppres (importe)
   - [otros campos]

6. **lineas_planin**
   - id (PK)
   - plan_guid
   - cod_obra
   - comienzo (fecha)
   - fin (fecha)
   - duracion (días)

7. **obra_coef_k**
   - cod_obra (PK)
   - coef_k (decimal)
   - updated_at

**Vistas**

1. **vw_analisisdetallado** (deprecated)
   - Vista materializada con joins pre-calculados
   - Nota: La aplicación actualmente no la usa, hace los joins en runtime

**Funciones de Base de Datos**

1. **get_distinct_versions(table_name, obra_code)**
   - Retorna versiones únicas para una obra en una tabla específica
   - Usado para poblar selectores de versiones

### 7.5 Seguridad - Row Level Security (RLS)

**Políticas Implementadas**

1. **Users Table**
   ```sql
   -- Lectura: Usuarios autenticados ven su propio registro
   FOR SELECT TO authenticated
   USING (auth.uid() = auth_user_id)

   -- Escritura: Usuarios autenticados actualizan su propio registro
   FOR UPDATE TO authenticated
   USING (auth.uid() = auth_user_id)
   ```

2. **Tablas de Datos (lineas_*, base_datos_sgi, etc.)**
   ```sql
   -- Lectura: Todos los usuarios autenticados
   FOR SELECT TO authenticated
   USING (true)
   ```

3. **obra_coef_k**
   ```sql
   -- Lectura: Todos los usuarios autenticados
   FOR SELECT TO authenticated USING (true)

   -- Escritura: Todos los usuarios autenticados
   FOR INSERT/UPDATE TO authenticated WITH CHECK (true)
   ```

---

## 8. Algoritmos y Lógica de Negocio

### 8.1 Cálculo de Descomposiciones

Cuando una partida tiene hijos (descompuestos), el sistema redistribuye el precio de contrato proporcionalmente:

```typescript
// Para cada partida padre con precio de contrato > 0
const precioContratoPadre = partida.Contrato_vN_precio;

// Sumar importes de coste de hijos aplicando K
const sumaImportesCosteHijosK = hijos.reduce((sum, hijo) => {
  return sum + (hijo.Coste_vN_importe * coeficienteK);
}, 0);

// Calcular proporción y redistribuir para cada hijo
hijos.forEach(hijo => {
  const importeCosteHijoK = hijo.Coste_vN_importe * coeficienteK;
  const proporcion = importeCosteHijoK / sumaImportesCosteHijosK;

  hijo.Contrato_vN_importe = proporcion * precioContratoPadre;
  hijo.Contrato_vN_cant = hijo.Coste_vN_cant;
  hijo.Contrato_vN_precio = hijo.Contrato_vN_importe / hijo.Contrato_vN_cant;
});
```

### 8.2 Distribución Temporal (Planificación)

Para distribuir un valor total en meses:

```typescript
// Calcular días laborables totales (excluyendo fines de semana)
const totalWorkingDays = getTotalWorkingDays(startDate, endDate);

// Para cada mes en el rango
monthColumns.forEach(col => {
  // Días laborables que se solapan con el mes
  const workingDaysInMonth = getWorkingDaysInMonth(
    col.year,
    col.month,
    startDate,
    endDate
  );

  // Valor proporcional al mes
  const monthValue = (totalValue / totalWorkingDays) * workingDaysInMonth;
});
```

### 8.3 Construcción del Árbol Jerárquico

```typescript
function buildTree(items: AnalisisDetallado[]): TreeNode[] {
  // Crear mapas de búsqueda
  const itemMap = new Map<string, TreeNode>();
  const itemMapByCodigo = new Map<string, TreeNode>();

  // Poblar mapas
  items.forEach(item => {
    const node = { ...item, children: [] };
    itemMap.set(item.Guid_SGI, node);
    itemMapByCodigo.set(item.codigo, node);
  });

  // Construir jerarquía
  items.forEach(item => {
    const node = itemMap.get(item.Guid_SGI);
    if (item.CodSup) {
      // Buscar padre por GUID o por código
      let parent = itemMap.get(item.CodSup) || itemMapByCodigo.get(item.CodSup);
      if (parent) {
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  });

  return rootNodes;
}
```

### 8.4 Agregación de Datos de Contrato y Coste

Para versión 0 de Contrato (usa agregación especial):
```typescript
// Suma de importes, máximo de cantidades y precios
contratoMapV0.set(key, {
  canpres: Math.max(current.canpres, newCanpres),
  pres: Math.max(current.pres, newPres),
  imppres: current.imppres + newImppres // SUMA de importes
});
```

Para versiones 1+ de Contrato y todas de Coste:
```typescript
// Igual que v0 pero organizado por versión
versionMap.get(version).set(key, {
  canpres: Math.max(current.canpres, newCanpres),
  pres: Math.max(current.pres, newPres),
  imppres: current.imppres + newImppres
});
```

---

## 9. Flujos de Usuario

### 9.1 Flujo de Registro y Primer Acceso

1. Usuario nuevo accede a la aplicación
2. Sistema muestra pantalla de login con dos pestañas
3. Usuario selecciona "Solicitar Acceso"
4. Usuario completa formulario:
   - Nombre completo
   - Email corporativo
   - Contraseña (mínimo 6 caracteres)
   - Confirmación de contraseña
5. Sistema valida datos y crea usuario en Supabase Auth
6. Sistema inserta registro en tabla Users con Aceptado=false
7. Sistema dispara Edge Function para notificar a jgarcia@inexo.es
8. Usuario ve mensaje de confirmación
9. Administrador recibe email de notificación
10. Administrador actualiza campo Aceptado=true en BD
11. Usuario puede ahora hacer login

### 9.2 Flujo de Login

1. Usuario ingresa email y contraseña
2. Sistema valida con Supabase Auth
3. Sistema verifica campo Aceptado en tabla Users
4. Si no aceptado: Muestra mensaje de acceso pendiente
5. Si aceptado: Carga aplicación principal
6. Sistema carga lista de obras
7. Sistema selecciona primera obra por defecto
8. Sistema carga coeficiente K de la obra
9. Sistema carga versiones disponibles
10. Sistema carga datos de análisis
11. Usuario ve vista "Análisis Detallado SGI" por defecto

### 9.3 Flujo de Análisis Detallado

1. Usuario selecciona obra del selector
2. Usuario ajusta coeficiente K si necesario
3. Usuario selecciona versiones de Análisis, Contrato y Coste
4. Sistema recarga datos con nuevas selecciones
5. Usuario expande/contrae niveles del árbol con botones +/-
6. Usuario ordena por columnas clickeando headers
7. Usuario filtra por naturaleza usando icono de filtro
8. Usuario redimensiona columnas arrastrando bordes
9. Usuario revisa totales en fila inferior
10. Usuario exporta datos a Excel usando botón "Exportar"
11. Sistema genera CSV con timestamp en nombre

### 9.4 Flujo de Identificación de Desviaciones

1. Usuario cambia a vista "Partidas con mayor Desviación"
2. Sistema filtra automáticamente a tipo "Partida"
3. Sistema ordena por diferencia de importe (mayor a menor)
4. Usuario revisa lista ordenada
5. Usuario identifica partidas con mayores desviaciones
6. Usuario puede volver a "Análisis Detallado" para ver detalles
7. Usuario exporta lista si necesario

### 9.5 Flujo de Comparativa entre Versiones

1. Usuario cambia a vista "Comparativa Coste vs Coste"
2. Usuario selecciona Coste Versión 1 (ej: v0)
3. Usuario selecciona Coste Versión 2 (ej: v1)
4. Sistema calcula diferencias y varianzas
5. Usuario navega por árbol jerárquico
6. Usuario identifica cambios entre versiones
7. Usuario exporta comparativa si necesario
8. (Proceso similar para Comparativa Contrato vs Contrato)

### 9.6 Flujo de Planificación Temporal

1. Usuario cambia a vista "Análisis Planificación"
2. Usuario selecciona Fuente (Contrato o Coste)
3. Usuario selecciona Versión de la fuente
4. Usuario selecciona Valor (Cantidad o Importe)
5. Sistema genera columnas mensuales según rango de fechas
6. Sistema distribuye valores proporcionalmente
7. Usuario revisa distribución temporal
8. Usuario verifica totales por mes
9. Usuario exporta plan a Excel

---

## 10. Interfaz de Usuario

### 10.1 Layout General

**Header Fijo**
- Logo de Grupo INEXO (izquierda)
- Título: "SISTEMA DE GESTIÓN GRUPO INEXO"
- Controles principales:
  - Selector de Obra
  - Input de Coeficiente K
  - Selectores de Versiones (contextuales)
  - Botón "Actualizar"
  - Botón "Salir" con icono
- Indicador de usuario (email) en extremo derecho

**Barra de Pestañas**
- "Análisis Detallado SGI - Árbol"
- "Partidas con mayor Desviación"
- "Comparativa Coste vs Coste"
- "Comparativa Contrato vs Contrato"
- "Análisis Planificación"
- "Certidumbre"

**Área de Contenido**
- Barra de herramientas de vista (contextuales)
- Tabla o árbol de datos
- Controles de paginación/scroll
- Fila de totales (sticky bottom cuando aplique)

### 10.2 Diseño Visual

**Paleta de Colores**

Niveles de Capítulo:
- Nivel 1: bg-emerald-200 (verde oscuro)
- Nivel 2: bg-emerald-150 (verde medio)
- Nivel 3: bg-emerald-100 (verde claro)
- Nivel 4+: bg-emerald-50 (verde muy claro)

Columnas de Datos:
- Contrato: bg-blue-50 (azul claro)
- Coste: bg-amber-50 (ámbar claro)
- Diferencias positivas: text-green-600
- Diferencias negativas: text-red-600

Estados:
- Hover rows: hover:bg-slate-100
- Selected row: bg-blue-100
- Descompuestos: bg-slate-50

**Tipografía**
- Headers: text-xs font-semibold uppercase
- Códigos: font-mono
- Números: font-mono text-right
- Totales: font-bold
- Descripciones: font-normal

**Iconografía** (Lucide React)
- ChevronRight/ChevronDown: Expandir/contraer árbol
- ArrowUpDown/ArrowUp/ArrowDown: Ordenamiento
- Filter: Filtrado
- Download: Exportación
- RotateCcw: Restablecer
- LogOut: Cerrar sesión
- AlertCircle: Errores
- CheckCircle: Éxito

### 10.3 Responsividad

**Breakpoints**
- Desktop: ≥1366px (optimizado)
- Large Desktop: ≥1920px (soportado)

**Comportamiento**
- Tablas con scroll horizontal
- Sticky columns para identificación
- Sticky headers
- Sticky totals footer
- Altura máxima: calc(100vh - 280px)

---

## 11. Exportación de Datos

### 11.1 Formato CSV

**Características**
- Codificación: UTF-8 con BOM (\uFEFF)
- Separador: punto y coma (;)
- Formato de números: español (1.234,56)
- Escapado de caracteres especiales en valores

**Nombre de Archivo**
- Patrón: `{tipo_analisis}_{timestamp}.csv`
- Timestamp formato: YYYY-MM-DDTHH-mm-ss
- Ejemplo: `analisis_detallado_2026-01-15T10-30-45.csv`

**Contenido**
- Fila 1: Headers de columnas
- Filas 2-N: Datos (manteniendo jerarquía por código/sangría)
- Última fila: TOTALES (cuando aplique)

### 11.2 Tipos de Exportación

1. **Análisis Detallado**
   - Todas las columnas de identificación y datos
   - Incluye versiones seleccionadas
   - Totales de contrato, coste y diferencias

2. **Partidas con Desviación**
   - Solo partidas (filtradas)
   - Ordenadas por desviación
   - Incluye totales

3. **Comparativas**
   - Columnas de ambas versiones
   - Columnas de diferencias
   - Totales por versión y diferencia total

4. **Análisis Planificación**
   - Columnas fijas de identificación
   - Todas las columnas mensuales generadas
   - Totales por mes en última fila

---

## 12. Gestión de Errores

### 12.1 Tipos de Errores

**Errores de Autenticación**
- Credenciales incorrectas
- Usuario no aprobado
- Sesión expirada
- Sin permisos

**Errores de Datos**
- Obra sin datos
- Versión no disponible
- Coeficiente K inválido
- Datos incompletos o corruptos

**Errores de Red**
- Sin conexión
- Timeout de consulta
- Error del servidor

### 12.2 Manejo de Errores

**Mensajes al Usuario**
- Claros y en español
- Accionables cuando sea posible
- Con opción de "Reintentar"
- Sin detalles técnicos innecesarios

**Logging**
- Console.error para debug
- Información contextual en logs
- No exposición de datos sensibles

**Recuperación**
- Retry automático en errores de red (1 intento)
- Botón manual de "Actualizar" para usuario
- Mantenimiento del estado cuando sea posible

---

## 13. Rendimiento y Optimización

### 13.1 Estrategias de Carga de Datos

**Paginación**
- Carga de 1000 registros por página desde BD
- Iteración hasta obtener todos los datos
- Agregación en memoria

**Caching**
- No hay caching explícito (datos en tiempo real)
- Estado mantenido durante la sesión
- Recarga manual por usuario

**Lazy Loading**
- Árbol: Solo nodos expandidos se renderizan
- Columnas mensuales: Generadas dinámicamente según rango
- Descomposiciones: Calculadas on-demand

### 13.2 Optimizaciones de Renderizado

**React**
- useState para estado local
- useEffect para efectos de carga
- useMemo para cálculos pesados (totales)
- Componentes funcionales exclusivamente

**DOM Virtual**
- Reconciliación eficiente de React
- Keys únicas por Guid_SGI
- Memoización de componentes pesados cuando necesario

### 13.3 Optimizaciones de Base de Datos

**Índices**
- Por cod_obra en todas las tablas
- Por clave_compuesta en lineas_*
- Por version en tablas versionadas
- Por plan_guid en lineas_planin

**Queries**
- Selección de columnas específicas (no SELECT *)
- Uso de RPC para versiones (get_distinct_versions)
- Joins en aplicación para mayor flexibilidad

---

## 14. Testing y QA

### 14.1 Casos de Prueba Críticos

**CP-001: Login Exitoso**
- Usuario con credenciales válidas y Aceptado=true
- Resultado: Acceso a aplicación principal

**CP-002: Login Usuario No Aprobado**
- Usuario con credenciales válidas y Aceptado=false
- Resultado: Mensaje de acceso pendiente

**CP-003: Cambio de Obra**
- Seleccionar obra diferente
- Resultado: Carga de nuevos datos, coef K correcto, versiones actualizadas

**CP-004: Modificación de Coeficiente K**
- Cambiar valor de K
- Resultado: Recálculo automático de todos los valores K

**CP-005: Expansión de Árbol**
- Expandir/contraer nodos
- Resultado: Visualización correcta de jerarquía

**CP-006: Ordenamiento por Columna**
- Click en header de columna ordenable
- Resultado: Datos ordenados correctamente (asc/desc/original)

**CP-007: Filtrado por Naturaleza**
- Seleccionar múltiples naturalezas
- Resultado: Solo registros de esas naturalezas visibles

**CP-008: Cálculo de Totales**
- Verificar suma de partidas = total
- Resultado: Totales correctos en tiempo real

**CP-009: Exportación a CSV**
- Exportar vista actual
- Resultado: Archivo CSV válido con datos correctos

**CP-010: Comparativa entre Versiones**
- Seleccionar dos versiones diferentes
- Resultado: Diferencias calculadas correctamente

**CP-011: Distribución Temporal**
- Vista planificación con rango de meses
- Resultado: Distribución proporcional correcta, suma = total

**CP-012: Descomposiciones**
- Partida con hijos descompuestos
- Resultado: Redistribución proporcional según coste * K

### 14.2 Validaciones de Datos

- Verificar que totales coinciden con suma de partidas
- Validar que porcentajes de varianza se calculan correctamente
- Confirmar que coeficiente K se aplica solo donde corresponde
- Verificar integridad referencial (GUIDs, códigos superiores)
- Validar fechas de planificación (inicio < fin)
- Confirmar días laborables excluyen fines de semana

---

## 15. Deployment y DevOps

### 15.1 Entorno de Desarrollo

**Local**
- Node.js 18+
- npm como gestor de paquetes
- Vite dev server en puerto 5173
- Variables de entorno en .env

**Variables de Entorno**
```
VITE_SUPABASE_URL=https://[proyecto].supabase.co
VITE_SUPABASE_ANON_KEY=[clave_publica]
```

### 15.2 Entorno de Producción

**Hosting**
- Frontend: Vercel / Netlify / Supabase Hosting
- Backend: Supabase (managed)
- Base de Datos: Supabase PostgreSQL (managed)

**CI/CD**
- Git push a rama main
- Build automático (npm run build)
- Deploy automático a producción
- Verificación post-deploy

### 15.3 Monitoreo

**Métricas**
- Tiempo de respuesta de queries
- Tasa de errores
- Usuarios activos
- Uso de recursos

**Alertas**
- Errores de autenticación > 10/hora
- Queries > 5 segundos
- Downtime > 1 minuto
- Espacio en disco < 20%

---

## 16. Mantenimiento y Soporte

### 16.1 Actualizaciones de Datos

**Carga de Nuevas Obras**
1. Preparar datos en formato requerido
2. Insertar en base_datos_sgi
3. Insertar en lineas_analisis
4. Insertar en lineas_contrato
5. Insertar en lineas_coste
6. Insertar en lineas_planin (opcional)
7. Verificar integridad de claves compuestas

**Nuevas Versiones de Obra Existente**
1. Incrementar número de versión
2. Insertar datos con nueva versión
3. Sistema detecta automáticamente versiones disponibles
4. Usuarios pueden seleccionar nueva versión

### 16.2 Gestión de Usuarios

**Aprobación de Nuevos Usuarios**
1. Recibir notificación de solicitud
2. Verificar identidad del solicitante
3. Conectar a BD Supabase
4. Actualizar Users.Aceptado = true WHERE Mail = 'usuario@email.com'
5. Notificar al usuario (manual)

**Desactivación de Usuario**
1. Identificar usuario a desactivar
2. Actualizar Users.Aceptado = false
3. Usuario no podrá acceder en próximo login

### 16.3 Soporte Técnico

**Contacto**
- Email: jgarcia@inexo.es
- Respuesta: 24-48 horas hábiles

**Niveles de Severidad**
- Crítico: No se puede acceder (4 horas)
- Alto: Funcionalidad principal afectada (1 día)
- Medio: Funcionalidad secundaria afectada (3 días)
- Bajo: Mejoras y sugerencias (según roadmap)

---

## 17. Roadmap y Futuras Mejoras

### 17.1 Corto Plazo (1-3 meses)

**Mejoras de Usabilidad**
- Búsqueda de partidas por código o descripción
- Guardado de vistas personalizadas por usuario
- Configuración de columnas visibles/ocultas
- Tooltips con información adicional en hover

**Optimizaciones**
- Caching de datos de obra en sesión
- Virtualización de listas largas (react-window)
- Web Workers para cálculos pesados

**Reportes**
- Generación de PDF con gráficos
- Dashboard ejecutivo con KPIs
- Gráficos de evolución temporal

### 17.2 Mediano Plazo (3-6 meses)

**Funcionalidades Nuevas**
- Gestión de workflows de aprobación
- Comentarios y anotaciones en partidas
- Alertas configurables por usuario
- Integración con sistema ERP

**Análisis Avanzados**
- Predicción de desviaciones con IA
- Análisis de tendencias históricas
- Benchmarking entre obras similares
- Simulaciones de escenarios

**Colaboración**
- Compartir vistas con otros usuarios
- Notificaciones en tiempo real
- Chat integrado por partida
- Histórico de cambios con auditoría

### 17.3 Largo Plazo (6-12 meses)

**Plataforma**
- API REST pública
- Integraciones con terceros (MS Project, Primavera)
- Mobile app (React Native)
- Modo offline con sincronización

**Inteligencia de Negocio**
- Data warehouse para históricos
- Machine Learning para estimaciones
- Análisis predictivo de riesgos
- Cuadros de mando personalizables

**Escalabilidad**
- Multi-tenant para grupos empresariales
- Roles y permisos granulares
- Configuración por cliente
- White label

---

## 18. Glosario

**Análisis:** Versión de la estructura jerárquica de la obra (EDT/WBS)

**Capítulo:** Agrupación de partidas en la estructura jerárquica

**Certidumbre:** Grado de completitud y confiabilidad de la información de una partida

**Clave Compuesta:** Identificador único formado por cod_obra + codigo + version

**Coeficiente K:** Factor de conversión entre unidades de coste y contrato

**Contrato:** Presupuesto aprobado por el cliente

**Coste:** Presupuesto interno de la empresa

**Descompuesto:** Elemento de menor nivel (material, mano de obra, maquinaria, otros)

**Descomposición:** Partida que se desglosa en descompuestos

**Desviación:** Diferencia entre lo contratado y lo costado

**EDT (WBS):** Estructura de Desglose del Trabajo

**Guid_SGI:** Identificador global único en el sistema SGI

**Importe:** Cantidad × Precio

**Importe.K:** Importe de coste ajustado con coeficiente K

**Naturaleza (nat):** Tipo de elemento (Capítulo, Partida, Material, etc.)

**Nivel:** Profundidad en la jerarquía (1=raíz, 2=subcapítulo, etc.)

**Partida:** Unidad mínima de presupuesto con precio unitario

**Planificación:** Distribución temporal de las actividades

**Precio:** Valor unitario de una partida

**Precio.K:** Precio de coste ajustado con coeficiente K

**Rendimiento:** Valor por unidad de tiempo (importe/día)

**Unidad (UD):** Unidad de medida de la partida (m², m³, ud, etc.)

**Varianza:** Porcentaje de diferencia entre contrato y coste

**Versión:** Iteración o revisión de los datos (0, 1, 2)

---

## 19. Apéndices

### 19.1 Estructura de Archivos del Proyecto

```
proyecto/
├── .bolt/                          # Configuración de Bolt
├── node_modules/                   # Dependencias
├── public/                         # Assets públicos
│   ├── logo_grupo_inexo_black.png
│   └── [otros assets]
├── src/                           # Código fuente
│   ├── components/                # Componentes React
│   ├── lib/                       # Utilidades y lógica
│   ├── App.tsx                    # Componente principal
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Estilos globales
├── supabase/                      # Configuración Supabase
│   ├── functions/                 # Edge Functions
│   │   └── notificar-solicitud-acceso/
│   └── migrations/                # Migraciones SQL
├── .env                           # Variables de entorno
├── .gitignore                     # Git ignore
├── index.html                     # HTML principal
├── package.json                   # Dependencias npm
├── tsconfig.json                  # Config TypeScript
├── vite.config.ts                 # Config Vite
└── tailwind.config.js             # Config Tailwind
```

### 19.2 Comandos Útiles

**Desarrollo**
```bash
npm run dev          # Inicia dev server
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linter
npm run typecheck    # Verificación TypeScript
```

**Supabase**
```bash
supabase login                    # Login en Supabase
supabase link --project-ref XXX   # Vincular proyecto
supabase db pull                  # Sincronizar esquema
supabase functions deploy         # Desplegar edge functions
```

### 19.3 Referencias

**Documentación Técnica**
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Vite: https://vitejs.dev
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

**Contacto de Soporte**
- Desarrollador: Javier García
- Email: jgarcia@inexo.es
- Empresa: Grupo INEXO

---

## 20. Control de Versiones del Documento

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-15 | Javier García | Documento inicial completo |

---

**Fin del Documento**

Este PRD sirve como referencia completa para el desarrollo, mantenimiento y evolución del Sistema de Gestión Grupo INEXO. Debe ser revisado y actualizado periódicamente conforme el producto evoluciona.
