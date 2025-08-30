import { test, expect } from '@playwright/test';

test.describe('Transits Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transits');
  });

  test('should display transit calendar with 9 planets', async ({ page }) => {
    // Esperar a que cargue la página
    await page.waitForSelector('[data-testid="transit-calendar"]', { timeout: 10000 });
    
    // Verificar que hay 9 planetas
    const planetElements = await page.locator('[data-testid="planet-name"]').all();
    expect(planetElements).toHaveLength(9);
    
    // Verificar nombres de planetas
    const planetNames = await Promise.all(
      planetElements.map(el => el.textContent())
    );
    
    const expectedPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    for (const planet of expectedPlanets) {
      expect(planetNames).toContain(planet);
    }
  });

  test('should display nakshatra and pada for each planet', async ({ page }) => {
    await page.waitForSelector('[data-testid="planet-day"]', { timeout: 10000 });
    
    // Verificar que cada día tiene nakshatra y pada
    const planetDays = await page.locator('[data-testid="planet-day"]').all();
    expect(planetDays.length).toBeGreaterThan(0);
    
    for (const day of planetDays) {
      const nakshatraElement = await day.locator('[data-testid="nakshatra-name"]').first();
      const padaElement = await day.locator('[data-testid="nakshatra-pada"]').first();
      
      expect(await nakshatraElement.isVisible()).toBeTruthy();
      expect(await padaElement.isVisible()).toBeTruthy();
      
      const nakshatraText = await nakshatraElement.textContent();
      const padaText = await padaElement.textContent();
      
      expect(nakshatraText).toBeTruthy();
      expect(padaText).toMatch(/p[1-4]/); // Formato: p1, p2, p3, p4
    }
  });

  test('should highlight planet transitions', async ({ page }) => {
    await page.waitForSelector('[data-testid="planet-day"]', { timeout: 10000 });
    
    // Buscar días con transiciones (deberían tener badge o borde especial)
    const transitionDays = await page.locator('[data-testid="transition-day"]').all();
    
    // Si hay transiciones, verificar que están resaltadas
    if (transitionDays.length > 0) {
      for (const day of transitionDays) {
        // Verificar que tiene indicador visual de transición
        const badge = await day.locator('[data-testid="transition-badge"]').first();
        expect(await badge.isVisible()).toBeTruthy();
        
        // Verificar tooltip con información de transición
        await day.hover();
        const tooltip = await page.locator('[data-testid="transition-tooltip"]').first();
        expect(await tooltip.isVisible()).toBeTruthy();
      }
    }
  });

  test('should have working prompt builder', async ({ page }) => {
    await page.waitForSelector('[data-testid="prompt-builder"]', { timeout: 10000 });
    
    // Verificar que el builder está presente
    const builder = page.locator('[data-testid="prompt-builder"]');
    expect(await builder.isVisible()).toBeTruthy();
    
    // Verificar selector de rango de fechas
    const dateRangeSelector = page.locator('[data-testid="date-range-selector"]');
    expect(await dateRangeSelector.isVisible()).toBeTruthy();
    
    // Verificar checkboxes de planetas
    const planetCheckboxes = page.locator('[data-testid="planet-checkbox"]').all();
    const checkboxes = await planetCheckboxes;
    expect(checkboxes.length).toBeGreaterThan(0);
    
    // Verificar selector de plantilla
    const templateSelector = page.locator('[data-testid="template-selector"]');
    expect(await templateSelector.isVisible()).toBeTruthy();
  });

  test('should generate prompt and copy to clipboard', async ({ page }) => {
    await page.waitForSelector('[data-testid="prompt-builder"]', { timeout: 10000 });
    
    // Seleccionar algunos planetas
    const sunCheckbox = page.locator('[data-testid="planet-checkbox-Sun"]');
    await sunCheckbox.check();
    
    const moonCheckbox = page.locator('[data-testid="planet-checkbox-Moon"]');
    await moonCheckbox.check();
    
    // Seleccionar plantilla
    const templateSelector = page.locator('[data-testid="template-selector"]');
    await templateSelector.click();
    await page.locator('text=Diario').click();
    
    // Generar prompt
    const generateButton = page.locator('[data-testid="generate-prompt"]');
    await generateButton.click();
    
    // Verificar que se generó el prompt
    const promptTextarea = page.locator('[data-testid="prompt-textarea"]');
    await expect(promptTextarea).toBeVisible();
    
    const promptText = await promptTextarea.inputValue();
    expect(promptText).toBeTruthy();
    expect(promptText).toContain('REPORTE DIARIO');
    expect(promptText).toContain('Sun');
    expect(promptText).toContain('Moon');
    
    // Probar botón de copiar
    const copyButton = page.locator('[data-testid="copy-prompt"]');
    await copyButton.click();
    
    // Verificar que se copió al portapapeles
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(promptText);
  });

  test('should export prompt as text file', async ({ page }) => {
    await page.waitForSelector('[data-testid="prompt-builder"]', { timeout: 10000 });
    
    // Generar un prompt básico
    const generateButton = page.locator('[data-testid="generate-prompt"]');
    await generateButton.click();
    
    // Probar exportación como texto
    const exportTextButton = page.locator('[data-testid="export-text"]');
    
    // Interceptar la descarga
    const downloadPromise = page.waitForEvent('download');
    await exportTextButton.click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/transits-prompt-.*\.txt$/);
  });

  test('should export prompt as JSON', async ({ page }) => {
    await page.waitForSelector('[data-testid="prompt-builder"]', { timeout: 10000 });
    
    // Generar un prompt básico
    const generateButton = page.locator('[data-testid="generate-prompt"]');
    await generateButton.click();
    
    // Probar exportación como JSON
    const exportJsonButton = page.locator('[data-testid="export-json"]');
    
    // Interceptar la descarga
    const downloadPromise = page.waitForEvent('download');
    await exportJsonButton.click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/transits-data-.*\.json$/);
  });

  test('should show data precision indicators', async ({ page }) => {
    await page.waitForSelector('[data-testid="precision-indicator"]', { timeout: 10000 });
    
    // Verificar indicadores de precisión
    const precisionIndicator = page.locator('[data-testid="precision-indicator"]');
    expect(await precisionIndicator.isVisible()).toBeTruthy();
    
    // Verificar contador de cambios
    const changesCounter = page.locator('[data-testid="changes-counter"]');
    expect(await changesCounter.isVisible()).toBeTruthy();
    
    // Verificar contador de rangos
    const rangesCounter = page.locator('[data-testid="ranges-counter"]');
    expect(await rangesCounter.isVisible()).toBeTruthy();
  });

  test('should handle API connection status', async ({ page }) => {
    // Verificar indicador de estado de API
    const apiStatus = page.locator('[data-testid="api-status"]');
    expect(await apiStatus.isVisible()).toBeTruthy();
    
    // Verificar que muestra estado correcto
    const statusText = await apiStatus.textContent();
    expect(['Conectado', 'Modo degradado', 'Sin conexión']).toContain(statusText);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Cambiar a vista móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.waitForSelector('[data-testid="transit-calendar"]', { timeout: 10000 });
    
    // Verificar que el calendario se adapta
    const calendar = page.locator('[data-testid="transit-calendar"]');
    expect(await calendar.isVisible()).toBeTruthy();
    
    // Verificar que el builder es accesible
    const builder = page.locator('[data-testid="prompt-builder"]');
    expect(await builder.isVisible()).toBeTruthy();
  });
});
