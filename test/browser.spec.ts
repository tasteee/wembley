import { expect, test } from '@playwright/test'

test.describe('Wembley Soundfont Player - cancelScheduledValues Fix', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the demo page
    await page.goto('http://localhost:3000')
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Wembley')
  })

  test('should load soundfont and play C note without cancelScheduledValues error', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Auto-fill demo URL
    await page.click('#autoFillBtn')
    await expect(page.locator('#soundfontUrl')).toHaveValue(/.*\.sf2$|.*\.js$/)

    // Load the soundfont
    await page.click('#loadBtn')
    
    // Wait for loading to complete
    await page.waitForSelector('#success', { state: 'visible', timeout: 15000 })
    await expect(page.locator('#success')).toContainText('loaded successfully')

    // Wait for controls to appear
    await expect(page.locator('#controlsSection')).toBeVisible()

    // Select C note (C4 button)
    await page.click('[data-note="C4"]')
    await expect(page.locator('[data-note="C4"]')).toHaveClass(/active/)

    // Set parameters to match the issue scenario
    await page.locator('#velocitySlider').fill('70')
    await page.locator('#durationSlider').fill('500')

    // Play the selected note - this should not throw the cancelScheduledValues error
    await page.click('#playNoteBtn')

    // Wait a moment for any errors to surface
    await page.waitForTimeout(1000)

    // Check that no cancelScheduledValues error occurred
    const cancelScheduledValuesErrors = errors.filter(error => 
      error.includes('cancelScheduledValues') && error.includes('null')
    )
    
    expect(cancelScheduledValuesErrors).toHaveLength(0)
    
    // Also check that no general Tone.js errors occurred
    const toneErrors = errors.filter(error => 
      error.includes('Tone') || error.includes('envelope') || error.includes('triggerAttack')
    )
    
    expect(toneErrors).toHaveLength(0)
  })

  test('should handle console API usage from issue description', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Wait for wembley to be available globally
    await page.waitForFunction(() => window.wembley)

    // Execute the exact code from the issue description
    const result = await page.evaluate(async () => {
      try {
        const player = window.wembley.configure({
          gain: 70,
          maxVelocity: 85,
          minVelocity: 45,
          voicings: {
            jazzCluster: (notes) => notes.map((note) => note + '♭9'),
            arpeggiated: (notes) => notes.sort()
          }
        })

        const gear = await player.load({
          piano: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-ogg.js'
        })

        // This is the line that caused the original error
        gear.piano.note('C3').play()

        return { success: true, error: null }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Check that the operation succeeded
    expect(result.success).toBe(true)
    
    // Wait a moment for any async errors
    await page.waitForTimeout(1000)

    // Verify no cancelScheduledValues errors occurred
    const cancelScheduledValuesErrors = errors.filter(error => 
      error.includes('cancelScheduledValues') && error.includes('null')
    )
    
    expect(cancelScheduledValuesErrors).toHaveLength(0)
  })

  test('should play notes with various parameters without errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.waitForFunction(() => window.wembley)

    const result = await page.evaluate(async () => {
      try {
        const player = window.wembley.configure({ gain: 70 })
        const gear = await player.load({ piano: '/mock-piano.sf2' })

        // Test various parameter combinations that could trigger the bug
        gear.piano.note('C3').velocity(65).play()
        gear.piano.note('C3').velocity(65, 85).play() 
        gear.piano.note('C3').after(100).play()
        gear.piano.note('C3').duration(250).play()
        gear.piano.note('C3').velocity(70).after(50).duration(300).play()

        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    expect(result.success).toBe(true)
    
    await page.waitForTimeout(1000)
    
    const significantErrors = errors.filter(error => 
      !error.includes('Failed to load') && // Ignore loading errors for mock URLs
      (error.includes('cancelScheduledValues') || 
       error.includes('triggerAttack') ||
       error.includes('envelope'))
    )
    
    expect(significantErrors).toHaveLength(0)
  })
})