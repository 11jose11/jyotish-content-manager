import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, FileText, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { getPanchangaDetails, getPanchangaDataFromAPI, getDailyRecommendationsFromAPI } from '@/lib/panchangaData'
// Funciones síncronas para enriquecer datos básicos
const getNakshatraTranslation = (name: string): string => {
  const translations: Record<string, string> = {
    // Variantes con diacríticos
    'Aśvinī': 'La Primera Favorable',
    'Ashwini': 'La Primera Favorable',
    'Bharaṇī': 'La Portadora',
    'Bharani': 'La Portadora',
    'Kṛttikā': 'Las Cortadoras',
    'Krittika': 'Las Cortadoras',
    'Rohiṇī': 'La Roja',
    'Rohini': 'La Roja',
    'Mṛgaśirā': 'La Cabeza del Ciervo',
    'Mrigashira': 'La Cabeza del Ciervo',
    'Ārdrā': 'La Húmeda',
    'Ardra': 'La Húmeda',
    'Punarvasu': 'El Retorno de la Luz',
    'Puṣya': 'El Nutritivo',
    'Pushya': 'El Nutritivo',
    'Āśleṣā': 'El Abrazo',
    'Ashlesha': 'El Abrazo',
    'Maghā': 'La Poderosa',
    'Magha': 'La Poderosa',
    'Pūrvaphalgunī': 'La Primera Favorable',
    'Purva Phalguni': 'La Primera Favorable',
    'Uttaraphalgunī': 'La Segunda Favorable',
    'Uttara Phalguni': 'La Segunda Favorable',
    'Hasta': 'La Mano',
    'Citrā': 'La Brillante',
    'Chitra': 'La Brillante',
    'Svātī': 'El Independiente',
    'Swati': 'El Independiente',
    'Viśākhā': 'La Ramificada',
    'Vishakha': 'La Ramificada',
    'Anurādhā': 'La Seguida',
    'Anuradha': 'La Seguida',
    'Jyeṣṭhā': 'La Mayor',
    'Jyeshtha': 'La Mayor',
    'Mūla': 'La Raíz',
    'Mula': 'La Raíz',
    'Pūrvāṣāḍhā': 'La Primera Invicta',
    'Purva Ashadha': 'La Primera Invicta',
    'Uttarāṣāḍhā': 'La Segunda Invicta',
    'Uttara Ashadha': 'La Segunda Invicta',
    'Śravaṇa': 'El Oído',
    'Shravana': 'El Oído',
    'Dhaniṣṭhā': 'La Rica',
    'Dhanishtha': 'La Rica',
    'Śatabhiṣā': 'Los Cien Curanderos',
    'Shatabhisha': 'Los Cien Curanderos',
    'Pūrvabhādrapadā': 'La Primera Favorable',
    'Purva Bhadrapada': 'La Primera Favorable',
    'Uttarabhādrapadā': 'La Segunda Favorable',
    'Uttara Bhadrapada': 'La Segunda Favorable',
    'Revatī': 'La Rica',
    'Revati': 'La Rica'
  }
  return translations[name] || 'Constelación lunar'
}

const getNakshatraDeity = (name: string): string => {
  const deities: Record<string, string> = {
    // Variantes con diacríticos
    'Aśvinī': 'Aśvinī Kumaras',
    'Ashwini': 'Aśvinī Kumaras',
    'Bharaṇī': 'Yama',
    'Bharani': 'Yama',
    'Kṛttikā': 'Agni',
    'Krittika': 'Agni',
    'Rohiṇī': 'Brahmā',
    'Rohini': 'Brahmā',
    'Mṛgaśirā': 'Soma',
    'Mrigashira': 'Soma',
    'Ārdrā': 'Rudra',
    'Ardra': 'Rudra',
    'Punarvasu': 'Aditi',
    'Puṣya': 'Bṛhaspati',
    'Pushya': 'Bṛhaspati',
    'Āśleṣā': 'Nāgas',
    'Ashlesha': 'Nāgas',
    'Maghā': 'Pitṛs',
    'Magha': 'Pitṛs',
    'Pūrvaphalgunī': 'Bhaga',
    'Purva Phalguni': 'Bhaga',
    'Uttaraphalgunī': 'Aryaman',
    'Uttara Phalguni': 'Aryaman',
    'Hasta': 'Savitṛ',
    'Citrā': 'Tvaṣṭṛ',
    'Chitra': 'Tvaṣṭṛ',
    'Svātī': 'Vāyu',
    'Swati': 'Vāyu',
    'Viśākhā': 'Indrāgni',
    'Vishakha': 'Indrāgni',
    'Anurādhā': 'Mitra',
    'Anuradha': 'Mitra',
    'Jyeṣṭhā': 'Indra',
    'Jyeshtha': 'Indra',
    'Mūla': 'Nirṛti',
    'Mula': 'Nirṛti',
    'Pūrvāṣāḍhā': 'Āpas',
    'Purva Ashadha': 'Āpas',
    'Uttarāṣāḍhā': 'Viśve Devas',
    'Uttara Ashadha': 'Viśve Devas',
    'Śravaṇa': 'Viṣṇu',
    'Shravana': 'Viṣṇu',
    'Dhaniṣṭhā': 'Vasu',
    'Dhanishtha': 'Vasu',
    'Śatabhiṣā': 'Varuṇa',
    'Shatabhisha': 'Varuṇa',
    'Pūrvabhādrapadā': 'Aja Ekapāda',
    'Purva Bhadrapada': 'Aja Ekapāda',
    'Uttarabhādrapadā': 'Ahir Budhnya',
    'Uttara Bhadrapada': 'Ahir Budhnya',
    'Revatī': 'Pūṣan',
    'Revati': 'Pūṣan'
  }
  return deities[name] || 'Deidad lunar'
}

const getNakshatraClassification = (name: string): string => {
  const classifications: Record<string, string> = {
    // Variantes con diacríticos
    'Aśvinī': 'Mṛdu (Suave)',
    'Ashwini': 'Mṛdu (Suave)',
    'Bharaṇī': 'Ugra (Feroz)',
    'Bharani': 'Ugra (Feroz)',
    'Kṛttikā': 'Ugra (Feroz)',
    'Krittika': 'Ugra (Feroz)',
    'Rohiṇī': 'Mṛdu (Suave)',
    'Rohini': 'Mṛdu (Suave)',
    'Mṛgaśirā': 'Mṛdu (Suave)',
    'Mrigashira': 'Mṛdu (Suave)',
    'Ārdrā': 'Ugra (Feroz)',
    'Ardra': 'Ugra (Feroz)',
    'Punarvasu': 'Mṛdu (Suave)',
    'Puṣya': 'Mṛdu (Suave)',
    'Pushya': 'Mṛdu (Suave)',
    'Āśleṣā': 'Ugra (Feroz)',
    'Ashlesha': 'Ugra (Feroz)',
    'Maghā': 'Ugra (Feroz)',
    'Magha': 'Ugra (Feroz)',
    'Pūrvaphalgunī': 'Mṛdu (Suave)',
    'Purva Phalguni': 'Mṛdu (Suave)',
    'Uttaraphalgunī': 'Mṛdu (Suave)',
    'Uttara Phalguni': 'Mṛdu (Suave)',
    'Hasta': 'Mṛdu (Suave)',
    'Citrā': 'Mṛdu (Suave)',
    'Chitra': 'Mṛdu (Suave)',
    'Svātī': 'Mṛdu (Suave)',
    'Swati': 'Mṛdu (Suave)',
    'Viśākhā': 'Ugra (Feroz)',
    'Vishakha': 'Ugra (Feroz)',
    'Anurādhā': 'Mṛdu (Suave)',
    'Anuradha': 'Mṛdu (Suave)',
    'Jyeṣṭhā': 'Ugra (Feroz)',
    'Jyeshtha': 'Ugra (Feroz)',
    'Mūla': 'Ugra (Feroz)',
    'Mula': 'Ugra (Feroz)',
    'Pūrvāṣāḍhā': 'Ugra (Feroz)',
    'Purva Ashadha': 'Ugra (Feroz)',
    'Uttarāṣāḍhā': 'Mṛdu (Suave)',
    'Uttara Ashadha': 'Mṛdu (Suave)',
    'Śravaṇa': 'Mṛdu (Suave)',
    'Shravana': 'Mṛdu (Suave)',
    'Dhaniṣṭhā': 'Ugra (Feroz)',
    'Dhanishtha': 'Ugra (Feroz)',
    'Śatabhiṣā': 'Ugra (Feroz)',
    'Shatabhisha': 'Ugra (Feroz)',
    'Pūrvabhādrapadā': 'Ugra (Feroz)',
    'Purva Bhadrapada': 'Ugra (Feroz)',
    'Uttarabhādrapadā': 'Mṛdu (Suave)',
    'Uttara Bhadrapada': 'Mṛdu (Suave)',
    'Revatī': 'Mṛdu (Suave)',
    'Revati': 'Mṛdu (Suave)'
  }
  return classifications[name] || 'Clasificación lunar'
}

