// Funciones para hacer coincidencias inteligentes de nombres con caracteres especiales

// Función para normalizar nombres eliminando caracteres especiales
export const normalizeName = (name: string): string => {
  if (!name) return ''
  
  return name
    .toLowerCase()
    .replace(/[āáàäâ]/g, 'a')
    .replace(/[īíìïî]/g, 'i')
    .replace(/[ūúùüû]/g, 'u')
    .replace(/[ēéèëê]/g, 'e')
    .replace(/[ōóòöô]/g, 'o')
    .replace(/[ṛṝ]/g, 'r')
    .replace(/[ḷḹ]/g, 'l')
    .replace(/[ṃ]/g, 'm')
    .replace(/[ḥ]/g, 'h')
    .replace(/[ś]/g, 's')
    .replace(/[ṣ]/g, 's')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9\s]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim()
}

// Función para hacer coincidencias inteligentes
export const findBestMatch = <T extends { name: string; nameIAST?: string }>(
  items: T[],
  searchName: string
): T | undefined => {
  if (!searchName || !items.length) return undefined

  const normalizedSearch = normalizeName(searchName)
  
  // 1. Coincidencia exacta
  let match = items.find(item => 
    item.name === searchName || 
    item.nameIAST === searchName ||
    item.name.toLowerCase() === searchName.toLowerCase() ||
    item.nameIAST?.toLowerCase() === searchName.toLowerCase()
  )
  
  if (match) return match

  // 2. Coincidencia normalizada exacta
  match = items.find(item => 
    normalizeName(item.name) === normalizedSearch ||
    normalizeName(item.nameIAST || '') === normalizedSearch
  )
  
  if (match) return match

  // 3. Coincidencia parcial (contiene)
  match = items.find(item => 
    normalizeName(item.name).includes(normalizedSearch) ||
    normalizedSearch.includes(normalizeName(item.name)) ||
    normalizeName(item.nameIAST || '').includes(normalizedSearch) ||
    normalizedSearch.includes(normalizeName(item.nameIAST || ''))
  )
  
  if (match) return match

  // 4. Coincidencia por palabras clave
  const searchWords = normalizedSearch.split(' ').filter(w => w.length > 2)
  if (searchWords.length > 0) {
    match = items.find(item => {
      const itemWords = normalizeName(item.name).split(' ').filter(w => w.length > 2)
      const iastWords = normalizeName(item.nameIAST || '').split(' ').filter(w => w.length > 2)
      
      return searchWords.some(searchWord => 
        itemWords.some(itemWord => 
          itemWord.includes(searchWord) || searchWord.includes(itemWord)
        ) ||
        iastWords.some(iastWord => 
          iastWord.includes(searchWord) || searchWord.includes(iastWord)
        )
      )
    })
  }
  
  return match
}

// Mapeo específico para nombres comunes que no coinciden
export const nameMappings: Record<string, string> = {
  // Nakshatras
  'Ashwini': 'Aśvinī',
  'Bharani': 'Bharaṇī',
  'Krittika': 'Kṛttikā',
  'Rohini': 'Rohiṇī',
  'Mrigashira': 'Mṛgaśirā',
  'Ardra': 'Ārdrā',
  'Pushya': 'Puṣya',
  'Ashlesha': 'Āśleṣā',
  'Magha': 'Maghā',
  'Purva Phalguni': 'Pūrvaphalgunī',
  'Uttara Phalguni': 'Uttaraphalgunī',
  'Chitra': 'Citrā',
  'Swati': 'Svātī',
  'Vishakha': 'Viśākhā',
  'Anuradha': 'Anurādhā',
  'Jyeshtha': 'Jyeṣṭhā',
  'Mula': 'Mūla',
  'Purva Ashadha': 'Pūrvāṣāḍhā',
  'Uttara Ashadha': 'Uttarāṣāḍhā',
  'Shravana': 'Śravaṇa',
  'Dhanishtha': 'Dhaniṣṭhā',
  'Shatabhisha': 'Śatabhiṣā',
  'Purva Bhadrapada': 'Pūrvabhādrapadā',
  'Uttara Bhadrapada': 'Uttarabhādrapadā',
  'Revati': 'Revatī',
  
  // Tithis
  'Pratipada': 'Pratipada',
  'Dvitiya': 'Dvitiya',
  'Tritiya': 'Tritiya',
  'Chaturthi': 'Chaturthi',
  'Panchami': 'Panchami',
  'Shashthi': 'Shashthi',
  'Saptami': 'Saptami',
  'Ashtami': 'Ashtami',
  'Navami': 'Navami',
  'Dashami': 'Dashami',
  'Ekadashi': 'Ekadashi',
  'Dwadashi': 'Dwadashi',
  'Trayodashi': 'Trayodashi',
  'Chaturdashi': 'Chaturdashi',
  'Purnima': 'Purnima',
  'Amavasya': 'Amavasya',
  
  // Varas
  'Sunday': 'Ravivara',
  'Monday': 'Somavara',
  'Tuesday': 'Mangalavara',
  'Wednesday': 'Budhavara',
  'Thursday': 'Guruvara',
  'Friday': 'Shukravara',
  'Saturday': 'Shanivara',
  'Ravi': 'Ravivara',
  'Soma': 'Somavara',
  'Mangala': 'Mangalavara',
  'Budha': 'Budhavara',
  'Guru': 'Guruvara',
  'Shukra': 'Shukravara',
  'Shani': 'Shanivara',
  
  // Yogas
  'Vishkumbha': 'Vishkumbha',
  'Priti': 'Priti',
  'Ayushman': 'Ayushman',
  'Saubhagya': 'Saubhagya',
  'Shobhana': 'Shobhana',
  'Atiganda': 'Atiganda',
  'Sukarma': 'Sukarma',
  'Dhriti': 'Dhriti',
  'Shula': 'Shula',
  'Ganda': 'Ganda',
  'Vriddhi': 'Vriddhi',
  'Dhruva': 'Dhruva',
  'Vyaghata': 'Vyaghata',
  'Harshana': 'Harshana',
  'Vajra': 'Vajra',
  'Siddhi': 'Siddhi',
  'Vyatipata': 'Vyatipata',
  'Variyan': 'Variyan',
  'Parigha': 'Parigha',
  'Shiva': 'Shiva',
  'Siddha': 'Siddha',
  'Sadhya': 'Sadhya',
  'Shubha': 'Shubha',
  'Shukla': 'Shukla',
  'Brahma': 'Brahma',
  'Indra': 'Indra',
  'Vaidhriti': 'Vaidhriti'
}

// Función para obtener el nombre mapeado
export const getMappedName = (name: string): string => {
  return nameMappings[name] || name
}
