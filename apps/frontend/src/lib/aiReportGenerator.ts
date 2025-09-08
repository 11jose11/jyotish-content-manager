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
  deity?: string
  planet?: string
  element?: string
  classification?: string
  category?: string
  priority?: string
  notes?: string
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

export class AIReportGenerator {
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
      const formattedDate = date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      // Construir el prompt
      const prompt = this.buildPrompt(dayData, recommendations, formattedDate)
      
      return prompt
    } catch (error) {
      console.error('Error generating AI report prompt:', error)
      throw new Error('No se pudo generar el prompt para el reporte de IA')
    }
  }

  /**
   * Construye el prompt estructurado para IA
   */
  private static buildPrompt(dayData: DayData, recommendations: DayRecommendations, formattedDate: string): string {
    const prompt = `# REPORTE DIARIO DE PANCHANGA - ${formattedDate.toUpperCase()}

## INFORMACIÓN BÁSICA DEL DÍA
**Fecha:** ${formattedDate}
**Día de la semana:** ${dayData.vara?.name || 'No disponible'}

## ANÁLISIS DE LOS 5 ANGAS DEL PANCHANGA

### 1. TITHI (Día Lunar)
**Tithi:** ${dayData.tithi?.code || 'No disponible'}
**Grupo:** ${dayData.tithi?.group || 'No disponible'}
${recommendations.tithi ? `
**Nombre completo:** ${recommendations.tithi?.name || 'N/A'}
**Traducción:** ${recommendations.tithi?.translation || 'N/A'}
**Deidad:** ${recommendations.tithi?.deity || 'N/A'}
**Elemento:** ${recommendations.tithi?.element || 'N/A'}
**Clasificación:** ${recommendations.tithi?.classification || 'N/A'}

**Actividades Favorables (${recommendations.tithi?.favorables?.length || 0}):**
${(recommendations.tithi?.favorables || []).map(activity => `- ${activity}`).join('\n')}

**Actividades a Evitar (${recommendations.tithi?.desfavorables?.length || 0}):**
${(recommendations.tithi?.desfavorables || []).map(activity => `- ${activity}`).join('\n')}
` : '**No se encontraron datos detallados del Tithi**'}

### 2. VARA (Día de la Semana)
**Vara:** ${dayData.vara?.name || 'No disponible'}
${recommendations.vara ? `
**Nombre completo:** ${recommendations.vara?.name || 'N/A'}
**Traducción:** ${recommendations.vara?.translation || 'N/A'}
**Planeta:** ${recommendations.vara?.planet || 'N/A'}
**Clasificación:** ${recommendations.vara?.classification || 'N/A'}

**Actividades Favorables (${recommendations.vara?.favorables?.length || 0}):**
${(recommendations.vara?.favorables || []).map(activity => `- ${activity}`).join('\n')}

**Actividades a Evitar (${recommendations.vara?.desfavorables?.length || 0}):**
${(recommendations.vara?.desfavorables || []).map(activity => `- ${activity}`).join('\n')}
` : '**No se encontraron datos detallados del Vara**'}

### 3. NAKSHATRA (Constelación Lunar)
**Nakshatra:** ${dayData.nakshatra?.nameIAST || 'No disponible'}
**Índice:** ${dayData.nakshatra?.index || 'No disponible'}
**Pada:** ${dayData.nakshatra?.pada || 'No disponible'}
${recommendations.nakshatra ? `
**Nombre completo:** ${recommendations.nakshatra?.name || 'N/A'}
**Traducción:** ${recommendations.nakshatra?.translation || 'N/A'}
**Deidad:** ${recommendations.nakshatra?.deity || 'N/A'}
**Planeta:** ${recommendations.nakshatra?.planet || 'N/A'}
**Elemento:** ${recommendations.nakshatra?.element || 'N/A'}
**Clasificación:** ${recommendations.nakshatra?.classification || 'N/A'}

**Actividades Favorables (${recommendations.nakshatra?.favorables?.length || 0}):**
${(recommendations.nakshatra?.favorables || []).map(activity => `- ${activity}`).join('\n')}

**Actividades a Evitar (${recommendations.nakshatra?.desfavorables?.length || 0}):**
${(recommendations.nakshatra?.desfavorables || []).map(activity => `- ${activity}`).join('\n')}
` : '**No se encontraron datos detallados del Nakshatra**'}

### 4. YOGA (Combinación Solar-Lunar)
**Yoga:** ${dayData.yoga || 'No disponible'}
${recommendations.yoga ? `
**Nombre completo:** ${recommendations.yoga?.name || 'N/A'}
**Traducción:** ${recommendations.yoga?.translation || 'N/A'}
**Deidad:** ${recommendations.yoga?.deity || 'N/A'}
**Planeta:** ${recommendations.yoga?.planet || 'N/A'}
**Clasificación:** ${recommendations.yoga?.classification || 'N/A'}

**Actividades Favorables (${recommendations.yoga?.favorables?.length || 0}):**
${(recommendations.yoga?.favorables || []).map(activity => `- ${activity}`).join('\n')}

**Actividades a Evitar (${recommendations.yoga?.desfavorables?.length || 0}):**
${(recommendations.yoga?.desfavorables || []).map(activity => `- ${activity}`).join('\n')}
` : '**No se encontraron datos detallados del Yoga**'}

### 5. KARANA (Mitad del Tithi)
**Karana:** ${dayData.karana?.name || 'No disponible'}

## YOGAS ESPECIALES DEL DÍA
${dayData.specialYogas && dayData.specialYogas.length > 0 ? `
**Total de Yogas Especiales:** ${dayData.specialYogas.length}

${dayData.specialYogas.map((yoga, index) => `
### Yoga Especial ${index + 1}: ${yoga?.name || 'Sin nombre'}
**Polaridad:** ${yoga.polarity === 'auspicious' || yoga.polarity === 'positive' ? 'Auspicioso ✨' : 'Desfavorable ⚠️'}
${yoga.explain ? `**Descripción:** ${yoga.explain}` : ''}
${yoga.rule ? `**Condición Astrológica:** ${yoga.rule}` : ''}
${yoga.reason ? `**Razón de Formación:** ${yoga.reason}` : ''}
${yoga.deity ? `**Deidad:** ${yoga.deity}` : ''}
${yoga.planet ? `**Planeta:** ${yoga.planet}` : ''}
${yoga.element ? `**Elemento:** ${yoga.element}` : ''}
${yoga.classification ? `**Clasificación:** ${yoga.classification}` : ''}
${yoga.category ? `**Categoría:** ${yoga.category}` : ''}
${yoga.priority ? `**Prioridad:** ${yoga.priority}` : ''}

${yoga.activities && yoga.activities.length > 0 ? `**Actividades Recomendadas:**
${yoga.activities.map(activity => `- ${activity}`).join('\n')}` : ''}

${yoga.beneficial_activities && yoga.beneficial_activities.length > 0 ? `**Actividades Beneficiosas:**
${yoga.beneficial_activities.map(activity => `- ${activity}`).join('\n')}` : ''}

${yoga.avoid && yoga.avoid.length > 0 ? `**Actividades a Evitar:**
${yoga.avoid.map(activity => `- ${activity}`).join('\n')}` : ''}

${yoga.avoid_activities && yoga.avoid_activities.length > 0 ? `**Actividades a Evitar:**
${yoga.avoid_activities.map(activity => `- ${activity}`).join('\n')}` : ''}

${yoga.notes ? `**Notas Importantes:** ${yoga.notes}` : ''}
`).join('\n')}
` : '**No hay yogas especiales en este día**'}

## RESUMEN GENERAL DE RECOMENDACIONES
**Estado General:** ${recommendations.summary.overallMood === 'auspicious' ? 'Auspicioso ✨' : recommendations.summary.overallMood === 'inauspicious' ? 'Desfavorable ⚠️' : 'Neutral ⚖️'}

**Total de Actividades Favorables:** ${recommendations.summary.favorableActivities.length}
**Total de Actividades a Evitar:** ${recommendations.summary.avoidActivities.length}

### Actividades Más Recomendadas:
${recommendations.summary.favorableActivities.slice(0, 10).map(activity => `- ${activity}`).join('\n')}

### Actividades Más Importantes a Evitar:
${recommendations.summary.avoidActivities.slice(0, 10).map(activity => `- ${activity}`).join('\n')}

---

## INSTRUCCIONES PARA EL REPORTE DE IA

Por favor, genera un reporte diario de panchanga basado en la información anterior que incluya:

1. **ANÁLISIS GENERAL DEL DÍA**
   - Evaluación del carácter general del día (auspicioso/desfavorable/neutral)
   - Resumen de la energía predominante
   - Recomendación general para el día

2. **RECOMENDACIONES ESPECÍFICAS POR ÁREA**
   - Actividades profesionales y laborales
   - Actividades personales y familiares
   - Actividades espirituales y religiosas
   - Actividades de salud y bienestar
   - Actividades creativas y artísticas
   - Actividades financieras y comerciales

3. **ANÁLISIS DE YOGAS ESPECIALES**
   - Impacto de cada yoga especial en el día
   - Recomendaciones específicas para cada yoga
   - Consideraciones especiales a tener en cuenta

4. **HORARIOS RECOMENDADOS**
   - Mejores momentos del día para diferentes actividades
   - Horarios a evitar para actividades importantes
   - Consideraciones de tiempo basadas en los angas

5. **CONSEJOS PRÁCTICOS**
   - Tips específicos para aprovechar al máximo el día
   - Precauciones importantes a considerar
   - Oportunidades únicas del día

6. **CONCLUSIÓN**
   - Resumen final con las 3 recomendaciones más importantes
   - Mensaje motivacional o de precaución según corresponda
   - Sugerencia para el día siguiente

**Formato del reporte:** Usa un tono profesional pero accesible, con emojis apropiados y estructura clara con títulos y subtítulos. El reporte debe ser práctico y útil para la toma de decisiones diarias.`

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
${dayData.specialYogas.map(yoga => `- ${yoga?.name || 'Sin nombre'} (${yoga?.polarity === 'auspicious' || yoga?.polarity === 'positive' ? 'Auspicioso' : 'Desfavorable'})`).join('\n')}
` : ''}

Genera un análisis conciso y práctico para este día, enfocándote en las recomendaciones más importantes.`
    } catch (error) {
      console.error('Error generating quick analysis prompt:', error)
      throw new Error('No se pudo generar el prompt de análisis rápido')
    }
  }
}

export const aiReportGenerator = new AIReportGenerator()