const getNakshatraRecommendations = (name: string): string => {
  // Función auxiliar para generar recomendaciones básicas si no hay datos de la API
  const basicRecommendations: Record<string, string> = {
    'Aśvinī': 'Favorables: iniciar proyectos, viajes, actividades de curación. Desfavorables: actividades destructivas.',
    'Bharaṇī': 'Favorables: actividades de transformación, purificación. Desfavorables: actividades de acumulación excesiva.',
    'Kṛttikā': 'Favorables: actividades de purificación, fuego, cocina. Desfavorables: actividades que requieren paciencia.',
    'Rohiṇī': 'Favorables: actividades creativas, arte, agricultura. Desfavorables: actividades de destrucción.',
    'Mṛgaśirā': 'Favorables: búsqueda, investigación, actividades de exploración. Desfavorables: actividades rutinarias.',
    'Ārdrā': 'Favorables: actividades de transformación, lluvia, purificación. Desfavorables: actividades que requieren estabilidad.',
    'Punarvasu': 'Favorables: retorno, renovación, actividades familiares. Desfavorables: actividades de separación.',
    'Puṣya': 'Favorables: nutrición, cuidado, actividades de crecimiento. Desfavorables: actividades de destrucción.',
    'Āśleṣā': 'Favorables: actividades profundas, transformación, sanación. Desfavorables: actividades superficiales.',
    'Maghā': 'Favorables: actividades de poder, liderazgo, ceremonias. Desfavorables: actividades de humildad excesiva.',
    'Pūrvaphalgunī': 'Favorables: actividades creativas, arte, celebración. Desfavorables: actividades de trabajo pesado.',
    'Uttaraphalgunī': 'Favorables: actividades de apoyo, servicio, amistad. Desfavorables: actividades egoístas.',
    'Hasta': 'Favorables: actividades manuales, artesanía, habilidades. Desfavorables: actividades que requieren fuerza bruta.',
    'Citrā': 'Favorables: actividades artísticas, creatividad, belleza. Desfavorables: actividades mundanas.',
    'Svātī': 'Favorables: actividades independientes, libertad, movimiento. Desfavorables: actividades restrictivas.',
    'Viśākhā': 'Favorables: actividades de logro, éxito, determinación. Desfavorables: actividades de abandono.',
    'Anurādhā': 'Favorables: actividades de seguimiento, apoyo, amistad. Desfavorables: actividades de liderazgo.',
    'Jyeṣṭhā': 'Favorables: actividades de autoridad, liderazgo, poder. Desfavorables: actividades de sumisión.',
    'Mūla': 'Favorables: actividades de raíz, fundamentos, investigación. Desfavorables: actividades superficiales.',
    'Pūrvāṣāḍhā': 'Favorables: actividades de victoria, conquista, logro. Desfavorables: actividades de derrota.',
    'Uttarāṣāḍhā': 'Favorables: actividades de victoria final, culminación. Desfavorables: actividades de inicio.',
    'Śravaṇa': 'Favorables: actividades de aprendizaje, escucha, conocimiento. Desfavorables: actividades de ignorancia.',
    'Dhaniṣṭhā': 'Favorables: actividades de riqueza, música, abundancia. Desfavorables: actividades de pobreza.',
    'Śatabhiṣā': 'Favorables: actividades de curación, medicina, transformación. Desfavorables: actividades de enfermedad.',
    'Pūrvabhādrapadā': 'Favorables: actividades de transformación, purificación. Desfavorables: actividades de contaminación.',
    'Uttarabhādrapadā': 'Favorables: actividades de liberación, moksha, espiritualidad. Desfavorables: actividades mundanas.',
    'Revatī': 'Favorables: actividades de completitud, viajes, abundancia. Desfavorables: actividades de incompletitud.'
  }
  
  return basicRecommendations[name] || 'Favorables: actividades según la naturaleza de la constelación. Desfavorables: actividades contrarias a su energía.'
}

const getTithiTranslation = (name: string): string => {
  const translations: Record<string, string> = {
    'Pratipada': 'Primer día lunar',
    'Dvitiya': 'Segundo día lunar',
    'Tritiya': 'Tercer día lunar',
    'Chaturthi': 'Cuarto día lunar',
    'Panchami': 'Quinto día lunar',
    'Shashthi': 'Sexto día lunar',
    'Saptami': 'Séptimo día lunar',
    'Ashtami': 'Octavo día lunar',
    'Navami': 'Noveno día lunar',
    'Dashami': 'Décimo día lunar',
    'Ekadashi': 'Undécimo día lunar',
    'Dwadashi': 'Duodécimo día lunar',
    'Trayodashi': 'Decimotercer día lunar',
    'Chaturdashi': 'Decimocuarto día lunar',
    'Purnima': 'Luna llena',
    'Amavasya': 'Luna nueva'
  }
  return translations[name] || 'Día lunar'
}

const getTithiElement = (name: string): string => {
  const elements: Record<string, string> = {
    'Pratipada': 'Agua',
    'Dvitiya': 'Agua',
    'Tritiya': 'Agua',
    'Chaturthi': 'Agua',
    'Panchami': 'Agua',
    'Shashthi': 'Agua',
    'Saptami': 'Agua',
    'Ashtami': 'Agua',
    'Navami': 'Agua',
    'Dashami': 'Agua',
    'Ekadashi': 'Agua',
    'Dwadashi': 'Agua',
    'Trayodashi': 'Agua',
    'Chaturdashi': 'Agua',
    'Purnima': 'Agua',
    'Amavasya': 'Agua'
  }
  return elements[name] || 'Elemento lunar'
}

const getTithiRecommendations = (name: string): string => {
  // Función auxiliar para generar recomendaciones básicas si no hay datos de la API
  const basicRecommendations: Record<string, string> = {
    'Pratipada': 'Favorables: iniciar proyectos, comienzos, actividades creativas. Desfavorables: finalizar asuntos importantes.',
    'Dvitiya': 'Favorables: actividades de crecimiento, desarrollo, expansión. Desfavorables: actividades destructivas.',
    'Tritiya': 'Favorables: actividades de prosperidad, abundancia, celebración. Desfavorables: actividades de escasez.',
    'Chaturthi': 'Favorables: actividades de obstáculos, desafíos, superación. Desfavorables: actividades fáciles.',
    'Panchami': 'Favorables: actividades de poder, autoridad, liderazgo. Desfavorables: actividades de sumisión.',
    'Shashthi': 'Favorables: actividades de salud, curación, bienestar. Desfavorables: actividades de enfermedad.',
    'Saptami': 'Favorables: actividades de viaje, movimiento, cambio. Desfavorables: actividades estáticas.',
    'Ashtami': 'Favorables: actividades de transformación, cambio, renovación. Desfavorables: actividades de estabilidad.',
    'Navami': 'Favorables: actividades de poder, fuerza, determinación. Desfavorables: actividades de debilidad.',
    'Dashami': 'Favorables: actividades de logro, éxito, victoria. Desfavorables: actividades de derrota.',
    'Ekadashi': 'Favorables: actividades espirituales, ayuno, purificación. Desfavorables: actividades mundanas.',
    'Dwadashi': 'Favorables: actividades de adoración, devoción, espiritualidad. Desfavorables: actividades materiales.',
    'Trayodashi': 'Favorables: actividades de poder, autoridad, liderazgo. Desfavorables: actividades de sumisión.',
    'Chaturdashi': 'Favorables: actividades de transformación, cambio, renovación. Desfavorables: actividades de estabilidad.',
    'Purnima': 'Favorables: actividades de completitud, celebración, abundancia. Desfavorables: actividades de incompletitud.',
    'Amavasya': 'Favorables: actividades de nuevos comienzos, purificación, renovación. Desfavorables: actividades de finalización.'
  }
  
  return basicRecommendations[name] || 'Favorables: actividades según la fase lunar. Desfavorables: actividades contrarias al período lunar.'
}

