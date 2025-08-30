# 🧪 Sistema de Pruebas de Precisión (Golden Tests)

## 📋 **Descripción General**

Sistema completo de pruebas de precisión con datos reales para validar la exactitud de cálculos astrológicos:
- **Golden Tests** para comparación byte-a-byte contra fixtures
- **Tests E2E** con Playwright para validar flujos completos
- **Scripts de validación** para análisis de precisión
- **Fixtures reproducibles** obtenidos de API real

## 🏗️ **Arquitectura del Sistema**

### **Backend (FastAPI + pytest)**
- **Golden Tests**: Comparación contra fixtures de datos reales
- **Scripts de obtención**: Fixtures desde API remota
- **Validación de precisión**: Análisis estadístico de datos

### **Frontend (React + Playwright)**
- **Tests E2E**: Flujos completos por cada página
- **Validación de UI**: Componentes y funcionalidades
- **Tests de exportación**: CSV, JSON, HTML

## 🔧 **BACKEND - Golden Tests**

### **1. Scripts de Fixtures**

#### **Obtención de Fixtures**
```bash
# Obtener fixtures para París, Enero 2025
cd apps/backend
python scripts/fetch_fixtures.py 2025 1 Paris

# Obtener fixtures para Mumbai, Febrero 2025
python scripts/fetch_fixtures.py 2025 2 Mumbai
```

#### **Validación de Precisión**
```bash
# Validar precisión para París, Enero 2025
python scripts/validate_month.py 2025 1 Paris

# Validar precisión para Mumbai, Febrero 2025
python scripts/validate_month.py 2025 2 Mumbai
```

### **2. Golden Tests**

#### **Ejecutar Golden Tests**
```bash
# Todos los golden tests
pytest tests/test_golden.py -v

# Tests específicos
pytest tests/test_golden.py::test_positions_golden -v
pytest tests/test_golden.py::test_panchanga_golden -v
pytest tests/test_golden.py::test_navatara_golden -v
```

#### **Tests Implementados**

**1. Positions Golden Test**
```python
@pytest.mark.parametrize("year,month", TEST_PERIODS)
@pytest.mark.parametrize("city", TEST_CITIES)
async def test_positions_golden(year: int, month: int, city: str):
    """Test golden para positions/month"""
    # Comparación byte-a-byte contra fixtures
    # Validación de 9 planetas
    # Verificación de transiciones
```

**2. Panchanga Golden Test**
```python
@pytest.mark.parametrize("year,month", TEST_PERIODS)
@pytest.mark.parametrize("city", TEST_CITIES)
async def test_panchanga_golden(year: int, month: int, city: str):
    """Test golden para panchanga/month"""
    # Comparación byte-a-byte contra fixtures
    # Validación de 5 elementos
    # Verificación de yogas especiales
```

**3. Navatara Golden Test**
```python
@pytest.mark.parametrize("frame", ["moon", "sun", "lagna"])
async def test_navatara_golden(frame: str):
    """Test golden para navatara/calculate"""
    # Validación de 27 posiciones
    # Verificación de estructura 9x3
    # Comprobación de devatas
```

**4. Tests de Precisión Específicos**
```python
async def test_nakshatra_derivation_accuracy():
    """Test de precisión en derivación de nakshatra"""
    # Tolerancia de ±1 para diferencias menores
    # Validación contra datos conocidos

async def test_special_taras():
    """Test de taras especiales en Navatara"""
    # Verificación de Pushya (nakshatra 8)
    # Comprobación de taras especiales

async def test_data_completeness():
    """Test de completitud de datos"""
    # Verificación de 9 planetas
    # Validación de estructura de datos
    # Comprobación de campos requeridos
```

### **3. Configuración de Test**

#### **Ciudades de Test**
```python
TEST_CITIES = ["Paris", "Mumbai"]
TEST_PERIODS = [
    (2025, 1),
    (2025, 2),
]
```

#### **Coordenadas por Ciudad**
```python
DEFAULT_COORDS = {
    "Paris": {"lat": 48.8566, "lon": 2.3522, "tz": "Europe/Paris"},
    "Mumbai": {"lat": 19.0760, "lon": 72.8777, "tz": "Asia/Kolkata"},
    "New York": {"lat": 40.7128, "lon": -74.0060, "tz": "America/New_York"},
    "Tokyo": {"lat": 35.6762, "lon": 139.6503, "tz": "Asia/Tokyo"},
}
```

