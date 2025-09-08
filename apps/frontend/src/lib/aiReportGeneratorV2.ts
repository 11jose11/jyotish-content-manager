import { panchangaSimplifiedService, type NakshatraData, type TithiData, type VaraData, type YogaData } from './panchangaSimplifiedService'

export interface DayRecommendations {
  tithi: TithiData | null
  vara: VaraData | null
  nakshatra: NakshatraData | null
  yoga: YogaData | null
  summary: {
    favorableActivities: string[]
    avoidActivities: string[]
    overallMood: 'auspicious' | 'inauspicious' | 'neutral'
  }
}

export interface SpecialYoga {
  name: string
  polarity: string
  rule?: string
  explain?: string
  reason?: string
  description?: string
  activities?: string[]
  avoid?: string[]
  beneficial_activities?: string[]
  avoid_activities?: string[]
  favorables?: string[]
  desfavorables?: string[]
  deity?: string
  planet?: string
  element?: string
  classification?: string
  category?: string
  priority?: string
  notes?: string
  type?: string
}

export interface DayData {
  date: string
  tithi: any
  vara: any
  nakshatra: any
  yoga: any
  karana: any
  specialYogas: SpecialYoga[]
}

export class AIReportGeneratorV2 {
  /**
   * Genera un prompt completo para IA con todas las recomendaciones del día
   */
  static async generateDailyReportPrompt(dayData: DayData): Promise<string> {
    try {
      // Obtener recomendaciones detalladas
      const recommendations = await panchangaSimplifiedService.getDayRecommendations({
        tithi: dayData.tithi,
        vara: dayData.vara,
        nakshatra: dayData.nakshatra,
        yoga: dayData.yoga
      })

      const date = new Date(dayData.date)
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' })
      const fullDate = date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })

      // Construir el prompt
      const prompt = this.buildPrompt(dayData, recommendations, fullDate, dayName)
      
