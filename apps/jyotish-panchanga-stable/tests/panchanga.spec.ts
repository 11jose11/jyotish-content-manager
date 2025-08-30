import { test, expect } from '@playwright/test';

test.describe('Panchanga Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/panchanga');
  });

  test('should display panchanga calendar with 5 elements', async ({ page }) => {
    // Esperar a que cargue la página
    await page.waitForSelector('[data-testid="panchanga-calendar"]', { timeout: 10000 });
    
    // Verificar que hay 5 elementos del panchanga
    const panchangaElements = await page.locator('[data-testid="panchanga-element"]').all();
    expect(panchangaElements.length).toBeGreaterThan(0);
    
    // Verificar que se muestran los 5 elementos principales
    const elementTypes = ['tithi', 'vara', 'nakshatra', 'yoga', 'karana'];
    for (const type of elementTypes) {
      const element = page.locator(`[data-testid="panchanga-${type}"]`);
      expect(await element.isVisible()).toBeTruthy();
    }
  });

  test('should display daily panchanga data', async ({ page }) => {
    await page.waitForSelector('[data-testid="panchanga-day"]', { timeout: 10000 });
    
    // Verificar que hay días en el calendario
    const days = await page.locator('[data-testid="panchanga-day"]').all();
    expect(days.length).toBeGreaterThan(0);
    
    // Verificar estructura de cada día
    for (const day of days) {
      // Verificar fecha
      const dateElement = await day.locator('[data-testid="day-date"]').first();
      expect(await dateElement.isVisible()).toBeTruthy();
      
      // Verificar elementos del panchanga
      const tithiElement = await day.locator('[data-testid="day-tithi"]').first();
      const varaElement = await day.locator('[data-testid="day-vara"]').first();
      const nakshatraElement = await day.locator('[data-testid="day-nakshatra"]').first();
      const yogaElement = await day.locator('[data-testid="day-yoga"]').first();
      const karanaElement = await day.locator('[data-testid="day-karana"]').first();
      
      expect(await tithiElement.isVisible()).toBeTruthy();
      expect(await varaElement.isVisible()).toBeTruthy();
      expect(await nakshatraElement.isVisible()).toBeTruthy();
      expect(await yogaElement.isVisible()).toBeTruthy();
      expect(await karanaElement.isVisible()).toBeTruthy();
    }
  });

  test('should expand daily details on click', async ({ page }) => {
    await page.waitForSelector('[data-testid="panchanga-day"]', { timeout: 10000 });
    
    // Hacer click en el primer día
    const firstDay = page.locator('[data-testid="panchanga-day"]').first();
    await firstDay.click();
    
    // Verificar que se expanden los detalles
    const expandedDetails = page.locator('[data-testid="day-details"]');
    await expect(expandedDetails).toBeVisible();
    
    // Verificar que se muestran datos completos
    const sunriseElement = page.locator('[data-testid="sunrise-time"]');
    const sunsetElement = page.locator('[data-testid="sunset-time"]');
    
    expect(await sunriseElement.isVisible()).toBeTruthy();
    expect(await sunsetElement.isVisible()).toBeTruthy();
  });

  test('should display special yogas with reasons', async ({ page }) => {
    await page.waitForSelector('[data-testid="panchanga-day"]', { timeout: 10000 });
    
    // Buscar días con yogas especiales
    const specialYogaDays = await page.locator('[data-testid="special-yoga-day"]').all();
    
    if (specialYogaDays.length > 0) {
      // Hacer click en un día con yoga especial
      await specialYogaDays[0].click();
      
      // Verificar que se muestran los yogas especiales
      const specialYogas = page.locator('[data-testid="special-yoga"]');
      expect(await specialYogas.isVisible()).toBeTruthy();
      
      // Verificar que se muestra la razón
      const yogaReason = page.locator('[data-testid="yoga-reason"]');
      expect(await yogaReason.isVisible()).toBeTruthy();
      
      const reasonText = await yogaReason.textContent();
      expect(reasonText).toBeTruthy();
      expect(reasonText.length).toBeGreaterThan(10);
    }
  });

  test('should display recommendations', async ({ page }) => {
    await page.waitForSelector('[data-testid="panchanga-day"]', { timeout: 10000 });
    
    // Hacer click en un día para expandir
    const firstDay = page.locator('[data-testid="panchanga-day"]').first();
    await firstDay.click();
    
    // Verificar que se muestran recomendaciones
    const recommendations = page.locator('[data-testid="recommendations"]');
    
    // Las recomendaciones pueden no estar presentes en todos los días
    if (await recommendations.isVisible()) {
      const recommendationText = await recommendations.textContent();
      expect(recommendationText).toBeTruthy();
      expect(recommendationText.length).toBeGreaterThan(10);
    }
  });

  test('should generate daily prompt', async ({ page }) => {
    await page.waitForSelector('[data-testid="panchanga-day"]', { timeout: 10000 });
    
    // Hacer click en un día para expandir
    const firstDay = page.locator('[data-testid="panchanga-day"]').first();
    await firstDay.click();
    
    // Verificar botón de prompt diario
    const dailyPromptButton = page.locator('[data-testid="daily-prompt-button"]');
    expect(await dailyPromptButton.isVisible()).toBeTruthy();
    
    // Generar prompt
    await dailyPromptButton.click();
    
    // Verificar que se generó el prompt
    const promptTextarea = page.locator('[data-testid="daily-prompt-textarea"]');
    await expect(promptTextarea).toBeVisible();
    
    const promptText = await promptTextarea.inputValue();
    expect(promptText).toBeTruthy();
    expect(promptText).toContain('REPORTE DIARIO');
    expect(promptText).toContain('Tithi:');
    expect(promptText).toContain('Vara:');
    expect(promptText).toContain('Nakṣatra:');
  });

  test('should have working prompt builder', async ({ page }) => {
    await page.waitForSelector('[data-testid="panchanga-prompt-builder"]', { timeout: 10000 });
    
    // Verificar que el builder está presente
    const builder = page.locator('[data-testid="panchanga-prompt-builder"]');
    expect(await builder.isVisible()).toBeTruthy();
    
    // Verificar selector de rango de fechas
    const dateRangeSelector = page.locator('[data-testid="date-range-selector"]');
    expect(await dateRangeSelector.isVisible()).toBeTruthy();
    
    // Verificar selector de plantilla
    const templateSelector = page.locator('[data-testid="template-selector"]');
    expect(await templateSelector.isVisible()).toBeTruthy();
  });

  test('should generate weekly prompt', async ({ page }) => {
    await page.waitForSelector('[data-testid="panchanga-prompt-builder"]', { timeout: 10000 });
    
    // Seleccionar plantilla semanal
    const templateSelector = page.locator('[data-testid="template-selector"]');
    await templateSelector.click();
    await page.locator('text=Semanal').click();
    
    // Generar prompt
    const generateButton = page.locator('[data-testid="generate-prompt"]');
    await generateButton.click();
    
    // Verificar que se generó el prompt
    const promptTextarea = page.locator('[data-testid="prompt-textarea"]');
    await expect(promptTextarea).toBeVisible();
    
    const promptText = await promptTextarea.inputValue();
    expect(promptText).toBeTruthy();
    expect(promptText).toContain('REPORTE SEMANAL');
  });

  test('should export prompt as text file', async ({ page }) => {
    await page.waitForSelector('[data-testid="panchanga-prompt-builder"]', { timeout: 10000 });
    
    // Generar un prompt básico
    const generateButton = page.locator('[data-testid="generate-prompt"]');
    await generateButton.click();
    
    // Probar exportación como texto
    const exportTextButton = page.locator('[data-testid="export-text"]');
    
    // Interceptar la descarga
    const downloadPromise = page.waitForEvent('download');
    await exportTextButton.click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/panchanga-prompt-.*\.txt$/);
  });

  test('should export prompt as CSV', async ({ page }) => {
    await page.waitForSelector('[data-testid="panchanga-prompt-builder"]', { timeout: 10000 });
    
    // Generar un prompt básico
    const generateButton = page.locator('[data-testid="generate-prompt"]');
    await generateButton.click();
    
    // Probar exportación como CSV
    const exportCsvButton = page.locator('[data-testid="export-csv"]');
    
    // Interceptar la descarga
    const downloadPromise = page.waitForEvent('download');
    await exportCsvButton.click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/panchanga-data-.*\.csv$/);
  });

  test('should show data precision indicators', async ({ page }) => {
    await page.waitForSelector('[data-testid="precision-indicator"]', { timeout: 10000 });
    
    // Verificar indicadores de precisión
    const precisionIndicator = page.locator('[data-testid="precision-indicator"]');
    expect(await precisionIndicator.isVisible()).toBeTruthy();
    
    // Verificar contador de yogas especiales
    const specialYogasCounter = page.locator('[data-testid="special-yogas-counter"]');
    expect(await specialYogasCounter.isVisible()).toBeTruthy();
  });

  test('should handle missing recommendations gracefully', async ({ page }) => {
    await page.waitForSelector('[data-testid="panchanga-day"]', { timeout: 10000 });
    
    // Buscar mensaje de "Sin hallazgos"
    const noFindingsMessage = page.locator('[data-testid="no-findings-message"]');
    
    // Si no hay recomendaciones, debería mostrar mensaje
    if (await noFindingsMessage.isVisible()) {
      const messageText = await noFindingsMessage.textContent();
      expect(messageText).toContain('Sin hallazgos');
      
      // Verificar CTA para editar reglas
      const editRulesButton = page.locator('[data-testid="edit-rules-button"]');
      expect(await editRulesButton.isVisible()).toBeTruthy();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Cambiar a vista móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.waitForSelector('[data-testid="panchanga-calendar"]', { timeout: 10000 });
    
    // Verificar que el calendario se adapta
    const calendar = page.locator('[data-testid="panchanga-calendar"]');
    expect(await calendar.isVisible()).toBeTruthy();
    
    // Verificar que los detalles se expanden correctamente
    const firstDay = page.locator('[data-testid="panchanga-day"]').first();
    await firstDay.click();
    
    const expandedDetails = page.locator('[data-testid="day-details"]');
    expect(await expandedDetails.isVisible()).toBeTruthy();
  });
});