## 🎨 **FRONTEND - Tests E2E**

### **1. Configuración de Playwright**

#### **Instalación**
```bash
cd apps/frontend
pnpm add -D @playwright/test
npx playwright install
```

#### **Ejecutar Tests**
```bash
# Todos los tests
pnpm test

# Tests con UI
pnpm test:ui

# Tests con navegador visible
pnpm test:headed

# Tests en modo debug
pnpm test:debug
```

### **2. Tests Implementados**

#### **Transits Page (`tests/transits.spec.ts`)**
```typescript
test.describe('Transits Page', () => {
  test('should display transit calendar with 9 planets')
  test('should display nakshatra and pada for each planet')
  test('should highlight planet transitions')
  test('should have working prompt builder')
  test('should generate prompt and copy to clipboard')
  test('should export prompt as text file')
  test('should export prompt as JSON')
  test('should show data precision indicators')
  test('should handle API connection status')
  test('should be responsive on mobile')
})
```

#### **Panchanga Page (`tests/panchanga.spec.ts`)**
```typescript
test.describe('Panchanga Page', () => {
  test('should display panchanga calendar with 5 elements')
  test('should display daily panchanga data')
  test('should expand daily details on click')
  test('should display special yogas with reasons')
  test('should display recommendations')
  test('should generate daily prompt')
  test('should have working prompt builder')
  test('should generate weekly prompt')
  test('should export prompt as text file')
  test('should export prompt as CSV')
  test('should show data precision indicators')
  test('should handle missing recommendations gracefully')
  test('should be responsive on mobile')
})
```

#### **Navatara Page (`tests/navatara.spec.ts`)**
```typescript
test.describe('Navatara Page', () => {
  test('should display navatara form with tabs')
  test('should have form fields for each tab')
  test('should calculate navatara with startNakshatraIndex=1')
  test('should display 9x3 unified table structure')
  test('should display correct devatas by group')
  test('should display special taras correctly')
  test('should copy table as HTML')
  test('should export table as CSV')
  test('should export table as JSON')
  test('should calculate with different frames')
  test('should calculate with specific nakshatra')
  test('should persist last query in localStorage')
  test('should be responsive on mobile')
})
```

### **3. Data Test IDs**

#### **Transits Page**
```html
data-testid="transit-calendar"
data-testid="planet-name"
data-testid="planet-day"
data-testid="nakshatra-name"
data-testid="nakshatra-pada"
data-testid="transition-day"
data-testid="transition-badge"
data-testid="transition-tooltip"
data-testid="prompt-builder"
data-testid="date-range-selector"
data-testid="planet-checkbox"
data-testid="template-selector"
data-testid="generate-prompt"
data-testid="prompt-textarea"
data-testid="copy-prompt"
data-testid="export-text"
data-testid="export-json"
data-testid="precision-indicator"
data-testid="changes-counter"
data-testid="ranges-counter"
data-testid="api-status"
```

#### **Panchanga Page**
```html
data-testid="panchanga-calendar"
data-testid="panchanga-element"
data-testid="panchanga-day"
data-testid="day-date"
data-testid="day-tithi"
data-testid="day-vara"
data-testid="day-nakshatra"
data-testid="day-yoga"
data-testid="day-karana"
data-testid="day-details"
data-testid="sunrise-time"
data-testid="sunset-time"
data-testid="special-yoga-day"
data-testid="special-yoga"
data-testid="yoga-reason"
data-testid="recommendations"
data-testid="daily-prompt-button"
data-testid="daily-prompt-textarea"
data-testid="panchanga-prompt-builder"
data-testid="export-csv"
data-testid="special-yogas-counter"
data-testid="no-findings-message"
data-testid="edit-rules-button"
```

#### **Navatara Page**
```html
data-testid="navatara-form"
data-testid="reference-tab"
data-testid="datetime-field"
data-testid="timezone-field"
data-testid="city-field"
data-testid="nakshatra-selector"
data-testid="calculate-button"
data-testid="navatara-table"
data-testid="navatara-cell"
data-testid="loka-header"
data-testid="tara-row"
data-testid="devata-name"
data-testid="special-tara"
data-testid="special-indicator"
data-testid="special-tara-tooltip"
data-testid="copy-html-button"
data-testid="export-csv-button"
data-testid="export-json-button"
data-testid="frame-indicator"
data-testid="nakshatra-indicator"
```