      return prompt
    } catch (error) {
      console.error('Error generating AI report prompt:', error)
      throw new Error('No se pudo generar el prompt para el reporte de IA')
    }
  }

  /**
   * Construye el prompt estructurado para IA
   */
  private static buildPrompt(dayData: DayData, recommendations: DayRecommendations, fullDate: string, dayName: string): string {
    const prompt = `# DATOS DEL DÍA (INPUT — RELLENAR POR SISTEMA)
Fecha: ${fullDate}
TZ: Europe/Paris

🪐 PAÑCHANGA DETALLADO DEL DÍA

📅 ELEMENTOS BÁSICOS:

🌙 Nakshatra: ${dayData.nakshatra?.nameIAST || dayData.nakshatra?.name || 'No disponible'}
• Índice: ${dayData.nakshatra?.index || 'No disponible'}
• Pada: ${dayData.nakshatra?.pada || 'No disponible'}
• Actividades favorables: ${recommendations.nakshatra?.favorables && recommendations.nakshatra.favorables.length > 0 ? recommendations.nakshatra.favorables.slice(0, 5).join(', ') : 'No especificadas'}
• Actividades desfavorables: ${recommendations.nakshatra?.desfavorables && recommendations.nakshatra.desfavorables.length > 0 ? recommendations.nakshatra.desfavorables.slice(0, 5).join(', ') : 'No especificadas'}
• Deidad: ${recommendations.nakshatra?.deity || 'Deidad lunar'}
• Planeta: ${recommendations.nakshatra?.planet || 'Planeta lunar'}
• Elemento: ${recommendations.nakshatra?.element || 'Elemento lunar'}
• Clasificación: ${recommendations.nakshatra?.classification || 'Clasificación lunar'}
• Recomendaciones completas: Favorables: ${recommendations.nakshatra?.favorables?.join(', ') || 'actividades relacionadas con la naturaleza de la constelación'}. Desfavorables: ${recommendations.nakshatra?.desfavorables?.join(', ') || 'actividades contrarias a su energía'}.

🌕 Tithi: ${dayData.tithi?.code || dayData.tithi?.name || 'No disponible'} (${dayData.tithi?.index || ''})
• Actividades favorables: ${recommendations.tithi?.favorables && recommendations.tithi.favorables.length > 0 ? recommendations.tithi.favorables.slice(0, 5).join(', ') : 'actividades según la fase lunar'}
• Actividades desfavorables: ${recommendations.tithi?.desfavorables && recommendations.tithi.desfavorables.length > 0 ? recommendations.tithi.desfavorables.slice(0, 5).join(', ') : 'No especificadas'}
• Elemento: ${recommendations.tithi?.element || 'Agua'}
• Grupo (si aplica): ${dayData.tithi?.group || 'Agua'}
• Recomendaciones completas: Favorables: ${recommendations.tithi?.favorables?.join(', ') || 'actividades según la fase lunar'}. Desfavorables: ${recommendations.tithi?.desfavorables?.join(', ') || 'actividades contrarias al período lunar'}.

⚡ Karana: ${dayData.karana?.name || dayData.karana || 'No disponible'}
• Deidad: ${dayData.karana?.deity || 'Aryama'}
• Recomendaciones completas: ${dayData.karana?.recommendations || 'Obras públicas/infraestructura; proyectos de largo plazo; fortalecer bases organizacionales'}.

☀️ Vara: ${dayData.vara?.name || 'No disponible'} (${dayName})
• Actividades favorables: ${recommendations.vara?.favorables && recommendations.vara.favorables.length > 0 ? recommendations.vara.favorables.slice(0, 5).join(', ') : 'No especificadas'}
• Actividades desfavorables: ${recommendations.vara?.desfavorables && recommendations.vara.desfavorables.length > 0 ? recommendations.vara.desfavorables.slice(0, 5).join(', ') : 'No especificadas'}
• Planeta regente: ${recommendations.vara?.planet || 'Planeta regente'}
• Recomendaciones completas: Favorables: ${recommendations.vara?.favorables?.join(', ') || 'actividades relacionadas con el planeta regente'}. Desfavorables: ${recommendations.vara?.desfavorables?.join(', ') || 'actividades contrarias a su energía'}.

🧘 Yoga: ${dayData.yoga || 'No disponible'}
• Actividades favorables: ${recommendations.yoga?.favorables && recommendations.yoga.favorables.length > 0 ? recommendations.yoga.favorables.slice(0, 5).join(', ') : 'actividades según la naturaleza del yoga'}
• Actividades desfavorables: ${recommendations.yoga?.desfavorables && recommendations.yoga.desfavorables.length > 0 ? recommendations.yoga.desfavorables.slice(0, 5).join(', ') : 'No especificadas'}
• Deidad: ${recommendations.yoga?.deity || 'Deidad del yoga'}
• Planeta: ${recommendations.yoga?.planet || 'Planeta del yoga'}
• Elemento: Elemento del yoga
• Tipo: Yoga solar-lunar
• Recomendaciones completas: Favorables: ${recommendations.yoga?.favorables?.join(', ') || 'actividades según la naturaleza del yoga'}. Desfavorables: ${recommendations.yoga?.desfavorables?.join(', ') || 'actividades contrarias a su energía'}.

🌟 YOGAS ESPECIALES (array; repetir bloque por cada yoga)
${dayData.specialYogas && dayData.specialYogas.length > 0 ? 
  dayData.specialYogas.map((yoga) => `
🟢 ${yoga.name} (Prioridad: ${yoga.priority || '2'})
Tipo: ${yoga.type || 'vara+tithi_group'}
💡 Descripción: ${yoga.explain || yoga.description || 'Yoga especial que influye en las actividades del día'}
🔍 Condiciones de Formación:
• Regla: ${yoga.rule || 'No especificada'}
• Razón: ${yoga.reason || 'No especificada'}
✅ Actividades Beneficiosas:
• ${yoga.beneficial_activities?.join('\n• ') || yoga.activities?.join('\n• ') || yoga.favorables?.join('\n• ') || 'Actividades según la naturaleza del yoga'}
⚠️ Evitar (si aplica): ${yoga.avoid_activities?.join(', ') || yoga.avoid?.join(', ') || yoga.desfavorables?.join(', ') || 'No especificado'}
`).join('') : 
  'No hay yogas especiales en este día'}

📊 RESUMEN DE ENERGÍAS DEL DÍA:
• Nakshatra: ${dayData.nakshatra?.nameIAST || dayData.nakshatra?.name || 'No disponible'} (Índice: ${dayData.nakshatra?.index || 'N/A'}, Pada: ${dayData.nakshatra?.pada || 'N/A'})
• Tithi: ${dayData.tithi?.code || dayData.tithi?.name || 'No disponible'} (Grupo: ${dayData.tithi?.group || 'N/A'})
• Vara: ${dayData.vara?.name || 'No disponible'} (Planeta: ${recommendations.vara?.planet || 'N/A'})
• Yoga: ${dayData.yoga || 'No disponible'}
• Karana: ${dayData.karana?.name || dayData.karana || 'No disponible'}
• Elementos predominantes: ${recommendations.nakshatra?.element || 'Elemento lunar'}, ${recommendations.tithi?.element || 'Elemento lunar'}, Elemento del yoga
• Deidades activas: ${recommendations.nakshatra?.deity || 'Deidad lunar'}, ${recommendations.tithi?.deity || 'Deidad lunar'}, ${recommendations.yoga?.deity || 'Deidad del yoga'}
• Yogas especiales activos: ${dayData.specialYogas?.length || 0}

# REGLAS DE LENGUAJE (OBLIGATORIO — NO IMPRIMIR)
- SALIDA en español natural, **100% legible por TTS**: sin diacríticos raros (usar Panchanga, Nakshatra, Tithi, etc.). **Solo tildes gramaticales español**.
- **No usar** "pada", "sector", "subsector". Traducir internamente "pada" como **etapa** (inicio, construcción, intercambio, cierre) si aplica.
- **Nada de placeholders genéricos** como "actividades relacionadas con la naturaleza de la constelación".
- Si un campo del input trae genéricos, **sustituir** por recomendaciones **específicas y accionables** derivadas de Nakshatra/Tithi/Karana/Vara/Yoga y de los **Yogas especiales** listados.
- Tono: **cercano, motivador, claro** (latino, más peruano que españolizado). Frases cortas, pausas naturales.
- No listas rígidas: integrar todo en **narrativa fluida** apta para 2–3 minutos (320–450 palabras).

# PRIORIDAD Y FUSIÓN (NO IMPRIMIR)
- Dar **prioridad** a Yogas especiales por orden de "Prioridad" y **sinergizarlos** con Nakshatra/Tithi/Karana/Vara/Yoga.
- Si hay **conflictos** (algún elemento desaconseja algo que un Yoga especial promueve), resolver así: 1) Prioridad 1 manda; 2) luego Prioridad 2; 3) luego el resto del pañchanga. 4) Menciona **ajustes**: "haz A, pero evita B", "elige la mañana/tarde", "prepara antes, ejecuta simple".
- **Tiempo**: 90–150 segundos. Enfócate en 1–2 **ventanas fuertes** y 1–2 **precauciones**.

# MOTOR DE MEZCLA (NO IMPRIMIR)
1) **Apertura** (1–2 frases): nombra la fecha (${fullDate}) y da la **idea fuerza** del día (tono + oportunidad principal).
2) **Lectura integrada**:
- Nakshatra → qué impulsa hoy (en lenguaje humano).
- Tithi (grupo si aplica, ej. Jaya) → empuje/voluntad/resultado.
- Karana → **cómo** hacerlo (social, práctico, equipos…).
- Vara (regente) → estilo del día (ej., Venus = estética, vínculos, acuerdos).
- Yoga → textura del ambiente (ej., Shobhana = realce estético, reputación).
3) **YOGAS ESPECIALES** (foco principal):
- Di **qué abren** hoy (ejecución premium, victoria, desbloqueo…).
- Mapea a **actividades concretas**: firmas, lanzamientos, negociaciones, viajes, mudanzas, bodas, arte/diseño, etc.
4) **Plan práctico** (30–45 s):
- Qué **sí** hacer hoy (2–4 acciones claras), **cuándo** (mañana/tarde si puedes inferir por tono), y **cómo** (estilo del día).
5) **Precauciones** (1–2):
- Qué **evitar o ajustar** y **alternativa** segura.
6) **Cierre** (1–2 frases):
- Síntesis del propósito del día + **una línea motivadora original** (no citas famosas).
7) **CITA CLÁSICA OBLIGATORIA**:
- Añade al final **una cita literal en español**, **≤ 25 palabras**, de un **texto clásico** (Bhagavad Gita, Upanishads, Yoga Sutras, Dhammapada, Vedas, Mahabharata, Ramayana u otros).
- Formato de atribución: **— Obra, capítulo:verso** (ej.: — Bhagavad Gita, 2:47).
- La cita debe **resonar con las recomendaciones del día** (coherencia temática).

# CONTROLES DE CALIDAD (NO IMPRIMIR)
- Longitud objetivo: **320–450 palabras** (≈ 2–3 min a ~150–170 wpm).
- **Prohibido** repetir definiciones vacías (sustituir por acciones medibles).
- Deduplicar ideas; evitar muletillas. Variar verbos (activar, concretar, negociar, pulir…).
- Nombres tradicionales **normalizados** (Shravana, Trayodashi, Kaulava, Shobhana).
- **Cita clásica: obligatoria**, literal en español, ≤ 25 palabras, **con fuente** en el formato indicado. **No inventar** citas.
- No inventar elementos no presentes en el input. Usa solo lo provisto.

# INSTRUCCIONES PARA GENERAR LA SALIDA (PÚBLICAS)
Genera un **reporte narrativo de 2–3 minutos** (320–450 palabras) para **${fullDate}**, integrando TODOS los elementos del pañchanga y dando **prioridad a los Yogas especiales** listados.

Entrega:
- **Apertura** con idea fuerza del día.
- **Lectura integrada** (Nakshatra, Tithi, Karana, Vara, Yoga) en lenguaje práctico.
- **Yogas especiales**: significado, impacto en decisiones, y actividades concretas recomendadas hoy.
- **Plan del día**: 2–4 acciones concretas y una o dos precauciones con alternativa.
- **Cierre motivador** (1–2 líneas).
- **Cita clásica Vedica**: agrega al final una **cita literal en español** (≤ 25 palabras) que **resuene** con el plan del día, con **atribución** "— Obra, capítulo:verso".

Recuerda: **no uses "pada/sector/subsector"**, evita placeholders, y mantén un tono claro, accesible y accionable.`

    return prompt
  }

  /**
   * Genera un prompt más corto para análisis rápido
   */
  static async generateQuickAnalysisPrompt(dayData: DayData): Promise<string> {
    try {
      const recommendations = await panchangaSimplifiedService.getDayRecommendations({
        tithi: dayData.tithi,
        vara: dayData.vara,
        nakshatra: dayData.nakshatra,
        yoga: dayData.yoga
      })

      const date = new Date(dayData.date)
      const formattedDate = date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      return `# ANÁLISIS RÁPIDO DE PANCHANGA - ${formattedDate}

**Fecha:** ${formattedDate}
**Tithi:** ${dayData.tithi?.code || 'N/A'} (${recommendations.tithi?.name || 'N/A'})
**Vara:** ${dayData.vara?.name || 'N/A'} (${recommendations.vara?.name || 'N/A'})
**Nakshatra:** ${dayData.nakshatra?.nameIAST || 'N/A'} (${recommendations.nakshatra?.name || 'N/A'})
**Yoga:** ${dayData.yoga || 'N/A'} (${recommendations.yoga?.name || 'N/A'})
**Karana:** ${dayData.karana?.name || 'N/A'}
**Yogas Especiales:** ${dayData.specialYogas?.length || 0}

**Estado General:** ${recommendations.summary.overallMood === 'auspicious' ? 'Auspicioso ✨' : recommendations.summary.overallMood === 'inauspicious' ? 'Desfavorable ⚠️' : 'Neutral ⚖️'}

**Top 5 Actividades Recomendadas:**
${recommendations.summary.favorableActivities.slice(0, 5).map(activity => `- ${activity}`).join('\n')}

**Top 5 Actividades a Evitar:**
${recommendations.summary.avoidActivities.slice(0, 5).map(activity => `- ${activity}`).join('\n')}

${dayData.specialYogas && dayData.specialYogas.length > 0 ? `
**Yogas Especiales:**
${dayData.specialYogas.map(yoga => `- ${yoga.name} (${yoga.polarity === 'auspicious' || yoga.polarity === 'positive' ? 'Auspicioso' : 'Desfavorable'})`).join('\n')}
` : ''}

Genera un análisis conciso y práctico para este día, enfocándote en las recomendaciones más importantes.`
    } catch (error) {
      console.error('Error generating quick analysis prompt:', error)
      throw new Error('No se pudo generar el prompt de análisis rápido')
    }
  }
}

export const aiReportGeneratorV2 = new AIReportGeneratorV2()
