// Servicio para generar datos de panchanga localmente usando JSON
import { getNakshatraDetails, getTithiDetails, getKaranaDetails, getVaraDetails, getYogaDetails } from './panchangaData'

// Función para calcular el día de la semana
const getDayOfWeek = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[date.getDay()]
}

// Función para calcular tithi básico (simplificado)
const calculateTithi = (dayOfMonth: number): string => {
  const tithis = [
    'Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
    'Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
  ]
  return tithis[(dayOfMonth - 1) % 30]
}

// Función para calcular nakshatra básico (simplificado)
const calculateNakshatra = (dayOfMonth: number): string => {
  const nakshatras = [
    'Aśvinī', 'Bharaṇī', 'Kṛttikā', 'Rohiṇī', 'Mṛgaśirā',
    'Ārdrā', 'Punarvasu', 'Puṣya', 'Āśleṣā', 'Maghā',
    'Pūrvaphalgunī', 'Uttaraphalgunī', 'Hasta', 'Citrā', 'Svātī',
    'Viśākhā', 'Anurādhā', 'Jyeṣṭhā', 'Mūla', 'Pūrvāṣāḍhā',
    'Uttarāṣāḍhā', 'Śravaṇa', 'Dhaniṣṭhā', 'Śatabhiṣā', 'Pūrvabhādrapadā',
    'Uttarabhādrapadā', 'Revatī'
  ]
  return nakshatras[(dayOfMonth - 1) % 27]
}

// Función para calcular yoga básico (simplificado)
const calculateYoga = (dayOfMonth: number): string => {
  const yogas = [
    'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
    'Atiganda', 'Sukarman', 'Dhriti', 'Shula', 'Ganda',
    'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
    'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
    'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
    'Indra', 'Vaidhriti'
  ]
  return yogas[(dayOfMonth - 1) % 27]
}

// Función para calcular karana básico (simplificado)
const calculateKarana = (dayOfMonth: number): string => {
  const karanas = [
    'Bava', 'Balava', 'Kaulava', 'Taitila', 'Garija',
    'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga'
  ]
  return karanas[(dayOfMonth - 1) % 10]
}

// Función principal para generar datos de panchanga localmente
export const generateLocalPanchangaMonth = async (year: number, month: number): Promise<any> => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const allDays: any[] = []
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    const date = new Date(dateStr)
    
    // Calcular elementos básicos del panchanga
    const tithiName = calculateTithi(day)
    const nakshatraName = calculateNakshatra(day)
    const yogaName = calculateYoga(day)
    const karanaName = calculateKarana(day)
    const varaName = getDayOfWeek(date)
    
    // Crear objeto del día
    const dayData = {
      date: dateStr,
      tithi: {
        name: tithiName,
        index: ((day - 1) % 30) + 1
      },
      vara: {
        name: varaName
      },
      nakshatra: {
        name: nakshatraName,
        pada: ((day - 1) % 4) + 1
      },
      yoga: {
        name: yogaName
      },
      karana: {
        name: karanaName
      },
      specialYogas: []
    }
    
    allDays.push(dayData)
  }
  
  return { days: allDays }
}

// Función para enriquecer datos con información de JSON
export const enrichPanchangaData = async (panchangaData: any) => {
  const enrichedDays = []
  
  for (const day of panchangaData.days) {
    try {
      // Cargar detalles desde JSON
      const [nakshatraDetails, tithiDetails, karanaDetails, varaDetails, yogaDetails] = await Promise.all([
        getNakshatraDetails(day.nakshatra.name),
        getTithiDetails(day.tithi.name),
        getKaranaDetails(day.karana.name),
        getVaraDetails(day.vara.name),
        getYogaDetails(day.yoga.name)
      ])
      
      // Enriquecer el día con detalles
      const enrichedDay = {
        ...day,
        details: {
          nakshatra: nakshatraDetails,
          tithi: tithiDetails,
          karana: karanaDetails,
          vara: varaDetails,
          yoga: yogaDetails,
          specialYogas: []
        }
      }
      
      enrichedDays.push(enrichedDay)
    } catch (error) {
      console.warn(`Could not enrich data for ${day.date}:`, error)
      enrichedDays.push(day)
    }
  }
  
  return { days: enrichedDays }
}