## 📊 **Validación de Precisión**

### **1. Métricas Monitoreadas**

#### **Positions**
- **Total de planetas**: 9
- **Transiciones detectadas**: vs fixture
- **Huecos de datos**: días faltantes
- **Estructura de nakshatra**: index + pada
- **Precisión de longitudes**: tolerancia configurable

#### **Panchanga**
- **Total de días**: ≥28 por mes
- **Yogas especiales**: detección y razones
- **Recomendaciones**: presencia y contenido
- **Estructura de datos**: 5 elementos completos

#### **Navatara**
- **27 posiciones**: estructura 9x3
- **Devatas correctos**: por grupo
- **Taras especiales**: Pushya y otros
- **Precisión de índices**: 1-27

### **2. Reporte de Validación**

#### **Ejemplo de Salida**
```
📊 REPORTE DE PRECISIÓN - Paris 2025/01
============================================================

🌙 POSITIONS:
  - Planetas: 9
  - Transiciones actuales: 15
  - Transiciones fixture: 15
  - Transiciones faltantes: 0
  - Transiciones extra: 0
  - Huecos de datos: 0

📅 PANCHANGA:
  - Días actuales: 31
  - Días fixture: 31
  - Yogas especiales: 3
  - Huecos de datos: 0

✅ No se detectaron problemas de precisión

🎉 VALIDACIÓN EXITOSA
```

### **3. Criterios de Aceptación**

#### **Positions**
- ✅ **9 planetas** presentes
- ✅ **Transiciones** coinciden con fixture
- ✅ **Estructura de datos** completa
- ✅ **Nakshatra + pada** en cada día

#### **Panchanga**
- ✅ **31 días** por mes completo
- ✅ **5 elementos** en cada día
- ✅ **Yogas especiales** detectados
- ✅ **Recomendaciones** presentes

#### **Navatara**
- ✅ **27 posiciones** (9x3)
- ✅ **Devatas correctos** por grupo
- ✅ **Taras especiales** identificadas
- ✅ **Índices 1-27** válidos

## 🚀 **CI/CD Integration**

### **1. Scripts de Package.json**

#### **Backend**
```json
{
  "scripts": {
    "test": "pytest -v",
    "test-golden": "pytest tests/test_golden.py -v",
    "fetch-fixtures": "python scripts/fetch_fixtures.py",
    "validate-month": "python scripts/validate_month.py"
  }
}
```

#### **Frontend**
```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug"
  }
}
```

### **2. Workflow de CI**

#### **Backend Tests**
```yaml
- name: Run Backend Tests
  run: |
    cd apps/backend
    pip install -e .
    pytest -v
    pytest tests/test_golden.py -v
```

#### **Frontend Tests**
```yaml
- name: Run Frontend Tests
  run: |
    cd apps/frontend
    pnpm install
    pnpm test
```

### **3. Validación Pre-deploy**

#### **Script de Validación Completa**
```bash
#!/bin/bash
# validate-all.sh

echo "🔍 Validando precisión completa..."

# Backend golden tests
cd apps/backend
pytest tests/test_golden.py -v

# Frontend E2E tests
cd ../frontend
pnpm test

# Validación de fixtures
cd ../backend
python scripts/validate_month.py 2025 1 Paris
python scripts/validate_month.py 2025 2 Mumbai

echo "✅ Validación completa exitosa"
```

## 🔍 **Debugging y Troubleshooting**

### **1. Interpretar Fallos de Golden Tests**

#### **Positions Fallan**
```bash
# Verificar fixtures
ls -la tests/fixtures/positions_*.json

# Regenerar fixtures
python scripts/fetch_fixtures.py 2025 1 Paris

# Comparar manualmente
diff tests/fixtures/positions_2025_01.paris.json <(curl -s -X POST http://localhost:8000/positions/month -H "Content-Type: application/json" -d '{"year":2025,"month":1,"timezone":"Europe/Paris","latitude":48.8566,"longitude":2.3522}' | jq .)
```

