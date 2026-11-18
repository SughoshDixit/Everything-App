import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiAiService } from '../services/geminiAiService';

describe('Gemini AI Service & Test Harness', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides current day athletic context and speciality', () => {
    const context = GeminiAiService.getTodaySpecialityAndEvents();
    expect(context).toHaveProperty('dateStr');
    expect(context).toHaveProperty('dayOfYearTitle');
    expect(context).toHaveProperty('militarySpeciality');
    expect(context).toHaveProperty('footballSpeciality');
    expect(context.militarySpeciality.length).toBeGreaterThan(10);
    expect(context.footballSpeciality.length).toBeGreaterThan(10);
  });

  it('runs on-device synthesizer query in harness with zero keys', async () => {
    const result = await GeminiAiService.runHarnessQuery(
      'Write 3 social captions for my 10km run at 4:30 pace.',
      '',
      { model: 'on-device' }
    );

    expect(result).toHaveProperty('text');
    expect(result.text.length).toBeGreaterThan(20);
    expect(result.modelUsed).toContain('On-Device Tactical Synthesizer');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.estimatedPromptTokens).toBeGreaterThan(0);
    expect(result.estimatedOutputTokens).toBeGreaterThan(0);
  });

  it('handles simulated online API calls with successful Gemini response', async () => {
    const mockApiResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'Tactical directive: Maintain 4:30/km high press rhythm. YNWA!' }]
          }
        }
      ],
      usageMetadata: {
        promptTokenCount: 145,
        candidatesTokenCount: 32
      }
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    } as Response);

    const result = await GeminiAiService.runHarnessQuery(
      'Execute tactical briefing',
      'mock-gemini-key',
      { model: 'gemini-1.5-flash', temperature: 0.8 }
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result.modelUsed).toBe('gemini-1.5-flash');
    expect(result.text).toBe('Tactical directive: Maintain 4:30/km high press rhythm. YNWA!');
    expect(result.estimatedPromptTokens).toBe(145);
    expect(result.estimatedOutputTokens).toBe(32);
    expect(result.error).toBeUndefined();
  });

  it('handles online API HTTP error reporting', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: async () => 'API key invalid'
    } as Response);

    const result = await GeminiAiService.runHarnessQuery(
      'Test query with invalid key',
      'bad-key',
      { model: 'gemini-1.5-flash' }
    );

    expect(result.error).toContain('HTTP 403');
    expect(result.text).toContain('Error calling gemini-1.5-flash (403)');
  });

  it('falls back to on-device synthesizer when online API network fetch throws error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network connection timeout'));

    const result = await GeminiAiService.runHarnessQuery(
      'Should I skip today because my legs are tired?',
      'mock-key',
      { model: 'gemini-1.5-flash' }
    );

    expect(result.modelUsed).toContain('fallback to local');
    expect(result.error).toContain('Network connection timeout');
    expect(result.text).toContain('Excuse Intercepted');
  });

  it('validates DEFCON excuse buster with military and football discipline', async () => {
    const result = await GeminiAiService.runHarnessQuery(
      'My legs are tired, should I skip today?',
      '',
      { model: 'on-device' },
      { athleteName: 'Sughosh', streakCount: 21, recentPace: '4:45 /km' }
    );

    expect(result.text).toContain('SITREP: Excuse Intercepted');
    expect(result.text).toContain('Sam Manekshaw');
    expect(result.text).toContain('21-day active discipline streak');
    expect(result.text).toContain('Tactical Compromise Protocol');
  });

  it('validates social caption generator quality with multiple tailored options and tags', async () => {
    const result = await GeminiAiService.runHarnessQuery(
      'Generate Instagram post captions for today',
      '',
      { model: 'on-device' },
      { athleteName: 'Sughosh', streakCount: 21, recentPace: '4:45 /km' }
    );

    expect(result.text).toContain('Option 1: Anfield High-Press Banter');
    expect(result.text).toContain('Option 2: Indian Army Ethos');
    expect(result.text).toContain('Option 3: Short & Punchy Athletic Hook');
    expect(result.text).toContain('#KuchhBhii');
    expect(result.text).toContain('4:45 /km');
    expect(result.text).toContain('21');
  });

  it('validates tactical directives and Liverpool FC Klopp-Slot doctrine', async () => {
    const result = await GeminiAiService.runHarnessQuery(
      'Arne Slot tactical coaching advice for Liverpool',
      '',
      { model: 'on-device' },
      { athleteName: 'Sughosh', streakCount: 21, recentPace: '4:45 /km' }
    );

    expect(result.text).toContain('Klopp-Slot Doctrine');
    expect(result.text).toContain('high-press');
    expect(result.text).toContain("You'll Never Walk Alone");
  });

  it('formats request payload accurately for API dispatch', async () => {
    const result = await GeminiAiService.runHarnessQuery(
      'Quick test query',
      '',
      {
        model: 'on-device',
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 500
      }
    );

    expect(result.rawRequest.generationConfig.temperature).toBe(0.7);
    expect(result.rawRequest.generationConfig.topP).toBe(0.9);
    expect(result.rawRequest.generationConfig.maxOutputTokens).toBe(500);
  });
});
