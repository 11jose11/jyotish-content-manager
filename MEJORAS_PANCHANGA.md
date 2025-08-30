# Mejoras del Calendario Panchanga

## Funcionalidades Implementadas

### 1. Panel de Información Detallada del Día

Al hacer clic en cualquier día del calendario panchanga, se abre un panel completo con toda la información del día organizada en pestañas:

#### Pestaña "Panchanga"
- **Horarios**: Amanecer y atardecer del día
- **Tithi**: Información completa incluyendo grupo (Nanda, Bhadra, Jaya, Rikta, Purna), elemento, devata y significado
- **Vara**: Día de la semana con planeta regente, tipo y actividades sugeridas
- **Nakshatra**: Constelación lunar con pada, actividades favorables y desfavorables
- **Yoga**: Combinación de Tithi y Nakshatra con descripción y recomendaciones
- **Karana**: Mitad de un Tithi con descripción y actividades recomendadas

#### Pestaña "Yogas Especiales"
- Lista completa de yogas especiales del día
- Para cada yoga se muestra:
  - Nombre y polaridad (auspicioso/inauspicioso)
  - Razón de formación (combinaciones específicas de panchanga)
  - Variables cumplidas que activaron el yoga
  - Descripción detallada
  - Actividades favorables y a evitar
  - Notas adicionales

#### Pestaña "Generar Prompt"
- Sistema de templates personalizables para generar prompts de IA
- Variables disponibles:
  - `{fecha}`: Fecha completa del día
  - `{ciudad}`: Ciudad seleccionada
  - `{timezone}`: Zona horaria
  - `{tithi}`: Tithi del día
  - `{grupo_tithi}`: Grupo del Tithi
  - `{vara}`: Día de la semana
  - `{nakshatra}`: Nakshatra
  - `{pada}`: Pada del Nakshatra
  - `{yoga}`: Yoga del día
  - `{karana}`: Karana del día
  - `{yogas_especiales}`: Lista completa de yogas especiales
  - `{actividades_favorables}`: Actividades recomendadas
  - `{actividades_evitar}`: Actividades a evitar
  - `{amanecer}`: Hora del amanecer
  - `{atardecer}`: Hora del atardecer

### 2. Gestión de Templates

- **Guardar Templates**: Los usuarios pueden guardar templates personalizados con nombres descriptivos
- **Cargar Templates**: Acceso rápido a templates guardados previamente
- **Template por Defecto**: Template predefinido que incluye toda la información del panchanga

### 3. Funciones de Exportación

- **Copiar al Portapapeles**: Copia el prompt generado al portapapeles
- **Descargar como TXT**: Descarga el prompt como archivo de texto
- **Editar**: Permite editar el prompt antes de usarlo

### 4. Datos Enriquecidos de los 7 Archivos JSON

El sistema utiliza todos los archivos JSON de la base de datos:

#### Archivos Utilizados:
1. **Nakashatras.json**: Información completa de las 27 constelaciones lunares
   - Actividades favorables y desfavorables por nakshatra
   - Descripción detallada de cada constelación

2. **TIthi.json**: Datos de los 30 tithis
   - Devatas por tithi
   - Grupos (Nanda, Bhadra, Jaya, Rikta, Purna)
   - Elementos y significados

3. **Vara.json**: Información de los 7 días de la semana
   - Planetas regentes
   - Tipos de días (Dhruva, Cara, Krūra, etc.)
   - Actividades sugeridas por día

4. **karanas.json**: Datos de los 11 karanas
   - Descripción de cada karana
   - Actividades favorables y desfavorables
   - Devatas y regentes planetarios

5. **nitya-yogas.json**: Información de los 27 yogas nitya
   - Descripción y significado de cada yoga
   - Calidad y ventanas a evitar
   - Deidades asociadas

6. **yogas-special.json**: Definiciones de yogas especiales
   - Reglas de formación
   - Actividades favorables y a evitar
   - Descripción detallada

7. **panchanga_rules.json**: Reglas generales del panchanga
   - Criterios para yogas especiales
   - Recomendaciones generales

### 5. Interfaz Mejorada