const getKaranaTranslation = (name: string): string => {
  const translations: Record<string, string> = {
    'Bava': 'Nacimiento',
    'Bālava': 'Fuerza',
    'Kaulava': 'Familia',
    'Taitila': 'Sésamo',
    'Garija': 'Montaña',
    'Vanija': 'Comercio',
    'Viṣṭi': 'Servicio',
    'Visti': 'Servicio',
    'Śakuni': 'Pájaro',
    'Shakuni': 'Pájaro',
    'Catuṣpāda': 'Cuatro patas',
    'Chatushpada': 'Cuatro patas',
    'Nāga': 'Serpiente',
    'Naga': 'Serpiente',
    'Kiṃstughna': 'Pequeño',
    'Kimstughna': 'Pequeño'
  }
  return translations[name] || 'Mitad de tithi'
}

const getKaranaDeity = (name: string): string => {
  const deities: Record<string, string> = {
    'Bava': 'Indra',
    'Bālava': 'Brahmā',
    'Kaulava': 'Mitra',
    'Taitila': 'Agni',
    'Garija': 'Indra',
    'Vanija': 'Brahmā',
    'Viṣṭi': 'Yama',
    'Visti': 'Yama',
    'Śakuni': 'Agni',
    'Shakuni': 'Agni',
    'Catuṣpāda': 'Brahmā',
    'Chatushpada': 'Brahmā',
    'Nāga': 'Indra',
    'Naga': 'Indra',
    'Kiṃstughna': 'Agni',
    'Kimstughna': 'Agni'
  }
  return deities[name] || 'Deidad del karana'
}

const getKaranaRecommendations = (name: string): string => {
  const recommendations: Record<string, string> = {
    'Bava': 'Favorables: iniciar proyectos, nacimientos, comienzos. Desfavorables: finalizar asuntos importantes.',
    'Bālava': 'Favorables: actividades que requieren fuerza, construcción, trabajos físicos. Desfavorables: actividades delicadas.',
    'Kaulava': 'Favorables: socializar, amistades, networking, alianzas, trabajo en equipo. Desfavorables: actividades solitarias.',
    'Taitila': 'Favorables: agricultura, cocina, actividades relacionadas con semillas. Desfavorables: actividades destructivas.',
    'Garija': 'Favorables: escalar, conquistar, actividades de montaña. Desfavorables: actividades en terrenos bajos.',
    'Vanija': 'Favorables: comercio, negocios, intercambios, ventas. Desfavorables: actividades no comerciales.',
    'Viṣṭi': 'Favorables: servicio, trabajo para otros, actividades de ayuda. Desfavorables: actividades egoístas.',
    'Visti': 'Favorables: servicio, trabajo para otros, actividades de ayuda. Desfavorables: actividades egoístas.',
    'Śakuni': 'Favorables: observación, espionaje, actividades de vigilancia. Desfavorables: actividades abiertas.',
    'Shakuni': 'Favorables: observación, espionaje, actividades de vigilancia. Desfavorables: actividades abiertas.',
    'Catuṣpāda': 'Favorables: estabilidad, actividades con animales, agricultura. Desfavorables: actividades inestables.',
    'Chatushpada': 'Favorables: estabilidad, actividades con animales, agricultura. Desfavorables: actividades inestables.',
    'Nāga': 'Favorables: transformación, sanación, actividades profundas. Desfavorables: actividades superficiales.',
    'Naga': 'Favorables: transformación, sanación, actividades profundas. Desfavorables: actividades superficiales.',
    'Kiṃstughna': 'Favorables: actividades pequeñas, detalles, trabajos minuciosos. Desfavorables: proyectos grandes.',
    'Kimstughna': 'Favorables: actividades pequeñas, detalles, trabajos minuciosos. Desfavorables: proyectos grandes.'
  }
  return recommendations[name] || 'Favorables: actividades según la naturaleza del karana. Desfavorables: actividades contrarias a su energía.'
}

const getVaraTranslation = (name: string): string => {
  const translations: Record<string, string> = {
    'Sunday': 'Domingo',
    'Monday': 'Lunes',
    'Tuesday': 'Martes',
    'Wednesday': 'Miércoles',
    'Thursday': 'Jueves',
    'Friday': 'Viernes',
    'Saturday': 'Sábado'
  }
  return translations[name] || 'Día de la semana'
}

const getVaraPlanet = (name: string): string => {
  const planets: Record<string, string> = {
    'Sunday': 'Sol',
    'Monday': 'Luna',
    'Tuesday': 'Marte',
    'Wednesday': 'Mercurio',
    'Thursday': 'Júpiter',
    'Friday': 'Venus',
    'Saturday': 'Saturno'
  }
  return planets[name] || 'Planeta regente'
}

const getVaraRecommendations = (name: string): string => {
  // Función auxiliar para generar recomendaciones básicas si no hay datos de la API
  const basicRecommendations: Record<string, string> = {
    'Sunday': 'Favorables: actividades de liderazgo, autoridad, poder. Desfavorables: actividades de sumisión.',
    'Monday': 'Favorables: actividades emocionales, familia, cuidado. Desfavorables: actividades de confrontación.',
    'Tuesday': 'Favorables: actividades de energía, acción, coraje. Desfavorables: actividades de pasividad.',
    'Wednesday': 'Favorables: actividades de comunicación, aprendizaje, comercio. Desfavorables: actividades de aislamiento.',
    'Thursday': 'Favorables: actividades de sabiduría, enseñanza, expansión. Desfavorables: actividades de restricción.',
    'Friday': 'Favorables: actividades de belleza, arte, relaciones. Desfavorables: actividades de conflicto.',
    'Saturday': 'Favorables: actividades de disciplina, trabajo duro, responsabilidad. Desfavorables: actividades de ocio excesivo.'
  }
  
  return basicRecommendations[name] || 'Favorables: actividades según la naturaleza del día. Desfavorables: actividades contrarias a su energía.'
}

const getYogaTranslation = (name: string): string => {
  const translations: Record<string, string> = {
    'Vishkumbha': 'Pilar de Aire',
    'Priti': 'Afecto',
    'Ayushman': 'Longevidad',
    'Saubhagya': 'Buena fortuna',
    'Shobhana': 'Hermoso',
    'Atiganda': 'Gran obstáculo',
    'Sukarman': 'Buen trabajo',
    'Dhriti': 'Firmeza',
    'Shula': 'Lanza',
    'Ganda': 'Nudo',
    'Vriddhi': 'Crecimiento',
    'Dhruva': 'Fijo',
    'Vyaghata': 'Colisión',
    'Harshana': 'Alegría',
    'Vajra': 'Rayo',
    'Siddhi': 'Perfección',
    'Vyatipata': 'Calamidad',
    'Variyan': 'Agua',
    'Parigha': 'Barrera',
    'Shiva': 'Auspicioso',
    'Siddha': 'Perfeccionado',
    'Sadhya': 'Realizable',
    'Shubha': 'Auspicioso',
    'Shukla': 'Blanco',
    'Brahma': 'Creador',
    'Indra': 'Rey de los dioses',
    'Vaidhriti': 'Separación'
  }
  return translations[name] || 'Combinación solar-lunar'
}

const getYogaType = (): string => {
  return 'Yoga solar-lunar'
}