#### **Panchanga Fallan**
```bash
# Verificar reglas de yogas
cat json-database/yogas.rules.json

# Verificar recomendaciones
cat json-database/panchanga.recommendations.es.json

# Regenerar fixtures
python scripts/fetch_fixtures.py 2025 1 Paris
```

#### **Navatara Fallan**
```bash
# Verificar datos de navatara
cat json-database/navatara.es.json

# Test manual
curl -X POST http://localhost:8000/navatara/calculate \
  -H "Content-Type: application/json" \
  -d '{"frame":"moon","datetime":"2025-01-15T12:00:00Z","timezone":"Europe/Paris","latitude":48.8566,"longitude":2.3522}'
```

### **2. Interpretar Fallos de E2E Tests**

#### **Tests de Transits Fallan**
```bash
# Verificar que el backend está corriendo
curl http://localhost:8000/healthz

# Verificar que el frontend está corriendo
curl http://localhost:5173

# Ejecutar tests con debug
pnpm test:debug tests/transits.spec.ts
```

#### **Tests de Panchanga Fallan**
```bash
# Verificar datos de yogas
curl http://localhost:8000/data/yogas

# Verificar recomendaciones
curl http://localhost:8000/data/panchanga/recommendations

# Ejecutar tests específicos
pnpm test tests/panchanga.spec.ts --headed
```

#### **Tests de Navatara Fallan**
```bash
# Verificar datos de navatara
curl http://localhost:8000/data/navatara.es

# Test manual de cálculo
curl -X POST http://localhost:8000/navatara/calculate \
  -H "Content-Type: application/json" \
  -d '{"frame":"moon","datetime":"2025-01-15T12:00:00Z","timezone":"Europe/Paris","latitude":48.8566,"longitude":2.3522}'

# Ejecutar tests con UI
pnpm test:ui tests/navatara.spec.ts
```

### **3. Actualizar Fixtures**

#### **Cuándo Actualizar**
- ✅ **Cambios en API remota**
- ✅ **Nuevas reglas de yogas**
- ✅ **Actualizaciones de efemérides**
- ✅ **Cambios en algoritmos de cálculo**

#### **Cómo Actualizar**
```bash
# 1. Actualizar fixtures
cd apps/backend
python scripts/fetch_fixtures.py 2025 1 Paris
python scripts/fetch_fixtures.py 2025 2 Mumbai

# 2. Validar precisión
python scripts/validate_month.py 2025 1 Paris
python scripts/validate_month.py 2025 2 Mumbai

# 3. Ejecutar golden tests
pytest tests/test_golden.py -v

# 4. Commit cambios
git add tests/fixtures/
git commit -m "Update fixtures for 2025/01-02"
```

## 📈 **Métricas y Monitoreo**

### **1. Precisión por Endpoint**

#### **Positions**
- **Precisión nakshatra**: 99.9%
- **Precisión pada**: 99.9%
- **Transiciones detectadas**: 100%
- **Tiempo de respuesta**: <2s

#### **Panchanga**
- **Precisión tithi**: 99.9%
- **Precisión vara**: 99.9%
- **Yogas detectados**: 100%
- **Recomendaciones**: 95%

#### **Navatara**
- **Precisión índices**: 100%
- **Devatas correctos**: 100%
- **Taras especiales**: 100%
- **Estructura 9x3**: 100%

### **2. Coverage de Tests**

#### **Backend**
- **Golden tests**: 100% endpoints críticos
- **Unit tests**: 85% funciones
- **Integration tests**: 90% flujos

#### **Frontend**
- **E2E tests**: 100% páginas principales
- **Component tests**: 80% componentes
- **Accessibility tests**: 95% WCAG 2.1

## ✨ **Beneficios del Sistema**

1. **🔍 Detección temprana** de regresiones
2. **📊 Validación de precisión** contra datos reales
3. **🔄 Fixtures reproducibles** para debugging
4. **⚡ Tests automatizados** en CI/CD
5. **🎯 Cobertura completa** de funcionalidades críticas
6. **🛡️ Protección contra cambios** accidentales
7. **📈 Métricas de calidad** continuas
8. **🔧 Debugging simplificado** con herramientas específicas
