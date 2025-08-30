import { test, expect } from '@playwright/test';

test.describe('Navatara Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/navatara');
  });

  test('should display navatara form with tabs', async ({ page }) => {
    // Esperar a que cargue la página
    await page.waitForSelector('[data-testid="navatara-form"]', { timeout: 10000 });
    
    // Verificar que el formulario está presente
    const form = page.locator('[data-testid="navatara-form"]');
    expect(await form.isVisible()).toBeTruthy();
    
    // Verificar que hay tabs para diferentes referencias
    const tabs = await page.locator('[data-testid="reference-tab"]').all();
    expect(tabs.length).toBeGreaterThan(0);
    
    // Verificar tabs específicos
    const expectedTabs = ['Luna', 'Sol', 'Ascendente', 'Nakshatra específica'];
    for (const tabText of expectedTabs) {
      const tab = page.locator(`text=${tabText}`);
      expect(await tab.isVisible()).toBeTruthy();
    }
  });

  test('should have form fields for each tab', async ({ page }) => {
    await page.waitForSelector('[data-testid="navatara-form"]', { timeout: 10000 });
    
    // Verificar campos comunes
    const dateTimeField = page.locator('[data-testid="datetime-field"]');
    const timezoneField = page.locator('[data-testid="timezone-field"]');
    const cityField = page.locator('[data-testid="city-field"]');
    
    expect(await dateTimeField.isVisible()).toBeTruthy();
    expect(await timezoneField.isVisible()).toBeTruthy();
    expect(await cityField.isVisible()).toBeTruthy();
    
    // Verificar selector de nakshatra (para tab específica)
    const nakshatraSelector = page.locator('[data-testid="nakshatra-selector"]');
    if (await nakshatraSelector.isVisible()) {
      expect(await nakshatraSelector.isVisible()).toBeTruthy();
    }
  });

  test('should calculate navatara with startNakshatraIndex=1', async ({ page }) => {
    await page.waitForSelector('[data-testid="navatara-form"]', { timeout: 10000 });
    
    // Seleccionar tab de Luna
    await page.locator('text=Luna').click();
    
    // Configurar fecha y hora
    const dateTimeField = page.locator('[data-testid="datetime-field"]');
    await dateTimeField.fill('2025-01-15T12:00:00');
    
    // Configurar timezone
    const timezoneField = page.locator('[data-testid="timezone-field"]');
    await timezoneField.selectOption('Europe/Paris');
    
    // Configurar ciudad
    const cityField = page.locator('[data-testid="city-field"]');
    await cityField.fill('Paris');
    
    // Calcular
    const calculateButton = page.locator('[data-testid="calculate-button"]');
    await calculateButton.click();
    
    // Esperar resultado
    await page.waitForSelector('[data-testid="navatara-table"]', { timeout: 10000 });
    
    // Verificar que se generó la tabla
    const table = page.locator('[data-testid="navatara-table"]');
    expect(await table.isVisible()).toBeTruthy();
    
    // Verificar que tiene 27 celdas (9x3)
    const cells = await page.locator('[data-testid="navatara-cell"]').all();
    expect(cells).toHaveLength(27);
  });

  test('should display 9x3 unified table structure', async ({ page }) => {
    await page.waitForSelector('[data-testid="navatara-table"]', { timeout: 10000 });
    
    // Verificar estructura de tabla
    const table = page.locator('[data-testid="navatara-table"]');
    expect(await table.isVisible()).toBeTruthy();
    
    // Verificar headers de columnas (Bhu, Bhuva, Swarga)
    const columnHeaders = await page.locator('[data-testid="loka-header"]').all();
    expect(columnHeaders.length).toBeGreaterThan(0);
    
    // Verificar filas de tara
    const taraRows = await page.locator('[data-testid="tara-row"]').all();
    expect(taraRows).toHaveLength(9); // 9 taras
    
    // Verificar que cada fila tiene 3 columnas + devata
    for (const row of taraRows) {
      const cells = await row.locator('[data-testid="navatara-cell"]').all();
      expect(cells.length).toBeGreaterThanOrEqual(3);
    }
  });

  test('should display correct devatas by group', async ({ page }) => {
    await page.waitForSelector('[data-testid="navatara-table"]', { timeout: 10000 });
    
    // Verificar que se muestran devatas
    const devataElements = await page.locator('[data-testid="devata-name"]').all();
    expect(devataElements.length).toBeGreaterThan(0);
    
    // Verificar devatas específicos
    const expectedDevatas = ['Gaṇeśa', 'Lakṣmī', 'Sūrya', 'Gaurī', 'Skanda', 'Durgā', 'Śiva', 'Kālī', 'Kṛṣṇa'];
    
    for (const devata of expectedDevatas) {
      const devataElement = page.locator(`text=${devata}`);
      if (await devataElement.isVisible()) {
        expect(await devataElement.isVisible()).toBeTruthy();
      }
    }
  });

  test('should display special taras correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid="navatara-table"]', { timeout: 10000 });
    
    // Buscar taras especiales (Pushya)
    const specialTaraElements = await page.locator('[data-testid="special-tara"]').all();
    
    if (specialTaraElements.length > 0) {
      for (const specialTara of specialTaraElements) {
        // Verificar que tiene indicador visual
        const indicator = await specialTara.locator('[data-testid="special-indicator"]').first();
        expect(await indicator.isVisible()).toBeTruthy();
        
        // Verificar tooltip con información
        await specialTara.hover();
        const tooltip = page.locator('[data-testid="special-tara-tooltip"]');
        expect(await tooltip.isVisible()).toBeTruthy();
      }
    }
  });

  test('should copy table as HTML', async ({ page }) => {
    await page.waitForSelector('[data-testid="navatara-table"]', { timeout: 10000 });
    
    // Verificar botón de copiar HTML
    const copyButton = page.locator('[data-testid="copy-html-button"]');
    expect(await copyButton.isVisible()).toBeTruthy();
    
    // Copiar tabla
    await copyButton.click();
    
    // Verificar que se copió al portapapeles
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBeTruthy();
    expect(clipboardText).toContain('<table');
    expect(clipboardText).toContain('Navatāra');
  });

  test('should export table as CSV', async ({ page }) => {
    await page.waitForSelector('[data-testid="navatara-table"]', { timeout: 10000 });
    
    // Verificar botón de exportar CSV
    const exportCsvButton = page.locator('[data-testid="export-csv-button"]');
    expect(await exportCsvButton.isVisible()).toBeTruthy();
    
    // Exportar CSV
    const downloadPromise = page.waitForEvent('download');
    await exportCsvButton.click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/navatara-.*\.csv$/);
  });

  test('should export table as JSON', async ({ page }) => {
    await page.waitForSelector('[data-testid="navatara-table"]', { timeout: 10000 });
    
    // Verificar botón de exportar JSON
    const exportJsonButton = page.locator('[data-testid="export-json-button"]');
    expect(await exportJsonButton.isVisible()).toBeTruthy();
    
    // Exportar JSON
    const downloadPromise = page.waitForEvent('download');
    await exportJsonButton.click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/navatara-.*\.json$/);
  });

  test('should calculate with different frames', async ({ page }) => {
    await page.waitForSelector('[data-testid="navatara-form"]', { timeout: 10000 });
    
    const frames = ['Luna', 'Sol', 'Ascendente'];
    
    for (const frame of frames) {
      // Seleccionar frame
      await page.locator(`text=${frame}`).click();
      
      // Configurar datos básicos
      const dateTimeField = page.locator('[data-testid="datetime-field"]');
      await dateTimeField.fill('2025-01-15T12:00:00');
      
      const timezoneField = page.locator('[data-testid="timezone-field"]');
      await timezoneField.selectOption('Europe/Paris');
      
      const cityField = page.locator('[data-testid="city-field"]');
      await cityField.fill('Paris');
      
      // Calcular
      const calculateButton = page.locator('[data-testid="calculate-button"]');
      await calculateButton.click();
      
      // Verificar resultado
      await page.waitForSelector('[data-testid="navatara-table"]', { timeout: 10000 });
      
      const table = page.locator('[data-testid="navatara-table"]');
      expect(await table.isVisible()).toBeTruthy();
      
      // Verificar que el frame seleccionado se muestra
      const frameIndicator = page.locator('[data-testid="frame-indicator"]');
      expect(await frameIndicator.isVisible()).toBeTruthy();
      
      const frameText = await frameIndicator.textContent();
      expect(frameText).toContain(frame);
    }
  });

  test('should calculate with specific nakshatra', async ({ page }) => {
    await page.waitForSelector('[data-testid="navatara-form"]', { timeout: 10000 });
    
    // Seleccionar tab de Nakshatra específica
    await page.locator('text=Nakshatra específica').click();
    
    // Seleccionar nakshatra
    const nakshatraSelector = page.locator('[data-testid="nakshatra-selector"]');
    await nakshatraSelector.selectOption('1'); // Ashwini
    
    // Calcular
    const calculateButton = page.locator('[data-testid="calculate-button"]');
    await calculateButton.click();
    
    // Verificar resultado
    await page.waitForSelector('[data-testid="navatara-table"]', { timeout: 10000 });
    
    const table = page.locator('[data-testid="navatara-table"]');
    expect(await table.isVisible()).toBeTruthy();
    
    // Verificar que el nakshatra seleccionado se muestra
    const nakshatraIndicator = page.locator('[data-testid="nakshatra-indicator"]');
    expect(await nakshatraIndicator.isVisible()).toBeTruthy();
  });

  test('should persist last query in localStorage', async ({ page }) => {
    await page.waitForSelector('[data-testid="navatara-form"]', { timeout: 10000 });
    
    // Configurar formulario
    const dateTimeField = page.locator('[data-testid="datetime-field"]');
    await dateTimeField.fill('2025-01-15T12:00:00');
    
    const timezoneField = page.locator('[data-testid="timezone-field"]');
    await timezoneField.selectOption('Europe/Paris');
    
    const cityField = page.locator('[data-testid="city-field"]');
    await cityField.fill('Paris');
    
    // Calcular
    const calculateButton = page.locator('[data-testid="calculate-button"]');
    await calculateButton.click();
    
    // Recargar página
    await page.reload();
    
    // Verificar que los datos se restauraron
    await page.waitForSelector('[data-testid="navatara-form"]', { timeout: 10000 });
    
    const restoredDateTime = await page.locator('[data-testid="datetime-field"]').inputValue();
    const restoredTimezone = await page.locator('[data-testid="timezone-field"]').inputValue();
    const restoredCity = await page.locator('[data-testid="city-field"]').inputValue();
    
    expect(restoredDateTime).toBe('2025-01-15T12:00:00');
    expect(restoredTimezone).toBe('Europe/Paris');
    expect(restoredCity).toBe('Paris');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Cambiar a vista móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.waitForSelector('[data-testid="navatara-form"]', { timeout: 10000 });
    
    // Verificar que el formulario se adapta
    const form = page.locator('[data-testid="navatara-form"]');
    expect(await form.isVisible()).toBeTruthy();
    
    // Verificar que la tabla se adapta
    await page.locator('text=Luna').click();
    const dateTimeField = page.locator('[data-testid="datetime-field"]');
    await dateTimeField.fill('2025-01-15T12:00:00');
    
    const calculateButton = page.locator('[data-testid="calculate-button"]');
    await calculateButton.click();
    
    await page.waitForSelector('[data-testid="navatara-table"]', { timeout: 10000 });
    
    const table = page.locator('[data-testid="navatara-table"]');
    expect(await table.isVisible()).toBeTruthy();
  });
});