const getYogaRecommendations = (name: string): string => {
  // Función auxiliar para generar recomendaciones básicas si no hay datos de la API
  const basicRecommendations: Record<string, string> = {
    'Vishkumbha': 'Favorables: actividades de estabilidad, construcción, fundamentos. Desfavorables: actividades inestables.',
    'Priti': 'Favorables: actividades de amor, afecto, relaciones. Desfavorables: actividades de odio.',
    'Ayushman': 'Favorables: actividades de salud, longevidad, bienestar. Desfavorables: actividades de enfermedad.',
    'Saubhagya': 'Favorables: actividades de buena fortuna, prosperidad, éxito. Desfavorables: actividades de mala suerte.',
    'Shobhana': 'Favorables: actividades de belleza, arte, estética. Desfavorables: actividades de fealdad.',
    'Atiganda': 'Favorables: actividades de superación de obstáculos. Desfavorables: actividades fáciles.',
    'Sukarman': 'Favorables: actividades de buen trabajo, productividad. Desfavorables: actividades de trabajo malo.',
    'Dhriti': 'Favorables: actividades de firmeza, determinación. Desfavorables: actividades de indecisión.',
    'Shula': 'Favorables: actividades de penetración, enfoque. Desfavorables: actividades dispersas.',
    'Ganda': 'Favorables: actividades de unión, conexión. Desfavorables: actividades de separación.',
    'Vriddhi': 'Favorables: actividades de crecimiento, expansión. Desfavorables: actividades de contracción.',
    'Dhruva': 'Favorables: actividades de estabilidad, permanencia. Desfavorables: actividades de cambio constante.',
    'Vyaghata': 'Favorables: actividades de confrontación, desafío. Desfavorables: actividades de evitación.',
    'Harshana': 'Favorables: actividades de alegría, celebración. Desfavorables: actividades de tristeza.',
    'Vajra': 'Favorables: actividades de poder, fuerza. Desfavorables: actividades de debilidad.',
    'Siddhi': 'Favorables: actividades de perfección, logro. Desfavorables: actividades de fracaso.',
    'Vyatipata': 'Favorables: actividades de cambio radical. Desfavorables: actividades de estabilidad.',
    'Variyan': 'Favorables: actividades de agua, purificación. Desfavorables: actividades de sequía.',
    'Parigha': 'Favorables: actividades de barrera, protección. Desfavorables: actividades de exposición.',
    'Shiva': 'Favorables: actividades auspiciosas, bendiciones. Desfavorables: actividades inauspiciosas.',
    'Siddha': 'Favorables: actividades de perfección, logro. Desfavorables: actividades de imperfección.',
    'Sadhya': 'Favorables: actividades realizables, factibles. Desfavorables: actividades imposibles.',
    'Shubha': 'Favorables: actividades auspiciosas, positivas. Desfavorables: actividades inauspiciosas.',
    'Shukla': 'Favorables: actividades puras, limpias. Desfavorables: actividades impuras.',
    'Brahma': 'Favorables: actividades creativas, de creación. Desfavorables: actividades destructivas.',
    'Indra': 'Favorables: actividades de poder, autoridad. Desfavorables: actividades de debilidad.',
    'Vaidhriti': 'Favorables: actividades de separación, distinción. Desfavorables: actividades de mezcla.'
  }
  
  return basicRecommendations[name] || 'Favorables: actividades según la naturaleza del yoga. Desfavorables: actividades contrarias a su energía.'
}

interface PanchangaElement {
  name: string
  nameIAST?: string
  translation?: string
  classification?: string
  recommendations?: string
  deity?: string
  element?: string
  type?: string
  planet?: string
}

interface SpecialYogaElement {
  name: string
  name_sanskrit?: string
  name_spanish?: string
  polarity?: string
  type?: string
  description?: string
  detailed_description?: string
  beneficial_activities?: string[]
  avoid_activities?: string[]
  notes?: string
  // Condiciones de formación
  vara?: string
  tithi_group?: string
  tithi_number?: number
  nakshatra?: string
  classification?: string
  sun_longitude?: number
  moon_longitude?: number
  distance_nakshatra?: number
  beneficial?: string
  avoid?: string[]
  recommended?: string[]
  color?: string
  priority?: number
}

interface PanchangaDetailPanelProps {
  date: string
  panchanga: {
    nakshatra?: PanchangaElement
    tithi?: PanchangaElement
    karana?: PanchangaElement
    vara?: PanchangaElement
    yoga?: PanchangaElement
    specialYogas?: SpecialYogaElement[]
  }
  isOpen: boolean
  onClose: () => void
}