- **Calendario Visual**: Los días con yogas especiales muestran un badge con el número de yogas
- **Selección Visual**: El día seleccionado se resalta con un anillo y color de fondo
- **Indicador de Carga**: Muestra el progreso mientras se cargan los datos
- **Responsive**: El panel se adapta a diferentes tamaños de pantalla
- **Navegación por Pestañas**: Organización clara de la información
- **Manejo de Errores**: Notificaciones cuando hay problemas cargando datos

## Uso

1. **Seleccionar Día**: Haz clic en cualquier día del calendario
2. **Revisar Información**: Navega por las pestañas para ver todos los datos
3. **Generar Prompt**: Ve a la pestaña "Generar Prompt"
4. **Personalizar**: Edita el template según tus necesidades
5. **Guardar Template**: Guarda templates personalizados para uso futuro
6. **Exportar**: Copia o descarga el prompt generado

## Variables de Template

### Variables Básicas
- `{fecha}` - Fecha completa (ej: "lunes, 15 de enero de 2024")
- `{ciudad}` - Ciudad seleccionada
- `{timezone}` - Zona horaria

### Variables de Panchanga
- `{tithi}` - Tithi (ej: "Pratipada")
- `{grupo_tithi}` - Grupo del Tithi (ej: "Nanda")
- `{vara}` - Día de la semana (ej: "Lunes")
- `{nakshatra}` - Nakshatra (ej: "Aśvinī")
- `{pada}` - Pada del Nakshatra (ej: "1")
- `{yoga}` - Yoga (ej: "Siddha")
- `{karana}` - Karana (ej: "Bālava")

### Variables de Horarios
- `{amanecer}` - Hora del amanecer (ej: "06:30")
- `{atardecer}` - Hora del atardecer (ej: "18:45")

### Variables de Recomendaciones
- `{actividades_favorables}` - Lista de actividades recomendadas
- `{actividades_evitar}` - Lista de actividades a evitar
- `{yogas_especiales}` - Lista completa de yogas especiales con detalles

## Ejemplo de Template

```
# REPORTE DIARIO — {fecha}
Lugar: {ciudad} TZ: {timezone} Ayanāṁśa: True Citra Paksha (Lahiri)

## PANCHANGA DEL DÍA
**Tithi:** {tithi} ({grupo_tithi}) | **Vara:** {vara}
**Nakṣatra:** {nakshatra} (pada {pada}) | **Yoga:** {yoga} | **Karana:** {karana}

## YOGAS ESPECIALES
{yogas_especiales}

## RECOMENDACIONES
- **Actividades favorables:** {actividades_favorables}
- **Actividades a evitar:** {actividades_evitar}

## HORARIOS
- **Amanecer:** {amanecer}
- **Atardecer:** {atardecer}

Instrucciones: Proporciona consejos prácticos basados en el panchanga del día, sin tecnicismos, tono positivo y motivador, 90-120 palabras.
```

## Archivos Modificados

- `apps/frontend/src/components/DayDetailPanel.tsx` - Nuevo componente con toda la funcionalidad
- `apps/frontend/src/pages/Panchanga.tsx` - Integración del panel y mejora del calendario
- `apps/frontend/src/lib/api.ts` - Añadida función usePanchangaRecommendations
- `apps/frontend/public/json-database/` - Todos los archivos JSON copiados

## Características Técnicas

### Carga de Datos
- Carga asíncrona de todos los archivos JSON
- Manejo de errores con notificaciones toast
- Indicador de carga mientras se procesan los datos
- Cache local de templates guardados

### Interfaz de Usuario
- Diseño responsive con Tailwind CSS
- Componentes de shadcn/ui para consistencia
- Animaciones suaves y transiciones
- Navegación intuitiva por pestañas

### Funcionalidades Avanzadas
- Sistema de templates personalizables
- Variables dinámicas basadas en datos reales
- Exportación en múltiples formatos
- Persistencia local de preferencias

## Próximas Mejoras

- [ ] Añadir más variables de template
- [ ] Sistema de templates compartidos
- [ ] Exportación a diferentes formatos (PDF, Word)
- [ ] Integración con APIs de IA
- [ ] Historial de prompts generados
- [ ] Filtros avanzados para yogas especiales
- [ ] Búsqueda y filtrado de días por características
- [ ] Comparación de días
- [ ] Notificaciones de yogas especiales importantes
