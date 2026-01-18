# User Stories + Backlog
## Sistema de Gestión Grupo INEXO

**Versión:** 1.0
**Fecha:** 15 de enero de 2026
**Producto:** Sistema de Gestión Grupo INEXO
**Product Owner:** Javier García (jgarcia@inexo.es)

---

## Tabla de Contenidos

1. [Definición de Terminología](#1-definición-de-terminología)
2. [Definition of Done (DoD)](#2-definition-of-done-dod)
3. [Épicas del Producto](#3-épicas-del-producto)
4. [User Stories - Épica 1: Autenticación y Gestión de Usuarios](#4-user-stories---épica-1-autenticación-y-gestión-de-usuarios)
5. [User Stories - Épica 2: Gestión de Obras y Configuración](#5-user-stories---épica-2-gestión-de-obras-y-configuración)
6. [User Stories - Épica 3: Análisis Detallado y Visualización](#6-user-stories---épica-3-análisis-detallado-y-visualización)
7. [User Stories - Épica 4: Comparativas y Desviaciones](#7-user-stories---épica-4-comparativas-y-desviaciones)
8. [User Stories - Épica 5: Planificación Temporal](#8-user-stories---épica-5-planificación-temporal)
9. [User Stories - Épica 6: Exportación y Reportes](#9-user-stories---épica-6-exportación-y-reportes)
10. [User Stories - Épica 7: Certidumbre y Calidad](#10-user-stories---épica-7-certidumbre-y-calidad)
11. [Product Backlog Priorizado](#11-product-backlog-priorizado)
12. [Historias Técnicas](#12-historias-técnicas)
13. [Roadmap de Releases](#13-roadmap-de-releases)
14. [Métricas y KPIs](#14-métricas-y-kpis)

---

## 1. Definición de Terminología

### Priorización (MoSCoW)
- **Must Have (M):** Crítico para el lanzamiento, sin esto el producto no funciona
- **Should Have (S):** Importante pero no crítico, puede esperar al próximo release
- **Could Have (C):** Deseable si hay tiempo y recursos
- **Won't Have (W):** No se hará en este release, pero podría considerarse en el futuro

### Story Points (Estimación de Esfuerzo)
- **1 punto:** Menos de 2 horas (trivial)
- **2 puntos:** 2-4 horas (simple)
- **3 puntos:** 4-8 horas (pequeño)
- **5 puntos:** 1-2 días (mediano)
- **8 puntos:** 2-4 días (grande)
- **13 puntos:** 1 semana (muy grande, considerar dividir)
- **21 puntos:** 2+ semanas (épica, debe dividirse)

### Estados de User Story
- **Backlog:** Identificada pero no priorizada
- **Ready:** Refinada y lista para desarrollo
- **In Progress:** En desarrollo activo
- **In Review:** En revisión de código/QA
- **Done:** Completada y cumple DoD

---

## 2. Definition of Done (DoD)

Una User Story se considera DONE cuando cumple:

### Desarrollo
- [ ] Código implementado según criterios de aceptación
- [ ] Código revisado por al menos un desarrollador
- [ ] Sin warnings de ESLint
- [ ] Sin errores de TypeScript
- [ ] Componentes siguen principios de responsabilidad única
- [ ] Nombres de variables y funciones son descriptivos

### Testing
- [ ] Funcionalidad probada manualmente en navegador
- [ ] Casos de borde identificados y probados
- [ ] Responsive design verificado (desktop 1366px+)
- [ ] Probado en Chrome y Firefox
- [ ] Sin errores en consola del navegador

### Datos y Seguridad
- [ ] RLS policies implementadas y probadas
- [ ] Sin datos sensibles expuestos en logs
- [ ] Consultas optimizadas (< 3 segundos)
- [ ] Manejo de errores implementado

### Documentación
- [ ] Componentes documentados (si es complejo)
- [ ] PRD actualizado si hay cambios de funcionalidad
- [ ] User Stories actualizadas si hay cambios de scope

### Aceptación
- [ ] Product Owner ha revisado y aprobado
- [ ] Demo realizada con stakeholders (si aplica)
- [ ] Feedback incorporado

---

## 3. Épicas del Producto

### ÉPICA 1: Autenticación y Gestión de Usuarios
**Descripción:** Sistema completo de registro, login, aprobación y gestión de usuarios
**Valor de Negocio:** Control de acceso al sistema, seguridad
**Story Points Totales:** 34

### ÉPICA 2: Gestión de Obras y Configuración
**Descripción:** Selección de obras, versionado, configuración de coeficiente K
**Valor de Negocio:** Base para todos los análisis, flexibilidad de configuración
**Story Points Totales:** 21

### ÉPICA 3: Análisis Detallado y Visualización
**Descripción:** Vista principal de árbol jerárquico con comparativas Contrato vs Coste
**Valor de Negocio:** Core del producto, visualización principal de datos
**Story Points Totales:** 55

### ÉPICA 4: Comparativas y Desviaciones
**Descripción:** Comparación entre versiones y análisis de desviaciones
**Valor de Negocio:** Identificación de cambios y alertas tempranas
**Story Points Totales:** 34

### ÉPICA 5: Planificación Temporal
**Descripción:** Distribución temporal de valores económicos
**Valor de Negocio:** Planificación financiera y cash flow
**Story Points Totales:** 21

### ÉPICA 6: Exportación y Reportes
**Descripción:** Exportación de datos a Excel y generación de reportes
**Valor de Negocio:** Integración con otras herramientas, reporting
**Story Points Totales:** 13

### ÉPICA 7: Certidumbre y Calidad
**Descripción:** Evaluación de completitud y calidad de datos
**Valor de Negocio:** Confianza en los análisis, identificación de gaps
**Story Points Totales:** 13

**Total Story Points:** 191

---

## 4. User Stories - Épica 1: Autenticación y Gestión de Usuarios

### US-001: Registro de Nuevo Usuario
**Como** usuario nuevo
**Quiero** registrarme en el sistema con mi email y contraseña
**Para** poder solicitar acceso al sistema de gestión

**Prioridad:** Must Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe un formulario de registro con campos: Nombre completo, Email, Contraseña, Confirmar contraseña
- [ ] La contraseña debe tener mínimo 6 caracteres
- [ ] El sistema valida que las contraseñas coincidan
- [ ] El sistema valida formato de email válido
- [ ] El sistema verifica que el email no esté ya registrado
- [ ] Al registrarse, el usuario queda en estado "Pendiente de aprobación"
- [ ] Se muestra mensaje de confirmación al usuario
- [ ] El usuario recibe feedback inmediato de errores de validación

**Tareas Técnicas:**
- Integración con Supabase Auth signUp
- Formulario de registro con validaciones
- Insert en tabla Users con Aceptado=false
- Manejo de errores (email duplicado, contraseña débil, etc.)
- UI con mensajes de éxito/error

**Notas:**
- El email debe ser corporativo (validación manual por admin)
- La contraseña se almacena hasheada en Supabase Auth

---

### US-002: Notificación Automática de Nuevo Registro
**Como** administrador del sistema
**Quiero** recibir un email automático cuando un usuario se registra
**Para** poder revisar y aprobar su solicitud rápidamente

**Prioridad:** Must Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Al registrarse un usuario, se dispara automáticamente una Edge Function
- [ ] La Edge Function envía email a jgarcia@inexo.es
- [ ] El email incluye: Nombre del solicitante, Email del solicitante
- [ ] El email incluye instrucciones claras de cómo aprobar al usuario
- [ ] Si la notificación falla, no impide el registro del usuario
- [ ] Se loguea el error si la notificación falla

**Tareas Técnicas:**
- Crear Edge Function "notificar-solicitud-acceso"
- Configurar servicio de email en Supabase
- Implementar template de email
- Try/catch para manejo de errores sin bloquear registro
- Deploy de Edge Function

**Notas:**
- La notificación es best-effort, no crítica para el registro
- Admin puede consultar directamente la tabla Users si no recibe email

---

### US-003: Login de Usuario Aprobado
**Como** usuario aprobado
**Quiero** iniciar sesión con mi email y contraseña
**Para** acceder al sistema de gestión

**Prioridad:** Must Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe formulario de login con campos: Email, Contraseña
- [ ] El sistema valida credenciales con Supabase Auth
- [ ] El sistema verifica que el campo Aceptado=true en tabla Users
- [ ] Si credenciales incorrectas, muestra mensaje de error claro
- [ ] Si usuario no aprobado, muestra mensaje específico de acceso pendiente
- [ ] Si login exitoso, redirige a la aplicación principal
- [ ] La sesión persiste hasta que el usuario cierre sesión
- [ ] Se muestra indicador de carga durante autenticación

**Tareas Técnicas:**
- Formulario de login con validaciones
- Query a Supabase Auth signInWithPassword
- Query a tabla Users para verificar Aceptado
- Gestión de estado de autenticación (useState)
- Redirección post-login
- Manejo de diferentes tipos de errores

**Notas:**
- No hay recuperación de contraseña implementada aún (roadmap futuro)

---

### US-004: Mensaje de Usuario No Aprobado
**Como** usuario registrado pero no aprobado
**Quiero** ver un mensaje claro cuando intente hacer login
**Para** saber que mi solicitud está pendiente y a quién contactar

**Prioridad:** Must Have
**Story Points:** 2
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Al intentar login con credenciales válidas pero Aceptado=false
- [ ] Se muestra mensaje: "Tu solicitud de acceso está pendiente de aprobación"
- [ ] El mensaje incluye el email de contacto: jgarcia@inexo.es
- [ ] El mensaje es claro y no técnico
- [ ] El usuario es deslogueado automáticamente
- [ ] El mensaje es visualmente distinto del error de credenciales

**Tareas Técnicas:**
- Lógica de verificación post-auth
- Componente de mensaje informativo
- Sign out automático si no aprobado

---

### US-005: Cerrar Sesión
**Como** usuario autenticado
**Quiero** cerrar mi sesión cuando termine de usar el sistema
**Para** proteger mi cuenta y datos

**Prioridad:** Must Have
**Story Points:** 2
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe un botón "Salir" visible en el header
- [ ] El botón tiene un icono de logout (LogOut)
- [ ] Al hacer click, cierra la sesión en Supabase
- [ ] Limpia todo el estado de la aplicación
- [ ] Redirige a la pantalla de login
- [ ] No se puede volver atrás con el botón del navegador

**Tareas Técnicas:**
- Botón en header con icono
- Llamada a supabase.auth.signOut()
- Reset de estado (setData, setObras, etc.)
- Redirección a LoginScreen

---

### US-006: Verificación de Sesión al Cargar
**Como** usuario con sesión activa
**Quiero** que el sistema verifique mi sesión automáticamente al cargar
**Para** no tener que hacer login cada vez

**Prioridad:** Must Have
**Story Points:** 3
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Al cargar la aplicación, verifica automáticamente si hay sesión activa
- [ ] Si hay sesión válida y usuario aprobado, carga la aplicación
- [ ] Si no hay sesión, muestra pantalla de login
- [ ] Si sesión inválida o usuario no aprobado, muestra login con mensaje
- [ ] Muestra indicador de carga durante verificación
- [ ] La verificación debe ser rápida (< 1 segundo)

**Tareas Técnicas:**
- useEffect en App.tsx para verificar al mount
- Llamada a supabase.auth.getSession()
- Query a tabla Users para verificar Aceptado
- Estado authChecking para indicador de carga
- Manejo de diferentes escenarios (sin sesión, sesión expirada, etc.)

---

### US-007: Aprobación de Usuario (Administrador)
**Como** administrador
**Quiero** aprobar usuarios pendientes desde la base de datos
**Para** darles acceso al sistema

**Prioridad:** Must Have
**Story Points:** 3
**Estado:** ✅ Done (Manual)

**Criterios de Aceptación:**
- [ ] El administrador puede acceder a la tabla Users en Supabase
- [ ] Puede ver usuarios con Aceptado=false
- [ ] Puede actualizar el campo Aceptado a true
- [ ] El usuario puede hacer login inmediatamente después
- [ ] Existe documentación clara del proceso

**Tareas Técnicas:**
- RLS policy que permita SELECT y UPDATE en Users (para admin)
- Documentación del proceso en PRD
- (Futuro: UI de administración en la app)

**Notas:**
- Actualmente es un proceso manual vía Supabase Dashboard
- En roadmap: UI de administración dentro de la app

---

### US-008: Indicador de Usuario Actual
**Como** usuario autenticado
**Quiero** ver mi email en el header
**Para** confirmar con qué cuenta estoy conectado

**Prioridad:** Should Have
**Story Points:** 1
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] El header muestra "Usuario: [email]"
- [ ] Se posiciona en la esquina superior derecha
- [ ] Es visible en todas las vistas
- [ ] El texto es legible con buen contraste
- [ ] Tiene un diseño visual apropiado (badge o card)

**Tareas Técnicas:**
- Obtener email del usuario de la sesión
- Componente visual en header
- Styling con Tailwind

---

## 5. User Stories - Épica 2: Gestión de Obras y Configuración

### US-010: Selector de Obra
**Como** usuario autenticado
**Quiero** seleccionar de una lista de obras disponibles
**Para** analizar los datos de la obra que me interesa

**Prioridad:** Must Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe un dropdown "Obra:" en el header
- [ ] El dropdown muestra todas las obras disponibles ordenadas alfabéticamente
- [ ] Al cargar la app por primera vez, se selecciona automáticamente la primera obra
- [ ] Al cambiar de obra, se cargan automáticamente sus datos
- [ ] Se muestra indicador de carga durante la carga de datos
- [ ] La obra seleccionada persiste durante la sesión
- [ ] El dropdown es accesible y usable

**Tareas Técnicas:**
- Query a base_datos_sgi para obtener obras únicas
- Dropdown con estado selectedObra
- Función loadObras() al iniciar
- Función loadObraData() al cambiar selección
- Loading states y error handling

---

### US-011: Gestión del Coeficiente K
**Como** usuario
**Quiero** configurar el coeficiente de paso K para cada obra
**Para** ajustar los cálculos económicos según las particularidades de la obra

**Prioridad:** Must Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe un campo editable "Coef. de paso K:" en el header
- [ ] El valor por defecto es 1.0 para obras nuevas
- [ ] Al cargar una obra, se carga su coeficiente K desde la BD
- [ ] Al modificar el valor, se guarda automáticamente en la BD
- [ ] Al modificar el valor, se recalculan automáticamente todos los datos
- [ ] El campo acepta decimales (ej: 1.15, 0.95)
- [ ] El campo valida que sea un número positivo
- [ ] Se muestra con 2 decimales de precisión

**Tareas Técnicas:**
- Tabla obra_coef_k con campos: cod_obra (PK), coef_k, updated_at
- Función fetchCoefK(codObra)
- Función saveCoefK(codObra, coefK)
- Input controlado con validación
- Upsert en BD al cambiar valor
- Recálculo de todos los valores *_K

**Fórmulas:**
- Precio.K = Precio Coste × K
- Importe.K = Cantidad Coste × Precio.K

---

### US-012: Selector de Versión de Análisis
**Como** usuario
**Quiero** seleccionar qué versión de análisis visualizar
**Para** comparar diferentes versiones de la estructura de la obra

**Prioridad:** Must Have
**Story Points:** 3
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe un dropdown "Análisis:" en el header
- [ ] Muestra todas las versiones disponibles para la obra seleccionada (0, 1, 2)
- [ ] Al cambiar de versión, se recargan los datos automáticamente
- [ ] El selector solo aparece en vistas que usan versión de análisis
- [ ] Si no hay datos para una versión, no aparece en el selector
- [ ] La versión se detecta automáticamente desde los datos

**Tareas Técnicas:**
- RPC function get_distinct_versions(table_name, obra_code)
- State analisisVersion y analisisVersions
- Función loadAnalisisVersions()
- Dropdown dinámico basado en versiones disponibles
- Recarga de datos al cambiar versión

---

### US-013: Selector de Versión de Contrato
**Como** usuario
**Quiero** seleccionar qué versión de contrato visualizar
**Para** analizar diferentes versiones del presupuesto contractual

**Prioridad:** Must Have
**Story Points:** 3
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe un dropdown "Contrato:" en el header
- [ ] Muestra todas las versiones disponibles (0, 1, 2)
- [ ] Al cambiar de versión, se actualiza la visualización inmediatamente
- [ ] El selector aparece en vistas relevantes (Análisis Detallado, Desviaciones)
- [ ] La versión se carga desde lineas_contrato

**Tareas Técnicas:**
- Similar a US-012 pero para contrato
- State contratoVersion y contratoVersions
- Función loadContratoVersions()
- Integración en queries de datos

---

### US-014: Selector de Versión de Coste
**Como** usuario
**Quiero** seleccionar qué versión de coste visualizar
**Para** analizar diferentes versiones del presupuesto de coste

**Prioridad:** Must Have
**Story Points:** 3
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe un dropdown "Coste:" en el header
- [ ] Muestra todas las versiones disponibles (0, 1, 2)
- [ ] Al cambiar de versión, se actualiza la visualización inmediatamente
- [ ] Aplica el coeficiente K a los cálculos de la versión seleccionada

**Tareas Técnicas:**
- Similar a US-012/US-013 pero para coste
- State costeVersion y costeVersions
- Función loadCosteVersions()
- Integración en cálculos con K

---

### US-015: Botón de Actualizar Manual
**Como** usuario
**Quiero** un botón para refrescar manualmente todos los datos
**Para** asegurarme de ver la información más reciente

**Prioridad:** Should Have
**Story Points:** 2
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe un botón "Actualizar" visible en el header
- [ ] Al hacer click, recarga todos los datos de la obra actual
- [ ] Recarga: obras disponibles, coeficiente K, versiones, datos de análisis
- [ ] Muestra indicador de carga durante la actualización
- [ ] Mantiene las selecciones actuales (obra, versiones)
- [ ] Maneja errores de recarga apropiadamente

**Tareas Técnicas:**
- Función handleRefresh() que llama a múltiples loaders
- Promise.all para cargas en paralelo
- Loading state durante refresh

---

## 6. User Stories - Épica 3: Análisis Detallado y Visualización

### US-020: Vista de Árbol Jerárquico
**Como** usuario
**Quiero** ver los datos en una estructura de árbol jerárquico
**Para** entender la organización de la obra por capítulos y partidas

**Prioridad:** Must Have
**Story Points:** 13
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Los datos se organizan en estructura de árbol con niveles
- [ ] Nivel 1: Capítulos principales
- [ ] Niveles 2-4: Subcapítulos
- [ ] Nivel inferior: Partidas y descompuestos
- [ ] Cada nodo muestra: código, naturaleza, descripción, unidad
- [ ] Los nodos padres tienen icono de chevron para expandir/contraer
- [ ] Los nodos hijos se indentan visualmente según su nivel
- [ ] La jerarquía se construye usando CodSup y Guid_SGI

**Tareas Técnicas:**
- Función buildTree() que construye jerarquía desde datos planos
- Algoritmo de mapeo por Guid_SGI y por código
- Componente recursivo TreeNodeRow
- Props: node, level, children
- Gestión de estado de expansión por nodo

---

### US-021: Expansión y Contracción de Nodos
**Como** usuario
**Quiero** expandir y contraer nodos del árbol individualmente
**Para** enfocarme en las secciones que me interesan

**Prioridad:** Must Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Click en chevron expande/contrae el nodo
- [ ] Al expandir, se muestran los hijos del nodo
- [ ] Al contraer, se ocultan los hijos del nodo
- [ ] El estado de expansión se mantiene al cambiar de columna o filtro
- [ ] La animación es suave y natural
- [ ] Los nodos sin hijos no muestran chevron

**Tareas Técnicas:**
- State isExpanded por nodo
- Toggle function onToggleNode
- Renderizado condicional de children
- Iconos ChevronDown/ChevronRight

---

### US-022: Control de Expansión por Niveles
**Como** usuario
**Quiero** expandir o contraer todos los nodos hasta cierto nivel
**Para** obtener rápidamente la vista que necesito

**Prioridad:** Should Have
**Story Points:** 3
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe botón "+" para expandir un nivel más
- [ ] Existe botón "-" para contraer un nivel
- [ ] Los botones están en la barra de herramientas de la vista
- [ ] Al expandir, todos los nodos hasta ese nivel se expanden automáticamente
- [ ] Al contraer, todos los nodos de ese nivel y superiores se contraen
- [ ] El nivel actual se refleja en el estado del árbol

**Tareas Técnicas:**
- State expandLevel (0, 1, 2, 3, 4)
- Botones +/- que modifican expandLevel
- useEffect que reconstruye expandedNodes según expandLevel
- Función recursiva expandToLevel()

---

### US-023: Visualización de Datos de Contrato
**Como** usuario
**Quiero** ver cantidad, precio e importe de contrato para cada partida
**Para** conocer los valores presupuestados en el contrato

**Prioridad:** Must Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Columna "Contrato - Cantidad" muestra la cantidad de la versión seleccionada
- [ ] Columna "Contrato - Precio" muestra el precio unitario
- [ ] Columna "Contrato - Importe" muestra cantidad × precio
- [ ] Los valores se obtienen de lineas_contrato según versión seleccionada
- [ ] Los valores se formatean con separadores de miles (1.234,56)
- [ ] Las columnas tienen fondo azul claro para identificación
- [ ] Los descompuestos muestran valores redistribuidos proporcionalmente

**Tareas Técnicas:**
- Query a lineas_contrato filtrando por cod_obra y version
- Join por clave_compuesta_cto
- Agregación de importes (suma) y máximo para cantidad/precio
- Formato español de números (formatNumber)
- Estilos bg-blue-50

---

### US-024: Visualización de Datos de Coste
**Como** usuario
**Quiero** ver cantidad, precio, precio.K e importe.K de coste para cada partida
**Para** conocer los valores reales de coste ajustados

**Prioridad:** Must Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Columna "Coste - Cantidad" muestra la cantidad de la versión seleccionada
- [ ] Columna "Coste - Precio" muestra el precio unitario sin ajustar
- [ ] Columna "Coste - Precio.K" muestra precio × coeficiente K
- [ ] Columna "Coste - Importe.K" muestra cantidad × precio.K
- [ ] Los valores se obtienen de lineas_coste según versión seleccionada
- [ ] Los valores se formatean correctamente
- [ ] Las columnas tienen fondo ámbar claro para identificación
- [ ] Los cálculos se actualizan al cambiar K

**Tareas Técnicas:**
- Query a lineas_coste filtrando por cod_obra y version
- Join por clave_compuesta
- Cálculo: precio.K = precio × coefK
- Cálculo: importe.K = cantidad × precio.K
- Estilos bg-amber-50

---

### US-025: Cálculo de Diferencias y Varianza
**Como** usuario
**Quiero** ver las diferencias entre contrato y coste en medición e importe
**Para** identificar desviaciones económicas

**Prioridad:** Must Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Columna "Dif.Medición" muestra cantidad coste - cantidad contrato
- [ ] Columna "Dif.Importe" muestra importe contrato - importe.K coste
- [ ] Columna "Varianza %" muestra (Dif.Importe / Importe Contrato) × 100
- [ ] Valores positivos en verde (favorable)
- [ ] Valores negativos en rojo (desfavorable)
- [ ] Los cálculos son precisos con 2 decimales
- [ ] Las descomposiciones no muestran diferencias

**Tareas Técnicas:**
- Cálculo difMedicion = costeCant - contratoCant
- Cálculo difImporte = contratoImporte - costeImporteK
- Cálculo varianza = (difImporte / contratoImporte) × 100
- Clases condicionales text-green-600 / text-red-600
- Función getDiferenciaColor()

---

### US-026: Codificación Visual por Nivel
**Como** usuario
**Quiero** que los diferentes niveles de capítulos tengan colores distintivos
**Para** identificar rápidamente la jerarquía visual

**Prioridad:** Should Have
**Story Points:** 2
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Nivel 1: Verde oscuro (bg-emerald-200)
- [ ] Nivel 2: Verde medio (bg-emerald-150)
- [ ] Nivel 3: Verde claro (bg-emerald-100)
- [ ] Nivel 4+: Verde muy claro (bg-emerald-50)
- [ ] Partidas: Sin color de fondo especial
- [ ] Descompuestos: Fondo gris claro (bg-slate-50)
- [ ] Los colores son visualmente agradables y profesionales

**Tareas Técnicas:**
- Función getBgColor() basada en nat y Nivel
- Aplicación de clases Tailwind según nivel
- Extensión de Tailwind config para bg-emerald-150 si no existe

---

### US-027: Fila de Totales
**Como** usuario
**Quiero** ver los totales de contrato, coste y diferencias
**Para** tener una visión global de la situación económica

**Prioridad:** Must Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Última fila muestra "TOTALES" en primera columna
- [ ] Muestra total de Importe Contrato (suma de partidas)
- [ ] Muestra total de Importe.K Coste (suma de partidas)
- [ ] Muestra total de Dif.Importe
- [ ] Muestra Varianza % total
- [ ] La fila es sticky al hacer scroll (permanece visible)
- [ ] Los totales se actualizan en tiempo real con filtros y cambios
- [ ] Solo suma partidas, no capítulos (evita duplicación)

**Tareas Técnicas:**
- Función calculateTotals() que suma solo nat='Partida'
- useMemo para optimizar cálculo de totales
- Fila <tfoot> con sticky positioning
- Formato y estilos para destacar totales

---

### US-028: Redimensionamiento de Columnas
**Como** usuario
**Quiero** ajustar el ancho de las columnas arrastrando sus bordes
**Para** adaptar la vista a mis necesidades

**Prioridad:** Should Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Todas las columnas tienen un borde derecho arrastrable
- [ ] Al arrastrar, el ancho de la columna cambia en tiempo real
- [ ] El cursor cambia a col-resize al pasar sobre el borde
- [ ] El ancho mínimo es 60px
- [ ] Los anchos se mantienen durante la sesión
- [ ] El redimensionamiento es fluido sin lag

**Tareas Técnicas:**
- Componente ResizableHeader
- State columnWidths con anchos iniciales
- Handlers: handleMouseDown, handleMouseMove, handleMouseUp
- useEffect para eventos globales de mouse
- Aplicación de width style a columnas

---

### US-029: Ordenamiento por Columnas
**Como** usuario
**Quiero** ordenar los datos haciendo click en headers de columnas numéricas
**Para** identificar rápidamente valores extremos

**Prioridad:** Should Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Click en header de "Contrato Importe" ordena por ese valor
- [ ] Click en header de "Coste Importe.K" ordena por ese valor
- [ ] Click en header de "Dif.Medición" ordena por diferencia
- [ ] Click en header de "Dif.Importe" ordena por diferencia
- [ ] Primer click: orden ascendente (menor a mayor)
- [ ] Segundo click: orden descendente (mayor a menor)
- [ ] Tercer click: vuelve al orden original
- [ ] Se muestra icono indicando dirección de orden actual

**Tareas Técnicas:**
- State sortColumn y sortDirection
- Función handleSort(column)
- Función sortedData que ordena array
- Iconos ArrowUpDown / ArrowUp / ArrowDown
- Botones en headers de columnas ordenables

---

### US-030: Filtrado por Naturaleza
**Como** usuario
**Quiero** filtrar por tipo de elemento (Capítulo, Partida, Material, etc.)
**Para** enfocarme en un tipo específico de elementos

**Prioridad:** Should Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe icono de filtro en header de columna "Nat."
- [ ] Click en filtro despliega un menú con checkboxes
- [ ] El menú incluye todas las naturalezas únicas presentes en los datos
- [ ] Puedo seleccionar múltiples naturalezas
- [ ] Los datos se filtran inmediatamente al seleccionar
- [ ] Existe botón "Limpiar selección" para quitar todos los filtros
- [ ] El filtro se mantiene al ordenar o expandir nodos
- [ ] Los totales se recalculan según datos filtrados

**Tareas Técnicas:**
- State natFilter (array de strings)
- State showNatFilter para mostrar/ocultar menú
- Array uniqueNatValues = unique(data.map(d => d.nat))
- Función filteredData = data.filter(...)
- Dropdown con checkboxes
- Click outside to close

---

### US-031: Botón Restablecer Vista
**Como** usuario
**Quiero** un botón para volver al estado original de la vista
**Para** deshacer todos los filtros y ordenamientos aplicados

**Prioridad:** Should Have
**Story Points:** 2
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe botón "Restablecer" con icono de refresh
- [ ] Al hacer click, elimina todos los filtros aplicados
- [ ] Al hacer click, elimina el ordenamiento y vuelve al orden original
- [ ] No afecta la selección de obra o versiones
- [ ] No afecta el nivel de expansión del árbol
- [ ] Proporciona feedback visual inmediato

**Tareas Técnicas:**
- Función handleReset() que resetea states
- setSortColumn(null), setSortDirection(null), setNatFilter([])
- Botón con icono RotateCcw

---

## 7. User Stories - Épica 4: Comparativas y Desviaciones

### US-040: Vista de Partidas con Mayor Desviación
**Como** usuario
**Quiero** ver una lista de partidas ordenadas por desviación de importe
**Para** identificar rápidamente las partidas más problemáticas

**Prioridad:** Must Have
**Story Points:** 8
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe pestaña "Partidas con mayor Desviación"
- [ ] Muestra solo elementos con nat='Partida'
- [ ] Ordena por Dif.Importe absoluto de mayor a menor
- [ ] Muestra: Código, Descripción, Contrato, Coste.K, Diferencia, Varianza %
- [ ] Las diferencias tienen colores (verde positivo, rojo negativo)
- [ ] Incluye fila de totales
- [ ] La vista se actualiza al cambiar de obra o versión

**Tareas Técnicas:**
- Componente PartidaDesviacionView
- Filter: data.filter(d => d.nat === 'Partida')
- Sort: .sort((a,b) => Math.abs(difB) - Math.abs(difA))
- Tabla con formato similar al árbol
- Totales calculados

---

### US-041: Vista Comparativa Coste vs Coste
**Como** usuario
**Quiero** comparar dos versiones de coste lado a lado
**Para** identificar qué ha cambiado entre versiones

**Prioridad:** Must Have
**Story Points:** 13
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe pestaña "Comparativa Coste vs Coste"
- [ ] Selectores independientes para "Coste 1" y "Coste 2"
- [ ] Muestra estructura de árbol jerárquico
- [ ] Para cada versión muestra: Cantidad, Precio.K, Importe.K
- [ ] Calcula diferencias: Δ Cantidad, Δ Importe, Varianza %
- [ ] Aplica coeficiente K en ambas versiones
- [ ] Los selectores de versión aparecen en el header contextuales
- [ ] La comparativa funciona con cualquier combinación de versiones

**Tareas Técnicas:**
- Componente CosteComparativaTreeView
- Props: costeVersion1, costeVersion2
- Obtener datos de ambas versiones
- Calcular diferencias para cada nodo
- Estructura de árbol con columnas comparativas
- Totales de diferencias

---

### US-042: Vista Comparativa Contrato vs Contrato
**Como** usuario
**Quiero** comparar dos versiones de contrato lado a lado
**Para** ver la evolución del presupuesto contractual

**Prioridad:** Must Have
**Story Points:** 13
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe pestaña "Comparativa Contrato vs Contrato"
- [ ] Selectores independientes para "Contrato 1" y "Contrato 2"
- [ ] Muestra estructura de árbol jerárquico
- [ ] Para cada versión muestra: Cantidad, Precio, Importe
- [ ] Calcula diferencias: Δ Cantidad, Δ Importe, Varianza %
- [ ] NO aplica coeficiente K (es contrato puro)
- [ ] Útil para identificar reformados y revisiones de precio

**Tareas Técnicas:**
- Componente ContratoComparativaTreeView
- Similar a CosteComparativa pero sin aplicar K
- Props: contratoVersion1, contratoVersion2
- Obtener datos de ambas versiones
- Calcular diferencias
- Estructura de árbol

---

## 8. User Stories - Épica 5: Planificación Temporal

### US-050: Vista de Análisis de Planificación
**Como** usuario
**Quiero** ver la distribución temporal de valores económicos por meses
**Para** planificar el cash flow y recursos temporalmente

**Prioridad:** Must Have
**Story Points:** 21
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe pestaña "Análisis Planificación"
- [ ] Integra datos de lineas_planin (fechas inicio/fin)
- [ ] Genera columnas mensuales dinámicamente según rango de fechas del proyecto
- [ ] Cada columna mensual muestra "mes N (D/M/AA)"
- [ ] Para cada partida muestra: Fecha inicio, Fecha fin, Duración días, Duración meses, Rendimiento/día
- [ ] Distribuye el valor total proporcionalmente por días laborables
- [ ] Excluye fines de semana del cálculo
- [ ] Muestra totales por mes en fila de totales
- [ ] Permite cambiar fuente (Contrato/Coste), versión, y tipo (Cantidad/Importe)

**Tareas Técnicas:**
- Componente AnalisisPlanificacion
- Query a lineas_planin por cod_obra
- Map de plan_guid a {comienzo, fin, duracion}
- Función generateMonthColumns() que crea columnas dinámicas
- Función calculateMonthlyValue() que distribuye valores
- Función getWorkingDaysInMonth() que excluye fines de semana
- Renderizado de columnas dinámicas
- Cálculo de totales por mes

**Algoritmo:**
```
totalWorkingDays = días laborables entre inicio y fin
valorPorDia = valorTotal / totalWorkingDays

Para cada mes en rango:
  diasLaborablesEnMes = días laborables que se solapan
  valorMes = valorPorDia × diasLaborablesEnMes
```

---

### US-051: Selector de Fuente de Datos en Planificación
**Como** usuario
**Quiero** elegir si ver datos de Contrato o Coste en la planificación
**Para** analizar diferentes escenarios de planificación

**Prioridad:** Must Have
**Story Points:** 3
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe selector "Fuente:" con opciones Contrato y Coste
- [ ] Al cambiar fuente, se recalculan todos los valores mensuales
- [ ] Si Coste, se aplica el coeficiente K
- [ ] Si Contrato, se usan valores sin K
- [ ] El header de la columna de valor cambia según fuente

**Tareas Técnicas:**
- State dataSource ('contrato' | 'coste')
- Selector dropdown
- Lógica condicional para obtener valores según fuente
- Aplicación de K solo si es coste

---

### US-052: Selector de Tipo de Valor en Planificación
**Como** usuario
**Quiero** elegir si ver cantidades o importes en la planificación
**Para** analizar diferentes aspectos del proyecto

**Prioridad:** Should Have
**Story Points:** 2
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe selector "Valor:" con opciones Cantidad e Importe
- [ ] Al cambiar tipo, se recalculan todos los valores mensuales
- [ ] Si Cantidad, muestra distribución de cantidades
- [ ] Si Importe (o ImporteK), muestra distribución de importes
- [ ] El header de la columna cambia según tipo seleccionado

**Tareas Técnicas:**
- State valueType ('cantidad' | 'importe')
- Selector dropdown
- Lógica condicional para baseValue
- Headers dinámicos

---

### US-053: Cálculo de Días Laborables
**Como** sistema
**Quiero** calcular solo días laborables excluyendo fines de semana
**Para** que la distribución temporal sea más realista

**Prioridad:** Must Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] La función getWorkingDaysInMonth() excluye sábados y domingos
- [ ] Maneja correctamente meses parciales (cuando la partida empieza o termina a mitad de mes)
- [ ] Maneja correctamente el último día (si termina en un día, ese día no se cuenta completo)
- [ ] El cálculo es preciso para partidas de un solo día
- [ ] El total de días laborables suma correctamente

**Tareas Técnicas:**
- Función getWorkingDaysInMonth(year, month, startDate, endDate, isLastMonth)
- Loop día por día verificando dayOfWeek !== 0 && !== 6
- Función getTotalWorkingDays(startDate, endDate)
- Tests manuales con casos de borde

---

## 9. User Stories - Épica 6: Exportación y Reportes

### US-060: Exportar Análisis Detallado a Excel
**Como** usuario
**Quiero** exportar la vista de análisis detallado a formato CSV
**Para** trabajar con los datos en Excel o compartirlos

**Prioridad:** Must Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Existe botón "Exportar a Excel" con icono de download
- [ ] Genera archivo CSV con codificación UTF-8 con BOM
- [ ] Usa punto y coma (;) como separador
- [ ] Números en formato español (1.234,56)
- [ ] Incluye todas las columnas de la vista
- [ ] Incluye fila de totales al final
- [ ] El nombre del archivo incluye timestamp: `analisis_detallado_YYYY-MM-DDTHH-mm-ss.csv`
- [ ] El archivo se descarga automáticamente
- [ ] Respeta los filtros aplicados (si hay filtros, solo exporta datos filtrados)

**Tareas Técnicas:**
- Función exportToExcel()
- Construcción de string CSV con headers
- Iteración recursiva por árbol para agregar filas
- Función escapeCsv() para valores con ; o "
- Blob con tipo text/csv;charset=utf-8
- Download automático con createElement('a')
- Timestamp con new Date().toISOString()

---

### US-061: Exportar Comparativas a Excel
**Como** usuario
**Quiero** exportar las vistas de comparativas a CSV
**Para** documentar y compartir los cambios entre versiones

**Prioridad:** Should Have
**Story Points:** 3
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Botón "Exportar a Excel" en vista Comparativa Coste
- [ ] Botón "Exportar a Excel" en vista Comparativa Contrato
- [ ] Incluye columnas de ambas versiones y diferencias
- [ ] Nombre de archivo indica el tipo de comparativa
- [ ] Formato y estructura similar a análisis detallado

**Tareas Técnicas:**
- Similar a US-060 pero adaptado a estructura de comparativas
- Headers específicos para cada versión
- Columnas de diferencias

---

### US-062: Exportar Planificación a Excel
**Como** usuario
**Quiero** exportar la vista de planificación con todas las columnas mensuales
**Para** trabajar con la planificación temporal en Excel

**Prioridad:** Should Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios de Aceptación:**
- [ ] Botón "Exportar a Excel" en vista Análisis Planificación
- [ ] Incluye todas las columnas fijas (código, descripción, fechas, etc.)
- [ ] Incluye todas las columnas mensuales generadas dinámicamente
- [ ] Incluye fila de totales con sumas por mes
- [ ] El archivo puede tener muchas columnas si el proyecto es largo
- [ ] Los valores mensuales se exportan correctamente

**Tareas Técnicas:**
- Función exportToExcel() en AnalisisPlanificacion
- Iteración por monthColumns para headers dinámicos
- Cálculo de valores mensuales para cada partida
- Fila de totales con suma por mes

---

## 10. User Stories - Épica 7: Certidumbre y Calidad

### US-070: Vista de Certidumbre
**Como** usuario
**Quiero** evaluar el nivel de certidumbre de los datos de cada partida
**Para** identificar dónde faltan datos o hay inconsistencias

**Prioridad:** Could Have
**Story Points:** 13
**Estado:** ✅ Done (Parcial - UI creada, lógica básica)

**Criterios de Aceptación:**
- [ ] Existe pestaña "Certidumbre"
- [ ] Para cada partida evalúa:
  - [ ] ¿Tiene datos de contrato completos?
  - [ ] ¿Tiene datos de coste completos?
  - [ ] ¿Tiene planificación temporal?
  - [ ] ¿Los datos son consistentes entre versiones?
- [ ] Muestra indicador de certidumbre (Alto/Medio/Bajo o %)
- [ ] Permite filtrar por nivel de certidumbre
- [ ] Muestra en estructura de árbol
- [ ] Destaca partidas con baja certidumbre

**Tareas Técnicas:**
- Componente CertidumbreView
- Función evaluateCertidumbre(partida) que retorna score
- Criterios:
  - Contrato completo: cant > 0 && precio > 0
  - Coste completo: cant > 0 && precio > 0
  - Planificación: plan_guid exists && comienzo && fin
  - Consistencia: |contrato - coste| dentro de rango esperado
- Indicadores visuales (colores, iconos)
- Filtrado por nivel de certidumbre

---

## 11. Product Backlog Priorizado

### Sprint 0 - Fundamentos (DONE)
**Objetivo:** Base funcional mínima del sistema
**Story Points:** 34

- [x] US-001: Registro de Nuevo Usuario (5)
- [x] US-002: Notificación Automática de Nuevo Registro (5)
- [x] US-003: Login de Usuario Aprobado (5)
- [x] US-004: Mensaje de Usuario No Aprobado (2)
- [x] US-005: Cerrar Sesión (2)
- [x] US-006: Verificación de Sesión al Cargar (3)
- [x] US-007: Aprobación de Usuario (3)
- [x] US-008: Indicador de Usuario Actual (1)
- [x] US-010: Selector de Obra (5)
- [x] US-015: Botón de Actualizar Manual (2)

**Review:** ✅ Completado - Sistema de autenticación funcional

---

### Sprint 1 - Configuración y Versionado (DONE)
**Objetivo:** Gestión completa de obras y versiones
**Story Points:** 21

- [x] US-011: Gestión del Coeficiente K (5)
- [x] US-012: Selector de Versión de Análisis (3)
- [x] US-013: Selector de Versión de Contrato (3)
- [x] US-014: Selector de Versión de Coste (3)
- [x] US-020: Vista de Árbol Jerárquico (13)

**Review:** ✅ Completado - Gestión de obras y versiones operativa

---

### Sprint 2 - Visualización Core (DONE)
**Objetivo:** Vista principal de análisis detallado
**Story Points:** 34

- [x] US-021: Expansión y Contracción de Nodos (5)
- [x] US-022: Control de Expansión por Niveles (3)
- [x] US-023: Visualización de Datos de Contrato (5)
- [x] US-024: Visualización de Datos de Coste (5)
- [x] US-025: Cálculo de Diferencias y Varianza (5)
- [x] US-026: Codificación Visual por Nivel (2)
- [x] US-027: Fila de Totales (5)

**Review:** ✅ Completado - Análisis detallado funcional

---

### Sprint 3 - Interactividad Avanzada (DONE)
**Objetivo:** Filtros, ordenamiento, redimensionamiento
**Story Points:** 21

- [x] US-028: Redimensionamiento de Columnas (5)
- [x] US-029: Ordenamiento por Columnas (5)
- [x] US-030: Filtrado por Naturaleza (5)
- [x] US-031: Botón Restablecer Vista (2)
- [x] US-040: Vista de Partidas con Mayor Desviación (8)

**Review:** ✅ Completado - Interactividad avanzada implementada

---

### Sprint 4 - Comparativas (DONE)
**Objetivo:** Comparación entre versiones
**Story Points:** 26

- [x] US-041: Vista Comparativa Coste vs Coste (13)
- [x] US-042: Vista Comparativa Contrato vs Contrato (13)

**Review:** ✅ Completado - Comparativas operativas

---

### Sprint 5 - Planificación Temporal (DONE)
**Objetivo:** Distribución temporal de valores
**Story Points:** 31

- [x] US-050: Vista de Análisis de Planificación (21)
- [x] US-051: Selector de Fuente de Datos en Planificación (3)
- [x] US-052: Selector de Tipo de Valor en Planificación (2)
- [x] US-053: Cálculo de Días Laborables (5)

**Review:** ✅ Completado - Planificación temporal funcional

---

### Sprint 6 - Exportación (DONE)
**Objetivo:** Exportación de datos a Excel
**Story Points:** 13

- [x] US-060: Exportar Análisis Detallado a Excel (5)
- [x] US-061: Exportar Comparativas a Excel (3)
- [x] US-062: Exportar Planificación a Excel (5)

**Review:** ✅ Completado - Exportaciones operativas

---

### Sprint 7 - Certidumbre (DONE - Parcial)
**Objetivo:** Evaluación de calidad de datos
**Story Points:** 13

- [x] US-070: Vista de Certidumbre (13) - UI creada, lógica básica

**Review:** ⚠️ Parcialmente completado - Requiere refinamiento de lógica

---

### Sprint 8 - Mejoras de Usabilidad (BACKLOG)
**Objetivo:** Mejoras basadas en feedback de usuarios
**Story Points:** 21

- [ ] US-080: Búsqueda de Partidas por Código o Texto (5)
- [ ] US-081: Tooltips con Información Adicional (3)
- [ ] US-082: Configurar Columnas Visibles/Ocultas (5)
- [ ] US-083: Guardar Configuración de Vista por Usuario (5)
- [ ] US-084: Temas Claros/Oscuros (3)

---

### Sprint 9 - Optimización y Rendimiento (BACKLOG)
**Objetivo:** Mejorar rendimiento con grandes volúmenes
**Story Points:** 21

- [ ] US-090: Virtualización de Listas Largas (8)
- [ ] US-091: Caching de Datos en Sesión (5)
- [ ] US-092: Web Workers para Cálculos Pesados (8)

---

### Sprint 10 - Reportes Avanzados (BACKLOG)
**Objetivo:** Reportes visuales y dashboards
**Story Points:** 34

- [ ] US-100: Dashboard Ejecutivo con KPIs (13)
- [ ] US-101: Gráficos de Evolución Temporal (8)
- [ ] US-102: Generación de PDF con Gráficos (13)

---

## 12. Historias Técnicas

### TS-001: Migración de Base de Datos
**Descripción:** Sistema de migraciones con Supabase
**Prioridad:** Must Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios:**
- [ ] Todas las migraciones en carpeta supabase/migrations/
- [ ] Formato: YYYYMMDDHHMMSS_nombre_descriptivo.sql
- [ ] Cada migración con comentario de documentación
- [ ] Migraciones idempotentes (IF EXISTS, IF NOT EXISTS)
- [ ] RLS habilitado en todas las tablas

---

### TS-002: Row Level Security (RLS)
**Descripción:** Políticas de seguridad a nivel de fila
**Prioridad:** Must Have
**Story Points:** 8
**Estado:** ✅ Done

**Criterios:**
- [ ] RLS habilitado en todas las tablas
- [ ] Políticas restrictivas por defecto
- [ ] Políticas usando auth.uid() para identificación
- [ ] Políticas documentadas en migraciones
- [ ] Probadas manualmente con diferentes usuarios

---

### TS-003: Optimización de Queries
**Descripción:** Queries eficientes y paginación
**Prioridad:** Should Have
**Story Points:** 8
**Estado:** ✅ Done

**Criterios:**
- [ ] Paginación de 1000 registros implementada
- [ ] Índices en columnas clave (cod_obra, version, clave_compuesta)
- [ ] Queries < 3 segundos para obras de 10k partidas
- [ ] Uso de LATERAL joins donde apropiado
- [ ] Función RPC para obtener versiones distintas

---

### TS-004: Edge Function para Notificaciones
**Descripción:** Serverless function para emails
**Prioridad:** Must Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios:**
- [ ] Edge Function en supabase/functions/notificar-solicitud-acceso/
- [ ] Manejo de CORS apropiado
- [ ] Try/catch para errores sin bloquear registro
- [ ] Logging de errores
- [ ] Deploy automático

---

### TS-005: TypeScript Types y Validaciones
**Descripción:** Tipado fuerte y validaciones
**Prioridad:** Should Have
**Story Points:** 5
**Estado:** ✅ Done

**Criterios:**
- [ ] Interfaces TypeScript para todos los modelos
- [ ] No uso de 'any' innecesario
- [ ] Validaciones en inputs críticos
- [ ] Sin errores de TypeScript en compilación
- [ ] Props tipadas en todos los componentes

---

### TS-006: Sistema de Build y Deploy
**Descripción:** CI/CD para deployment
**Prioridad:** Should Have
**Story Points:** 8
**Estado:** ⚠️ Parcial (Manual)

**Criterios:**
- [ ] npm run build sin errores
- [ ] Vite config optimizado para producción
- [ ] Variables de entorno configuradas
- [ ] Deploy automático en push a main
- [ ] Rollback capability

---

## 13. Roadmap de Releases

### Release 1.0 - MVP (DONE) ✅
**Fecha:** Diciembre 2024
**Funcionalidades:**
- Autenticación con aprobación manual
- Análisis detallado con árbol jerárquico
- Gestión de obras y versiones
- Visualización de Contrato vs Coste
- Cálculo de diferencias y varianzas
- Coeficiente K configurable
- Exportación a Excel
- Totales y agregaciones

**Story Points:** 112
**Estado:** Completado

---

### Release 1.1 - Análisis Avanzado (DONE) ✅
**Fecha:** Enero 2025
**Funcionalidades:**
- Partidas con mayor desviación
- Comparativas entre versiones (Coste vs Coste, Contrato vs Contrato)
- Planificación temporal
- Distribución mensual de valores
- Días laborables
- Vista de certidumbre (básica)

**Story Points:** 79
**Estado:** Completado

---

### Release 1.2 - Usabilidad (PLANNED)
**Fecha:** Q1 2026 (Marzo)
**Funcionalidades:**
- Búsqueda de partidas
- Tooltips informativos
- Configuración de columnas visibles
- Guardado de vistas por usuario
- Mejoras de UI/UX basadas en feedback

**Story Points:** 21
**Estado:** Backlog

---

### Release 1.3 - Rendimiento (PLANNED)
**Fecha:** Q2 2026 (Junio)
**Funcionalidades:**
- Virtualización de listas
- Caching inteligente
- Web Workers
- Optimizaciones de queries
- Soporte para obras de 50k+ partidas

**Story Points:** 21
**Estado:** Backlog

---

### Release 2.0 - Reportes y Analytics (PLANNED)
**Fecha:** Q3 2026 (Septiembre)
**Funcionalidades:**
- Dashboard ejecutivo
- Gráficos interactivos
- Generación de PDF
- Análisis de tendencias
- KPIs personalizables

**Story Points:** 34+
**Estado:** Discovery

---

### Release 3.0 - Colaboración (VISION)
**Fecha:** Q4 2026 (Diciembre)
**Funcionalidades:**
- Comentarios en partidas
- Workflows de aprobación
- Notificaciones en tiempo real
- Compartir vistas
- Auditoría de cambios

**Story Points:** TBD
**Estado:** Vision

---

## 14. Métricas y KPIs

### Métricas de Producto

**Adopción**
- Usuarios registrados totales
- Usuarios activos mensuales (MAU)
- Usuarios activos diarios (DAU)
- Tasa de aprobación de usuarios (goal: >90%)

**Engagement**
- Sesiones promedio por usuario/semana
- Duración promedio de sesión
- Número de obras analizadas por usuario
- Exportaciones realizadas por usuario/mes

**Funcionalidad Más Usada**
- % de sesiones que usan Análisis Detallado
- % de sesiones que usan Comparativas
- % de sesiones que usan Planificación
- % de sesiones que exportan datos

**Rendimiento**
- Tiempo de carga inicial (goal: <2s)
- Tiempo de query promedio (goal: <3s)
- Tasa de errores (goal: <1%)
- Disponibilidad del sistema (goal: >99.5%)

### Métricas de Calidad de Datos

**Completitud**
- % de partidas con datos de contrato completos
- % de partidas con datos de coste completos
- % de partidas con planificación temporal
- % de obras con todas las versiones (0, 1, 2)

**Consistencia**
- % de partidas con varianza < 10%
- % de partidas con varianza > 50%
- Promedio de desviación absoluta por obra
- Número de partidas con datos inconsistentes

### Métricas de Desarrollo

**Velocidad**
- Story Points completados por sprint
- Velocidad promedio (últimos 3 sprints)
- Lead time (idea → producción)
- Cycle time (desarrollo → done)

**Calidad de Código**
- Cobertura de tests (goal: >70%)
- Número de bugs reportados/mes
- Tiempo promedio de resolución de bugs
- Technical debt ratio

---

## Apéndice A: Plantilla de User Story

```markdown
### US-XXX: Título Descriptivo
**Como** [rol]
**Quiero** [acción]
**Para** [beneficio/objetivo]

**Prioridad:** [Must Have | Should Have | Could Have | Won't Have]
**Story Points:** [1, 2, 3, 5, 8, 13, 21]
**Estado:** [Backlog | Ready | In Progress | In Review | Done]

**Criterios de Aceptación:**
- [ ] Criterio 1 verificable
- [ ] Criterio 2 verificable
- [ ] Criterio 3 verificable

**Tareas Técnicas:**
- Tarea técnica 1
- Tarea técnica 2
- Tarea técnica 3

**Notas:**
- Nota adicional 1
- Nota adicional 2

**Dependencias:**
- US-XXX debe estar completa antes

**Definición de Demo:**
Cómo demostrar esta funcionalidad al Product Owner
```

---

## Apéndice B: Glosario de Términos Agile

**Backlog:** Lista priorizada de todas las funcionalidades pendientes

**Sprint:** Periodo de tiempo fijo (típicamente 1-2 semanas) para completar un conjunto de user stories

**Story Points:** Unidad relativa de esfuerzo y complejidad

**Velocity:** Story points completados por sprint (promedio histórico)

**Epic:** Gran funcionalidad que requiere múltiples sprints, típicamente se descompone en user stories

**Technical Debt:** Trabajo técnico pendiente que facilita desarrollo futuro

**Definition of Ready (DoR):** Criterios que una story debe cumplir para entrar en un sprint

**Definition of Done (DoD):** Criterios que una story debe cumplir para considerarse completa

**MVP (Minimum Viable Product):** Versión mínima del producto con funcionalidad suficiente para usuarios tempranos

**Spike:** Investigación técnica time-boxed para reducir incertidumbre

---

## Apéndice C: Referencias

**Documentos Relacionados**
- PRD - Sistema de Gestión Grupo INEXO.md
- README.md (técnico)
- Documentación de API de Supabase

**Herramientas**
- Jira / Linear / GitHub Projects para tracking
- Figma para diseños de UI
- Supabase Dashboard para BD
- GitHub para código

**Contacto**
- Product Owner: Javier García (jgarcia@inexo.es)
- Stakeholders: Equipo Grupo INEXO

---

**Fin del Documento**

Este backlog es un documento vivo que debe actualizarse continuamente según:
- Feedback de usuarios
- Cambios de prioridades del negocio
- Descubrimientos técnicos
- Métricas de uso real

Revisión recomendada: Mensual o por sprint

---

**Versión:** 1.0
**Última Actualización:** 15 de enero de 2026
**Próxima Revisión:** Febrero 2026
