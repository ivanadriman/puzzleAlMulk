import { SurahData, SurahMeta } from '../types';

class DataService {
  private surahsCache: SurahMeta[] | null = null;
  private surahDataCache: Map<number, SurahData> = new Map();

  /**
   * Get list of all available Surahs from registry
   */
  public async getSurahs(): Promise<SurahMeta[]> {
    if (this.surahsCache) return this.surahsCache;

    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const res = await fetch(`${baseUrl}data/surahs.json`);
      if (!res.ok) throw new Error('Failed to load surahs list');
      this.surahsCache = await res.json();
      return this.surahsCache || [];
    } catch (err) {
      console.error('Error loading surahs:', err);
      // Fallback default for Surah Al-Mulk
      return [
        {
          id: 67,
          nameSimple: 'Al-Mulk',
          nameArabic: 'الملك',
          versesCount: 30,
          revelationPlace: 'makkah',
          file: 'surah-067.json'
        }
      ];
    }
  }

  /**
   * Load data for a specific Surah
   */
  public async getSurah(surahId: number): Promise<SurahData> {
    if (this.surahDataCache.has(surahId)) {
      return this.surahDataCache.get(surahId)!;
    }

    const pad3 = String(surahId).padStart(3, '0');
    const baseUrl = import.meta.env.BASE_URL || '/';
    const res = await fetch(`${baseUrl}data/surah-${pad3}.json`);
    if (!res.ok) {
      throw new Error(`Failed to load data for Surah ${surahId}`);
    }

    const data: SurahData = await res.json();
    this.surahDataCache.set(surahId, data);
    return data;
  }
}

export const dataService = new DataService();