const PanchangaDetailPanel: React.FC<PanchangaDetailPanelProps> = ({
  date,
  panchanga,
  isOpen,
  onClose
}) => {
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('')
  const [enrichedPanchanga, setEnrichedPanchanga] = useState<any>(null)
  const [apiRecommendations, setApiRecommendations] = useState<any>(null)
  const [loadingApiData, setLoadingApiData] = useState(false)

  // Función para cargar recomendaciones de la nueva API
  const loadApiRecommendations = async () => {
    console.log('🚀 Iniciando carga de recomendaciones de la API...')
    setLoadingApiData(true)
    try {
      // Cargar datos generales del panchanga
      console.log('📡 Cargando datos generales del panchanga...')
      const generalData = await getPanchangaDataFromAPI()
      console.log('📊 General panchanga data from API:', generalData)
      
      // Cargar recomendaciones específicas para la fecha usando los datos del panchanga
      console.log('📡 Cargando recomendaciones diarias...')
      console.log('📊 Panchanga data for API call:', {
        vara: panchanga?.vara?.name,
        tithi: panchanga?.tithi?.name,
        nakshatra: panchanga?.nakshatra?.name,
        yoga: panchanga?.yoga?.name
      })
      
      const dailyRecommendations = await getDailyRecommendationsFromAPI(
        date, 
        19.0760, // Mumbai latitude por defecto
        72.8777, // Mumbai longitude por defecto
        {
          vara: panchanga?.vara?.name,
          tithi: panchanga?.tithi?.name,
          nakshatra: panchanga?.nakshatra?.name,
          yoga: panchanga?.yoga?.name
        }
      )
      console.log('📅 Daily recommendations from API:', dailyRecommendations)
      
      const apiData = {
        general: generalData,
        daily: dailyRecommendations
      }
      
      console.log('💾 Guardando datos de la API:', apiData)
      setApiRecommendations(apiData)
      console.log('✅ Datos de la API guardados exitosamente')
      
    } catch (error) {
      console.error('❌ Error loading API recommendations:', error)
      toast.error('Error al cargar recomendaciones de la API')
    } finally {
      setLoadingApiData(false)
      console.log('🏁 Carga de API completada')
    }
  }

  // Función para enriquecer los datos básicos de la API con información detallada desde JSON
  const enrichPanchangaData = async (basicData: any) => {
    console.log('🔍 enrichPanchangaData called with:', basicData)
    
    if (!basicData) {
      console.log('❌ basicData is null or undefined')
      return null
    }

    // Log de los nombres que vienen de la API
    console.log('🔍 Nombres de la API:', {
      nakshatra: basicData.nakshatra?.name,
      tithi: basicData.tithi?.name,
      karana: basicData.karana?.name,
      vara: basicData.vara?.name,
      yoga: basicData.yoga?.name
    })

    try {
      // Cargar detalles desde los archivos JSON
      const details = await getPanchangaDetails(basicData)
      console.log('📊 Details loaded from JSON:', details)

      // Crear datos enriquecidos usando la información real de los JSON
      const enriched = {
        nakshatra: details.nakshatra || (basicData.nakshatra?.name ? {
          name: basicData.nakshatra.name,
          nameIAST: basicData.nakshatra.name,
          translation: getNakshatraTranslation(basicData.nakshatra.name),
          deity: getNakshatraDeity(basicData.nakshatra.name),
          classification: getNakshatraClassification(basicData.nakshatra.name),
          recommendations: getNakshatraRecommendations(basicData.nakshatra.name)
        } : null),
        tithi: details.tithi || (basicData.tithi?.name ? {
          name: basicData.tithi.name,
          nameIAST: basicData.tithi.name,
          translation: getTithiTranslation(basicData.tithi.name),
          element: getTithiElement(basicData.tithi.name),
          recommendations: getTithiRecommendations(basicData.tithi.name)
        } : null),
        karana: details.karana || (basicData.karana?.name ? {
          name: basicData.karana.name,
          nameIAST: basicData.karana.name,
          translation: getKaranaTranslation(basicData.karana.name),
          deity: getKaranaDeity(basicData.karana.name),
          recommendations: getKaranaRecommendations(basicData.karana.name)
        } : null),
        vara: details.vara || (basicData.vara?.name ? {
          name: basicData.vara.name,
          nameIAST: basicData.vara.name,
          translation: getVaraTranslation(basicData.vara.name),
          planet: getVaraPlanet(basicData.vara.name),
          recommendations: getVaraRecommendations(basicData.vara.name)
        } : null),
        yoga: details.yoga || (basicData.yoga?.name ? {
          name: basicData.yoga.name,
          nameIAST: basicData.yoga.name,
          translation: getYogaTranslation(basicData.yoga.name),
          type: getYogaType(),
          recommendations: getYogaRecommendations(basicData.yoga.name)
        } : null),
        specialYogas: basicData.specialYogas || []
      }
      
      // Log de los resultados de enriquecimiento
      console.log('🔍 Resultados de enriquecimiento:', {
        nakshatra: enriched.nakshatra,
        tithi: enriched.tithi,
        karana: enriched.karana,
        vara: enriched.vara,
        yoga: enriched.yoga
      })
      
      console.log('✅ Enriched data:', enriched)
      return enriched
    } catch (error) {
      console.error('❌ Error loading detailed data from JSON:', error)
      
      // Fallback a datos básicos si falla la carga de JSON
      const enriched = {
        nakshatra: basicData.nakshatra?.name ? {
          name: basicData.nakshatra.name,
          nameIAST: basicData.nakshatra.name,
          translation: getNakshatraTranslation(basicData.nakshatra.name),
          deity: getNakshatraDeity(basicData.nakshatra.name),
          classification: getNakshatraClassification(basicData.nakshatra.name),
          recommendations: getNakshatraRecommendations(basicData.nakshatra.name)
        } : null,
        tithi: basicData.tithi?.name ? {
          name: basicData.tithi.name,
          nameIAST: basicData.tithi.name,
          translation: getTithiTranslation(basicData.tithi.name),
          element: getTithiElement(basicData.tithi.name),
          recommendations: getTithiRecommendations(basicData.tithi.name)
        } : null,
        karana: basicData.karana?.name ? {
          name: basicData.karana.name,
          nameIAST: basicData.karana.name,
          translation: getKaranaTranslation(basicData.karana.name),
          deity: getKaranaDeity(basicData.karana.name),
          recommendations: getKaranaRecommendations(basicData.karana.name)
        } : null,
        vara: basicData.vara?.name ? {
          name: basicData.vara.name,
          nameIAST: basicData.vara.name,
          translation: getVaraTranslation(basicData.vara.name),
          planet: getVaraPlanet(basicData.vara.name),
          recommendations: getVaraRecommendations(basicData.vara.name)
        } : null,
        yoga: basicData.yoga?.name ? {
          name: basicData.yoga.name,
          nameIAST: basicData.yoga.name,
          translation: getYogaTranslation(basicData.yoga.name),
          type: getYogaType(),
          recommendations: getYogaRecommendations(basicData.yoga.name)
        } : null,
        specialYogas: basicData.specialYogas || []
      }
      
      return enriched
    }
  }

  useEffect(() => {
    console.log('🔄 useEffect triggered:', { isOpen, panchanga })
    
    if (isOpen && panchanga) {
      console.log('📊 Processing panchanga data:', panchanga)
      
      // Cargar recomendaciones de la nueva API
      loadApiRecommendations()
      
      // Enriquecer los datos básicos de la API de forma asíncrona
      const loadEnrichedData = async () => {
        try {
          const enriched = await enrichPanchangaData(panchanga)
          console.log('📈 Setting enriched panchanga:', enriched)
          setEnrichedPanchanga(enriched)
          
          // Log temporal para diagnosticar yogas
          if (enriched && enriched.specialYogas && enriched.specialYogas.length > 0) {
            console.log('🔍 Yogas especiales detectados:', enriched.specialYogas)
            enriched.specialYogas.forEach((yoga: any, index: number) => {
              console.log(`Yoga ${index + 1}:`, {
                name: yoga.name,
                polarity: yoga.polarity,
                avoid: yoga.avoid,
                beneficial: yoga.beneficial,
                recommended: yoga.recommended,
                avoid_activities: yoga.avoid_activities,
                beneficial_activities: yoga.beneficial_activities
              })
            })
          }
          
          // Generar prompt con datos enriquecidos
          if (enriched) {
            generatePrompt(enriched)
          }
        } catch (error) {
          console.error('❌ Error enriching panchanga data:', error)
          // Fallback a datos básicos
          setEnrichedPanchanga(panchanga)
        }
      }
      
      loadEnrichedData()
    } else {
      console.log('❌ Conditions not met:', { isOpen, panchanga })
    }
  }, [isOpen, panchanga])

  const generatePrompt = (data = enrichedPanchanga) => {
    if (!data) return
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    console.log('📝 Generating prompt with data:', data)



    // Función auxiliar para extraer actividades específicas de las recomendaciones
    const extractSpecificActivities = (recommendations: string) => {
      if (!recommendations) return { favorables: [], desfavorables: [] }
      
      const favorables = []
      const desfavorables = []
      
      // Buscar patrones de actividades favorables
      const favorableMatch = recommendations.match(/Favorables?:?\s*([^.]+)/i)
      if (favorableMatch) {
        const activities = favorableMatch[1].split(/[,;]/).map(a => a.trim()).filter(a => a && !a.includes('actividades relacionadas'))
        favorables.push(...activities)
      }
      
      // Buscar patrones de actividades desfavorables
      const unfavorableMatch = recommendations.match(/Desfavorables?:?\s*([^.]+)/i)
      if (unfavorableMatch) {
        const activities = unfavorableMatch[1].split(/[,;]/).map(a => a.trim()).filter(a => a && !a.includes('actividades contrarias'))
        desfavorables.push(...activities)
      }
      
      return { favorables, desfavorables }
    }

    // Función para obtener número romano del tithi
    const getTithiNumber = (tithiName: string) => {
      const tithiNumbers: Record<string, string> = {
        'Pratipada': '1', 'Dvitiya': '2', 'Tritiya': '3', 'Chaturthi': '4', 'Panchami': '5',
        'Shashthi': '6', 'Saptami': '7', 'Ashtami': '8', 'Navami': '9', 'Dashami': '10',
        'Ekadashi': '11', 'Dwadashi': '12', 'Trayodashi': '13', 'Chaturdashi': '14', 'Purnima': '15',
        'Amavasya': '15'
      }
      return tithiNumbers[tithiName] || ''
    }

    // Extraer actividades específicas para cada elemento
    const nakshatraActivities = extractSpecificActivities(data.nakshatra?.recommendations || '')
    const tithiActivities = extractSpecificActivities(data.tithi?.recommendations || '')
    const varaActivities = extractSpecificActivities(data.vara?.recommendations || '')
    const yogaActivities = extractSpecificActivities(data.yoga?.recommendations || '')

    const prompt = `# DATOS DEL DÍA (INPUT — RELLENAR POR SISTEMA)
Fecha: ${formatDate(date)}
TZ: ${Intl.DateTimeFormat().resolvedOptions().timeZone}

🪐 PAÑCHANGA DETALLADO DEL DÍA

📅 ELEMENTOS BÁSICOS:

🌙 Nakshatra: ${data.nakshatra?.nameIAST || data.nakshatra?.name || 'No disponible'}
  • Actividades favorables: ${nakshatraActivities.favorables.join(', ') || 'No especificadas'}
  • Actividades desfavorables: ${nakshatraActivities.desfavorables.join(', ') || 'No especificadas'}
  • Deidad: ${data.nakshatra?.deity || 'No especificada'}
  • Clasificación: ${data.nakshatra?.classification || 'No especificada'}
  • Recomendaciones completas: ${data.nakshatra?.recommendations || 'Sin recomendaciones específicas'}

🌕 Tithi: ${data.tithi?.nameIAST || data.tithi?.name || 'No disponible'} (${getTithiNumber(data.tithi?.name || '')})
  • Actividades favorables: ${tithiActivities.favorables.join(', ') || 'No especificadas'}
  • Actividades desfavorables: ${tithiActivities.desfavorables.join(', ') || 'No especificadas'}
  • Elemento: ${data.tithi?.element || 'No especificado'}
  • Grupo (si aplica): ${data.tithi?.element || 'No especificado'}
  • Recomendaciones completas: ${data.tithi?.recommendations || 'Sin recomendaciones específicas'}

⚡ Karana: ${data.karana?.nameIAST || data.karana?.name || 'No disponible'}
  • Deidad: ${data.karana?.deity || 'No especificada'}
  • Recomendaciones completas: ${data.karana?.recommendations || 'Sin recomendaciones específicas'}

☀️ Vara: ${data.vara?.translation || data.vara?.name || 'No disponible'} (${data.vara?.name || 'No disponible'})
  • Actividades favorables: ${varaActivities.favorables.join(', ') || 'No especificadas'}
  • Actividades desfavorables: ${varaActivities.desfavorables.join(', ') || 'No especificadas'}
  • Planeta regente: ${data.vara?.planet || 'No especificado'}
  • Recomendaciones completas: ${data.vara?.recommendations || 'Sin recomendaciones específicas'}

🧘 Yoga: ${data.yoga?.nameIAST || data.yoga?.name || 'No disponible'}
  • Actividades favorables: ${yogaActivities.favorables.join(', ') || 'No especificadas'}
  • Actividades desfavorables: ${yogaActivities.desfavorables.join(', ') || 'No especificadas'}
  • Tipo: ${data.yoga?.type || 'No especificado'}
  • Recomendaciones completas: ${data.yoga?.recommendations || 'Sin recomendaciones específicas'}

🌟 YOGAS ESPECIALES (array; repetir bloque por cada yoga)
${data.specialYogas && data.specialYogas.length > 0 
  ? data.specialYogas.map((yoga: any) => {
      const polarity = yoga.polarity === 'positive' ? '🟢' : '🔴'
      const name = yoga.name_sanskrit || yoga.name || 'No disponible'
      const priority = yoga.priority || 'No especificada'
      const type = yoga.type || 'No especificado'
      const description = yoga.detailed_description || 'Sin descripción detallada'
      
      // Condiciones de formación
      const conditions = []
      if (yoga.vara) conditions.push(`Vara (día): ${yoga.vara}`)
      if (yoga.tithi_group) conditions.push(`Grupo de Tithi: ${yoga.tithi_group}`)
      if (yoga.tithi_number) conditions.push(`Número de Tithi: ${yoga.tithi_number}`)
      if (yoga.nakshatra) conditions.push(`Nakshatra: ${yoga.nakshatra}`)
      if (yoga.classification) conditions.push(`Clasificación: ${yoga.classification}`)
      if (yoga.distance_nakshatra) conditions.push(`Distancia por Nakshatra: ${yoga.distance_nakshatra}`)
      if (yoga.sun_longitude && yoga.moon_longitude) {
        conditions.push(`Longitud Solar: ${yoga.sun_longitude.toFixed(2)}°`)
        conditions.push(`Longitud Lunar: ${yoga.moon_longitude.toFixed(2)}°`)
      }
      
      // Actividades beneficiosas
      const beneficial = []
      if (yoga.beneficial) beneficial.push(yoga.beneficial)
      if (yoga.recommended && yoga.recommended.length > 0) beneficial.push(...yoga.recommended)
      if (yoga.beneficial_activities && yoga.beneficial_activities.length > 0) beneficial.push(...yoga.beneficial_activities)
      
      // Actividades a evitar
      const avoid = []
      if (yoga.avoid && yoga.avoid.length > 0) avoid.push(...yoga.avoid)
      if (yoga.avoid_activities && yoga.avoid_activities.length > 0) avoid.push(...yoga.avoid_activities)
      
      return `${polarity} ${name} (Prioridad: ${priority})
  Tipo: ${type}
  💡 Descripción: ${description}
  🔍 Condiciones de Formación:
    ${conditions.map(c => `• ${c}`).join('\n    ')}
  ✅ Actividades Beneficiosas:
    ${beneficial.map(a => `• ${a}`).join('\n    ')}
  ⚠️ Evitar (si aplica):
    ${avoid.map(a => `• ${a}`).join('\n    ')}`
    }).join('\n\n')
  : 'No hay yogas especiales detectados'}

📊 RESUMEN DE ENERGÍAS DEL DÍA:
• Elementos predominantes: ${[data.nakshatra?.classification, data.tithi?.element, data.yoga?.type].filter(Boolean).join(', ') || 'No especificados'}
• Deidades activas: ${[data.nakshatra?.deity, data.karana?.deity].filter(Boolean).join(', ') || 'No especificadas'}
• Planeta regente del día: ${data.vara?.planet || 'No especificado'}
• Yogas especiales activos: ${data.specialYogas?.length || 0}


# REGLAS DE LENGUAJE (OBLIGATORIO — NO IMPRIMIR)
- SALIDA en español natural, **100% legible por TTS**: sin diacríticos raros (usar Panchanga, Nakshatra, Tithi, etc.). **Solo tildes gramaticales español**.
- **No usar** "pada", "sector", "subsector". Traducir internamente "pada" como **etapa** (inicio, construcción, intercambio, cierre) si aplica.
- **Nada de placeholders genéricos** como "actividades relacionadas con la naturaleza de la constelación".
  - Si un campo del input trae genéricos, **sustituir** por recomendaciones **específicas y accionables** derivadas de Nakshatra/Tithi/Karana/Vara/Yoga y de los **Yogas especiales** listados.
- Tono: **cercano, motivador, claro** (latino, más peruano que españolizado). Frases cortas, pausas naturales.
- No listas rígidas: integrar todo en **narrativa fluida** apta para 2–3 minutos (320–450 palabras).

# PRIORIDAD Y FUSIÓN (NO IMPRIMIR)
- Dar **prioridad** a Yogas especiales por orden de "Prioridad" y **sinergizarlos** con Nakshatra/Tithi/Karana/Vara/Yoga.
- Si hay **conflictos** (algún elemento desaconseja algo que un Yoga especial promueve), resolver así:
  1) Prioridad 1 manda; 2) luego Prioridad 2; 3) luego el resto del pañchanga.
  4) Menciona **ajustes**: "haz A, pero evita B", "elige la mañana/tarde", "prepara antes, ejecuta simple".
- **Tiempo**: 90–150 segundos. Enfócate en 1–2 **ventanas fuertes** y 1–2 **precauciones**.

# MOTOR DE MEZCLA (NO IMPRIMIR)
1) **Apertura** (1–2 frases): nombra la fecha (${formatDate(date)}) y da la **idea fuerza** del día (tono + oportunidad principal).
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
Genera un **reporte narrativo de 2–3 minutos** (320–450 palabras) para **${formatDate(date)}**, integrando TODOS los elementos del pañchanga y dando **prioridad a los Yogas especiales** listados. Entrega:
- **Apertura** con idea fuerza del día.
- **Lectura integrada** (Nakshatra, Tithi, Karana, Vara, Yoga) en lenguaje práctico.
- **Yogas especiales**: significado, impacto en decisiones, y actividades concretas recomendadas hoy.
- **Plan del día**: 2–4 acciones concretas y una o dos precauciones con alternativa.
- **Cierre motivador** (1–2 líneas).
- **Cita clásica Vedica**: agrega al final una **cita literal en español** (≤ 25 palabras) que **resuene** con el plan del día, con **atribución** "— Obra, capítulo:verso".
Recuerda: **no uses "pada/sector/subsector"**, evita placeholders, y mantén un tono claro, accesible y accionable.`

    setGeneratedPrompt(prompt)
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt)
    toast.success('Prompt copiado al portapapeles')
  }

  const handleSavePrompt = () => {
    const blob = new Blob([generatedPrompt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `panchanga-prompt-${date}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Prompt guardado como archivo')
  }

  if (!isOpen) return null
  
  // Mostrar loading si no hay datos enriquecidos aún
  if (!enrichedPanchanga) {
    return (
      <div className="mt-6 animate-in slide-in-from-bottom-2 duration-300">
        <Card className="shadow-lg border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando detalles del panchanga...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="mt-6 animate-in slide-in-from-bottom-2 duration-300">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-primary">
                🌙 Pañcāṅga Detallado
              </CardTitle>
              <CardDescription className="text-lg font-medium">
                {formatDate(date)}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-primary"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Nakshatra */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-medium">
                Nakṣatra
              </Badge>
              <h3 className="text-lg font-semibold">
                {enrichedPanchanga.nakshatra?.nameIAST || enrichedPanchanga.nakshatra?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {enrichedPanchanga.nakshatra?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Deidad:</span> {enrichedPanchanga.nakshatra?.deity || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Clasificación:</span> {enrichedPanchanga.nakshatra?.classification || 'No disponible'}
              </p>
              {enrichedPanchanga.nakshatra?.recommendations && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-blue-700">{enrichedPanchanga.nakshatra.recommendations}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Tithi */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-medium">
                Tithi
              </Badge>
              <h3 className="text-lg font-semibold">
                {enrichedPanchanga.tithi?.nameIAST || enrichedPanchanga.tithi?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {enrichedPanchanga.tithi?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Elemento:</span> {enrichedPanchanga.tithi?.element || 'No disponible'}
              </p>
              {enrichedPanchanga.tithi?.recommendations && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-green-700">{enrichedPanchanga.tithi.recommendations}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Karana */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-medium">
                Karaṇa
              </Badge>
              <h3 className="text-lg font-semibold">
                {enrichedPanchanga.karana?.nameIAST || enrichedPanchanga.karana?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {enrichedPanchanga.karana?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Deidad:</span> {enrichedPanchanga.karana?.deity || 'No disponible'}
              </p>
              {enrichedPanchanga.karana?.recommendations && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-purple-700">{enrichedPanchanga.karana.recommendations}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Vara */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-medium">
                Vara
              </Badge>
              <h3 className="text-lg font-semibold">
                {enrichedPanchanga.vara?.nameIAST || enrichedPanchanga.vara?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {enrichedPanchanga.vara?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Planeta regente:</span> {enrichedPanchanga.vara?.planet || 'No disponible'}
              </p>
              {enrichedPanchanga.vara?.recommendations && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-orange-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-orange-700">{enrichedPanchanga.vara.recommendations}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Yoga */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-medium">
                Yoga
              </Badge>
              <h3 className="text-lg font-semibold">
                {enrichedPanchanga.yoga?.nameIAST || enrichedPanchanga.yoga?.name || 'No disponible'}
              </h3>
            </div>
            <div className="ml-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Traducción:</span> {enrichedPanchanga.yoga?.translation || 'No disponible'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Tipo:</span> {enrichedPanchanga.yoga?.type || 'No disponible'}
              </p>
              {enrichedPanchanga.yoga?.recommendations && (
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-indigo-800">💡 Recomendaciones:</p>
                  <p className="text-sm text-indigo-700">{enrichedPanchanga.yoga.recommendations}</p>
                </div>
              )}
            </div>
          </div>

          {/* Yogas Especiales */}
          {enrichedPanchanga.specialYogas && enrichedPanchanga.specialYogas.length > 0 && (
             <>
               <Separator />
               <div className="space-y-3">
                 <div className="flex items-center gap-3">
                   <Badge variant="outline" className="text-sm font-medium">
                     Yogas Especiales
                   </Badge>
                 </div>
                 <div className="ml-4 space-y-4">
                   {enrichedPanchanga.specialYogas.map((yoga: any, index: number) => (
                     <div key={index} className="space-y-2">
                       <h4 className="text-md font-semibold">
                         {yoga.name_sanskrit || yoga.name || 'No disponible'}
                       </h4>
                       <div className="space-y-1">
                         <p className="text-sm text-muted-foreground">
                           <span className="font-medium">Tipo:</span> {yoga.type || 'No disponible'}
                         </p>
                         <p className="text-sm text-muted-foreground">
                           <span className="font-medium">Polaridad:</span> {yoga.polarity || 'No disponible'}
                         </p>
                         {yoga.priority && (
                           <p className="text-sm text-muted-foreground">
                             <span className="font-medium">Prioridad:</span> {yoga.priority}
                           </p>
                         )}
                         
                         {/* Condiciones de Formación */}
                         <div className="bg-slate-50 p-3 rounded-lg mt-2">
                           <p className="text-sm font-medium text-slate-800 mb-2">🔍 Condiciones de Formación:</p>
                           <div className="space-y-1 text-xs text-slate-700">
                             {yoga.vara && (
                               <p><span className="font-medium">Vara (día):</span> {yoga.vara}</p>
                             )}
                             {yoga.tithi_group && (
                               <p><span className="font-medium">Grupo de Tithi:</span> {yoga.tithi_group}</p>
                             )}
                             {yoga.tithi_number && (
                               <p><span className="font-medium">Número de Tithi:</span> {yoga.tithi_number}</p>
                             )}
                             {yoga.nakshatra && (
                               <p><span className="font-medium">Nakshatra:</span> {yoga.nakshatra}</p>
                             )}
                             {yoga.classification && (
                               <p><span className="font-medium">Clasificación:</span> {yoga.classification}</p>
                             )}
                             {yoga.distance_nakshatra && (
                               <p><span className="font-medium">Distancia por Nakshatra:</span> {yoga.distance_nakshatra}</p>
                             )}
                             {yoga.sun_longitude && yoga.moon_longitude && (
                               <div>
                                 <p><span className="font-medium">Longitud Solar:</span> {yoga.sun_longitude.toFixed(2)}°</p>
                                 <p><span className="font-medium">Longitud Lunar:</span> {yoga.moon_longitude.toFixed(2)}°</p>
                               </div>
                             )}
                           </div>
                         </div>
                         {yoga.detailed_description && (
                           <div className={`p-3 rounded-lg ${
                             yoga.polarity === 'positive' ? 'bg-green-50' : 'bg-red-50'
                           }`}>
                             <p className={`text-sm font-medium ${
                               yoga.polarity === 'positive' ? 'text-green-800' : 'text-red-800'
                             }`}>💡 Descripción:</p>
                             <p className={`text-sm ${
                               yoga.polarity === 'positive' ? 'text-green-700' : 'text-red-700'
                             }`}>{yoga.detailed_description}</p>
                           </div>
                         )}
                         {/* Actividades Beneficiosas - usar recommended o beneficial */}
                         {((yoga.recommended && yoga.recommended.length > 0) || yoga.beneficial) && (
                           <div className="bg-blue-50 p-3 rounded-lg">
                             <p className="text-sm font-medium text-blue-800">✅ Actividades Beneficiosas:</p>
                             {yoga.beneficial && (
                               <p className="text-sm text-blue-700 mb-2">{yoga.beneficial}</p>
                             )}
                             {yoga.recommended && yoga.recommended.length > 0 && (
                               <ul className="text-sm text-blue-700 list-disc list-inside">
                                                                   {yoga.recommended.map((activity: any, i: number) => (
                                   <li key={i}>{activity}</li>
                                 ))}
                               </ul>
                             )}
                           </div>
                         )}
                         {/* Actividades a Evitar - usar avoid */}
                         {yoga.avoid && yoga.avoid.length > 0 && (
                           <div className="bg-orange-50 p-3 rounded-lg">
                             <p className="text-sm font-medium text-orange-800">⚠️ Evitar:</p>
                             <ul className="text-sm text-orange-700 list-disc list-inside">
                                                               {yoga.avoid.map((activity: any, i: number) => (
                                 <li key={i}>{activity}</li>
                               ))}
                             </ul>
                           </div>
                         )}
                         {yoga.notes && (
                           <div className="bg-gray-50 p-3 rounded-lg">
                             <p className="text-sm font-medium text-gray-800">📝 Notas:</p>
                             <p className="text-sm text-gray-700">{yoga.notes}</p>
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </>
           )}

          {/* API Recommendations */}
          {loadingApiData && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <h3 className="text-lg font-semibold">Cargando recomendaciones de la API...</h3>
                </div>
              </div>
            </>
          )}

          {apiRecommendations && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Recomendaciones de la API</h3>
                </div>
                
                {/* Recomendaciones Diarias Específicas */}
                {apiRecommendations.daily?.data?.recommendations && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-blue-800 mb-3">📅 Recomendaciones Específicas para {apiRecommendations.daily.data.date}</h4>
                    
                    {/* Vara */}
                    {apiRecommendations.daily.data.recommendations.vara && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-blue-800 mb-2">☀️ Vara (Día de la Semana)</h5>
                        <div className="text-sm text-blue-700 space-y-2">
                          <p><strong>{apiRecommendations.daily.data.recommendations.vara.nombre}</strong> - {apiRecommendations.daily.data.recommendations.vara.planeta}</p>
                          <p className="italic">{apiRecommendations.daily.data.recommendations.vara.descripcion}</p>
                          {apiRecommendations.daily.data.recommendations.vara.actividades_sugeridas && apiRecommendations.daily.data.recommendations.vara.actividades_sugeridas.length > 0 && (
                            <div>
                              <p className="font-medium text-green-700">✅ Actividades recomendadas:</p>
                              <ul className="list-disc list-inside ml-4">
                                {apiRecommendations.daily.data.recommendations.vara.actividades_sugeridas.map((activity: string, index: number) => (
                                  <li key={index}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {apiRecommendations.daily.data.recommendations.vara.evitar && apiRecommendations.daily.data.recommendations.vara.evitar.length > 0 && (
                            <div>
                              <p className="font-medium text-red-700">⚠️ Evitar:</p>
                              <ul className="list-disc list-inside ml-4">
                                {apiRecommendations.daily.data.recommendations.vara.evitar.map((activity: string, index: number) => (
                                  <li key={index}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tithi */}
                    {apiRecommendations.daily.data.recommendations.tithi && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-800 mb-2">🌕 Tithi (Día Lunar)</h5>
                        <div className="text-sm text-green-700 space-y-2">
                          <p><strong>{apiRecommendations.daily.data.recommendations.tithi.nombre}</strong> - Grupo: {apiRecommendations.daily.data.recommendations.tithi.grupo}</p>
                          <p className="italic">{apiRecommendations.daily.data.recommendations.tithi.descripcion}</p>
                          {apiRecommendations.daily.data.recommendations.tithi.actividades_favorables && apiRecommendations.daily.data.recommendations.tithi.actividades_favorables.length > 0 && (
                            <div>
                              <p className="font-medium text-green-700">✅ Actividades favorables:</p>
                              <ul className="list-disc list-inside ml-4">
                                {apiRecommendations.daily.data.recommendations.tithi.actividades_favorables.map((activity: string, index: number) => (
                                  <li key={index}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {apiRecommendations.daily.data.recommendations.tithi.actividades_desfavorables && apiRecommendations.daily.data.recommendations.tithi.actividades_desfavorables.length > 0 && (
                            <div>
                              <p className="font-medium text-red-700">⚠️ Actividades desfavorables:</p>
                              <ul className="list-disc list-inside ml-4">
                                {apiRecommendations.daily.data.recommendations.tithi.actividades_desfavorables.map((activity: string, index: number) => (
                                  <li key={index}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Nakshatra */}
                    {apiRecommendations.daily.data.recommendations.nakshatra && (
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h5 className="font-semibold text-purple-800 mb-2">⭐ Nakshatra (Constelación Lunar)</h5>
                        <div className="text-sm text-purple-700 space-y-2">
                          <p><strong>{apiRecommendations.daily.data.recommendations.nakshatra.nombre}</strong> - Deidad: {apiRecommendations.daily.data.recommendations.nakshatra.deidad}</p>
                          <p className="italic">{apiRecommendations.daily.data.recommendations.nakshatra.descripcion}</p>
                          {apiRecommendations.daily.data.recommendations.nakshatra.favorables && apiRecommendations.daily.data.recommendations.nakshatra.favorables.length > 0 && (
                            <div>
                              <p className="font-medium text-green-700">✅ Actividades favorables:</p>
                              <ul className="list-disc list-inside ml-4">
                                {apiRecommendations.daily.data.recommendations.nakshatra.favorables.map((activity: string, index: number) => (
                                  <li key={index}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {apiRecommendations.daily.data.recommendations.nakshatra.desfavorables && apiRecommendations.daily.data.recommendations.nakshatra.desfavorables.length > 0 && (
                            <div>
                              <p className="font-medium text-red-700">⚠️ Actividades desfavorables:</p>
                              <ul className="list-disc list-inside ml-4">
                                {apiRecommendations.daily.data.recommendations.nakshatra.desfavorables.map((activity: string, index: number) => (
                                  <li key={index}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Nitya Yoga */}
                    {apiRecommendations.daily.data.recommendations.nitya_yoga && (
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h5 className="font-semibold text-orange-800 mb-2">🧘 Nitya Yoga (Yoga Diario)</h5>
                        <div className="text-sm text-orange-700 space-y-2">
                          <p><strong>{apiRecommendations.daily.data.recommendations.nitya_yoga.nombre}</strong></p>
                          <p className="italic">{apiRecommendations.daily.data.recommendations.nitya_yoga.descripcion}</p>
                          {apiRecommendations.daily.data.recommendations.nitya_yoga.actividades_favorables && apiRecommendations.daily.data.recommendations.nitya_yoga.actividades_favorables.length > 0 && (
                            <div>
                              <p className="font-medium text-green-700">✅ Actividades favorables:</p>
                              <ul className="list-disc list-inside ml-4">
                                {apiRecommendations.daily.data.recommendations.nitya_yoga.actividades_favorables.map((activity: string, index: number) => (
                                  <li key={index}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {apiRecommendations.daily.data.recommendations.nitya_yoga.actividades_desfavorables && apiRecommendations.daily.data.recommendations.nitya_yoga.actividades_desfavorables.length > 0 && (
                            <div>
                              <p className="font-medium text-red-700">⚠️ Actividades desfavorables:</p>
                              <ul className="list-disc list-inside ml-4">
                                {apiRecommendations.daily.data.recommendations.nitya_yoga.actividades_desfavorables.map((activity: string, index: number) => (
                                  <li key={index}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Información General de la API */}
                {apiRecommendations.general?.data && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">📊 Base de Datos de Recomendaciones</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-gray-700">Varas</p>
                        <p className="text-2xl font-bold text-blue-600">{apiRecommendations.general.data.varas?.length || 0}</p>
                        <p className="text-xs text-gray-500">días de la semana</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-700">Tithis</p>
                        <p className="text-2xl font-bold text-green-600">{apiRecommendations.general.data.tithis?.length || 0}</p>
                        <p className="text-xs text-gray-500">días lunares</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-700">Nakshatras</p>
                        <p className="text-2xl font-bold text-purple-600">{apiRecommendations.general.data.nakshatras?.length || 0}</p>
                        <p className="text-xs text-gray-500">constelaciones</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-700">Nitya Yogas</p>
                        <p className="text-2xl font-bold text-orange-600">{apiRecommendations.general.data.nitya_yogas?.length || 0}</p>
                        <p className="text-xs text-gray-500">yogas diarios</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* AI Prompt Generator */}
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Generar Reporte Diario con IA</h3>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Prompt generado automáticamente con toda la información del pañcāṅga:
              </p>
              <div className="bg-background p-3 rounded border max-h-60 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono">
                  {generatedPrompt}
                </pre>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCopyPrompt} className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copiar Prompt
              </Button>
              <Button onClick={handleSavePrompt} variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Guardar .txt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PanchangaDetailPanel
