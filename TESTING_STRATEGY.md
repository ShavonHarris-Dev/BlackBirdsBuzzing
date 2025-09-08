# Language Songs App - Testing Strategy

## Current Status
✅ **Build Fixed** - TypeScript errors resolved, app builds successfully
🟡 **Core Features Working** - Basic functionality implemented with mock services
❌ **API Integrations** - YouTube, AI services need production keys

## Testing Approach

### 1. Manual Testing Checklist (Priority: HIGH)

#### Core User Journey Testing
**Test Scenario: Complete Song Learning Flow**
1. **Upload a Song**
   - ✅ Test with Korean lyrics (2-3 verses)
   - ✅ Test with Spanish lyrics  
   - ✅ Test with Arabic/RTL text
   - ✅ Verify vocabulary extraction works
   
2. **Learn Song Line-by-Line**
   - ✅ Navigate through lyrics progression
   - ✅ Mark lines as understood
   - ✅ Test progress tracking persistence
   - ✅ Test text-to-speech functionality
   
3. **Vocabulary Practice**
   - ✅ Access vocabulary bank
   - ✅ Practice flashcards
   - ✅ Verify frequent words detection
   
4. **Audio Integration** 
   - ❌ Test YouTube search (currently mock)
   - ❌ Test audio playback (needs real YouTube API)

#### PWA & Offline Testing
1. **Install as PWA**
   - Test "Add to Home Screen" functionality
   - Verify app works offline
   - Test service worker caching
   
2. **Database Persistence**
   - Add songs, refresh browser → data persists
   - Switch languages → data separated correctly
   - Clear browser data → graceful handling

#### Cross-Device Testing
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: iOS Safari, Android Chrome
- **Tablet**: iPad, Android tablet

### 2. Automated Testing Setup

#### Install Testing Framework
```bash
# Install Playwright for E2E testing
npm install --save-dev @playwright/test

# Install React Testing Library for component testing  
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest jsdom
```

#### Test Files to Create
1. **E2E Tests** (`tests/e2e/`)
   - `song-upload.spec.ts` - Upload and vocabulary extraction
   - `learning-flow.spec.ts` - Complete learning journey
   - `offline-functionality.spec.ts` - PWA offline features

2. **Component Tests** (`src/components/__tests__/`)
   - `SongLearning.test.tsx` - Line progression logic
   - `VocabularyBank.test.tsx` - Vocabulary display and filtering
   - `AudioPlayer.test.tsx` - Audio controls (with mocks)

### 3. Performance Testing

#### Metrics to Monitor
- **Initial Load Time** (target: <3s)
- **Song Upload Performance** (large lyric files)
- **Memory Usage** (long learning sessions)
- **Database Query Performance** (with many songs)

#### Test Scenarios
1. Upload 20+ songs with 50+ lines each
2. Learn multiple songs simultaneously
3. Practice 100+ vocabulary words
4. Test on slow 3G connection

### 4. Realistic User Scenarios

#### Scenario 1: K-Pop Fan Learning Korean
```
User Goal: Learn BTS "Dynamite" lyrics
Test Flow:
1. Upload Korean lyrics with English translation notes
2. Go through each line systematically
3. Practice vocabulary flashcards
4. Attempt to sing along (test audio sync)
5. Track learning progress over multiple sessions
```

#### Scenario 2: Spanish Student Studying
```  
User Goal: Learn Spanish vocabulary through songs
Test Flow:
1. Upload 3-4 Spanish songs of different genres
2. Identify most frequent words across songs  
3. Practice vocabulary in different contexts
4. Use AI conversation practice (when implemented)
5. Export learned vocabulary list
```

#### Scenario 3: Mobile Commuter (PWA Focus)
```
User Goal: Learn during daily 30-min commute
Test Flow:
1. Install PWA on mobile device
2. Download songs for offline use
3. Practice vocabulary during subway commute (offline)
4. Sync progress when online
5. Quick 2-minute daily practice sessions
```

### 5. Deployment Testing Strategy

#### Pre-Deployment Checklist
- [ ] Build passes (`npm run build`)
- [ ] PWA manifest validates
- [ ] Service worker registers correctly
- [ ] All static assets load
- [ ] Database initializes on first visit
- [ ] Error boundaries handle edge cases

#### Post-Deployment Testing
1. **Production Environment Setup**
   - Deploy to Vercel/Netlify
   - Set up YouTube API key
   - Configure environment variables
   - Test with real YouTube search
   
2. **API Integration Testing**
   - YouTube search returns real results
   - Audio playback works with actual videos
   - Error handling for API rate limits
   - Network failure graceful degradation

### 6. Bug Testing & Edge Cases

#### Data Edge Cases
- Empty lyrics/songs
- Very long song titles (100+ characters)  
- Special characters in different languages
- Duplicate songs/vocabulary entries
- Database corruption recovery

#### UI Edge Cases
- Very long lyrics lines (text wrapping)
- Rapid navigation between components
- Browser back/forward button behavior
- Window resize during learning session

#### Performance Edge Cases
- Slow internet connection
- Low memory devices
- Long-running sessions (memory leaks?)
- Multiple tabs open simultaneously

### 7. Success Criteria

#### Minimum Viable Testing (MVP)
- ✅ Core learning flow works end-to-end
- ✅ Data persists across sessions
- ✅ PWA installs and works offline
- ✅ Mobile responsive design functions

#### Production Ready Testing
- ✅ YouTube API integration works
- ✅ Performance under load (20+ songs)
- ✅ Cross-browser compatibility
- ✅ Accessibility compliance (WCAG basics)

#### Viral-Ready Testing  
- ✅ Social sharing features work
- ✅ Real-time features (when added)
- ✅ Handle concurrent users
- ✅ Analytics tracking works

## Next Steps

1. **Immediate**: Complete manual testing checklist
2. **Short-term**: Set up automated E2E tests
3. **Medium-term**: Deploy and test with real APIs
4. **Long-term**: Performance optimization and monitoring

## Test Data Preparation

### Sample Songs to Use
1. **Korean**: BTS - "Dynamite" (English + Korean mix)
2. **Spanish**: Jesse & Joy - "Espacio Sideral"  
3. **Arabic**: Fairuz - "Li Beirut" (RTL text testing)
4. **French**: Edith Piaf - "La Vie en Rose"

### Test Scenarios Data
- Short song (1-2 verses) for quick testing
- Long song (4+ verses) for performance testing  
- Mixed language song for complexity testing
- Song with special characters/punctuation