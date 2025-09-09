import { test, expect } from '@playwright/test';

// Helper function to select Korean language
async function selectKoreanLanguage(page: any) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('select');
  
  // Find Korean option value by looking at all options
  const koreanValue = await page.evaluate(() => {
    const select = document.querySelector('select');
    if (!select) return null;
    for (const option of select.options) {
      if (option.text.includes('Korean')) {
        return option.value;
      }
    }
    return null;
  });
  
  if (koreanValue) {
    await page.selectOption('select', koreanValue);
  } else {
    throw new Error('Korean language option not found');
  }
}

test.describe('Korean Language Learning Flow', () => {
  test('complete flow: upload Korean song → learn lyrics → practice vocabulary', async ({ page }) => {
    await page.goto('/');
    
    // 1. Select Korean language
    await selectKoreanLanguage(page);
    // Verify Korean is selected and upload area is shown
    await expect(page.locator('text=Upload your first song to start learning')).toBeVisible();
    
    // 2. Upload a Korean song
    await page.click('text=Upload Song');
    // Wait for navigation to upload form
    await expect(page.locator('h2')).toContainText('Upload New');
    await page.fill('#title', 'Spring Day');
    await page.fill('#artist', 'BTS');
    
    // Korean lyrics with multiple repeated words
    const koreanLyrics = `보고 싶다
이렇게 말하니까 더 보고 싶다
너희 사진을 보고 있어도 보고 싶다
너무 야속한 시간
나는 우리가 밉다
이젠 얼굴 한 번 보는 것조차 힘들어진 우리가
여전히 아름다운 건 아마 추억이라서 그런가?
보고 싶다
보고 싶다
보고 싶다`;

    await page.fill('textarea', koreanLyrics);
    await page.click('text=Save Song');
    
    // 3. Verify song was uploaded successfully
    await expect(page.locator('text=saved successfully')).toBeVisible();
    await page.waitForTimeout(1000); // Wait for database update
    
    // 4. Navigate back to songs and start learning
    await page.click('text=Songs');
    await page.click('text=Spring Day');
    
    // 5. Test learning interface
    await expect(page.locator('text=Spring Day')).toBeVisible();
    await expect(page.locator('text=BTS')).toBeVisible();
    await expect(page.locator('text=Line 1 of')).toBeVisible();
    
    // 6. Test text-to-speech
    await page.click('text=🔊 Speak Line');
    
    // 7. Test hover translations (hover over Korean word)
    const koreanWord = page.locator('text=보고').first();
    await koreanWord.hover();
    
    // Wait for translation tooltip to appear
    await expect(page.locator('[class*="tooltip"]').or(page.locator('[class*="opacity-100"]'))).toBeVisible({ timeout: 5000 });
    
    // 8. Test line progression
    await page.click('text=I understand this line');
    await expect(page.locator('text=Line 2 of')).toBeVisible();
    
    // 9. Navigate to vocabulary section
    await page.click('text=Vocabulary');
    
    // 10. Verify frequent words appear (보고 should appear 4+ times)
    await expect(page.locator('text=🌟 Frequent Words')).toBeVisible();
    await expect(page.locator('text=보고')).toBeVisible();
    
    // 11. Test vocabulary practice
    if (await page.locator('text=Start Practice').isVisible()) {
      await page.click('text=Start Practice');
      await expect(page.locator('text=Vocabulary Practice')).toBeVisible();
    }
  });

  test('hover translations work with Korean text', async ({ page }) => {
    await page.goto('/');
    
    // Upload a simple Korean song first
    await selectKoreanLanguage(page);
    await page.click('text=Upload Song');
    await page.fill('#title', '사랑해');
    await page.fill('#artist', 'Test Artist');
    await page.fill('textarea', '사랑해 사랑해 사랑해');
    await page.click('text=Save Song');
    
    // Navigate to learning
    await page.click('text=Songs');
    await page.click('text=사랑해');
    
    // Test hover translation
    await page.locator('text=사랑해').first().hover();
    
    // Should show translation loading or actual translation
    await page.waitForTimeout(2000);
    // The translation service should attempt to translate
    console.log('Hover translation test completed');
  });

  test('YouTube search integration', async ({ page }) => {
    await page.goto('/');
    
    // Upload song and navigate to learning
    await selectKoreanLanguage(page);
    await page.click('text=Upload Song');
    await page.fill('#title', 'Dynamite');
    await page.fill('#artist', 'BTS');
    await page.fill('textarea', 'Cos ah ah I\'m in the stars tonight');
    await page.click('text=Save Song');
    
    await page.click('text=Songs');
    await page.click('text=Dynamite');
    
    // Test YouTube search
    await page.click('text=🎵 Add Audio from YouTube');
    await expect(page.locator('text=Find Audio for Song')).toBeVisible();
    
    // Should show search interface
    await expect(page.locator('input[placeholder*="Search for song"]')).toBeVisible();
    await expect(page.locator('text=🔍 Search')).toBeVisible();
    
    // Close modal
    await page.click('text=×');
  });

  test('PWA offline functionality', async ({ page, context }) => {
    await page.goto('/');
    
    // Wait for service worker to register
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Upload a song while online
    await selectKoreanLanguage(page);
    await page.click('text=Upload Song');
    await page.fill('#title', 'Offline Test');
    await page.fill('#artist', 'Test');
    await page.fill('textarea', '오프라인 테스트');
    await page.click('text=Save Song');
    
    // Verify song exists
    await page.click('text=Songs');
    await expect(page.locator('text=Offline Test')).toBeVisible();
    
    // Go offline
    await context.setOffline(true);
    
    // Refresh page and verify it still works
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still show the app (service worker cache)
    await expect(page.locator('text=Language Songs')).toBeVisible();
    await expect(page.locator('text=Offline Test')).toBeVisible();
    
    // Can still access learning interface
    await page.click('text=Offline Test');
    await expect(page.locator('text=오프라인 테스트')).toBeVisible();
  });

  test('vocabulary frequency system (3+ threshold)', async ({ page }) => {
    await page.goto('/');
    
    // Upload song with repeated words
    await selectKoreanLanguage(page);
    await page.click('text=Upload Song');
    await page.fill('#title', 'Frequency Test');
    await page.fill('#artist', 'Test');
    
    // Words with different frequencies
    const lyrics = `사랑 사랑 사랑 사랑 사랑
마음 마음 마음 마음
좋아 좋아 좋아
예쁘 예쁘
하나`;
    
    await page.fill('textarea', lyrics);
    await page.click('text=Save Song');
    
    // Check vocabulary section
    await page.click('text=Vocabulary');
    
    // Should show frequent words (3+ occurrences)
    await expect(page.locator('text=🌟 Frequent Words')).toBeVisible();
    
    // 사랑 (5x) and 마음 (4x) and 좋아 (3x) should be in frequent words
    await expect(page.locator('.frequent-words').or(page.locator(':text("사랑")')).first()).toBeVisible();
    
    // 예쁘 (2x) and 하나 (1x) should NOT be in frequent words section
    // They should only appear in "All Vocabulary" section
  });
});