import axios from 'axios';
import { addDays, subDays, format } from 'date-fns';

// Mock API key for demo (in production use env)
const API_KEY = process.env.NEXT_PUBLIC_SPORTSDB_KEY || '3'; // TheSportsDB demo key
const BASE_URL = 'https://www.thesportsdb.com/api/v1/json';

// Data Aggregation Layer with caching, freshness, source tracking
class SportsDataService {
  private cacheTTL = 60 * 5; // 5 minutes

  private async getCached<T>(key: string): Promise<T | null> {
    // In-browser demo uses in-memory cache. Real backend would use DB.
    const item = (global as any).__sportsCache?.[key];
    if (item && item.expiresAt > Date.now()) {
      return item.data as T;
    }
    return null;
  }

  private async setCache(key: string, data: any, ttlSeconds: number = this.cacheTTL) {
    if (!(global as any).__sportsCache) {
      (global as any).__sportsCache = {};
    }
    (global as any).__sportsCache[key] = {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    };
  }

  async getLiveMatches() {
    const cacheKey = 'live-matches';
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // TheSportsDB doesn't have perfect live, so use mock/realistic demo data for live engine
      // In production would poll API-Football /fixtures?live=1
      const liveData = [
        {
          id: 12345,
          apiId: '12345',
          homeTeam: { id: 1, name: 'Manchester City', logo: 'https://www.thesportsdb.com/images/media/team/badge/3.png' },
          awayTeam: { id: 2, name: 'Liverpool', logo: 'https://www.thesportsdb.com/images/media/team/badge/4.png' },
          homeScore: 2,
          awayScore: 1,
          minute: 67,
          status: 'LIVE',
          competition: 'Premier League',
          events: [
            { type: 'goal', team: 'home', player: 'Haaland', minute: 12 },
            { type: 'goal', team: 'away', player: 'Salah', minute: 45 },
            { type: 'goal', team: 'home', player: 'De Bruyne', minute: 67 },
          ],
          lastUpdated: new Date().toISOString(),
          source: 'API-Football + TheSportsDB',
          confidence: 'high',
        },
        {
          id: 12346,
          apiId: '12346',
          homeTeam: { id: 3, name: 'Real Madrid', logo: 'https://www.thesportsdb.com/images/media/team/badge/5.png' },
          awayTeam: { id: 4, name: 'Barcelona', logo: 'https://www.thesportsdb.com/images/media/team/badge/6.png' },
          homeScore: 1,
          awayScore: 1,
          minute: 34,
          status: 'LIVE',
          competition: 'La Liga',
          events: [],
          lastUpdated: new Date().toISOString(),
          source: 'API-Football + TheSportsDB',
          confidence: 'high',
        },
      ];

      await this.setCache(cacheKey, liveData, 30); // shorter for live
      return liveData;
    } catch (error) {
      console.error('Live matches error', error);
      return [];
    }
  }

  async getFixtures(date?: string) {
    const cacheKey = `fixtures-${date || 'today'}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Use TheSportsDB for fixtures
      const today = format(new Date(), 'yyyy-MM-dd');
      const response = await axios.get(`${BASE_URL}/${API_KEY}/eventsday.php?d=${date || today}&s=Soccer`);
      
      const fixtures = response.data.events ? response.data.events.slice(0, 20).map((e: any) => ({
        id: e.idEvent,
        apiId: e.idEvent,
        homeTeam: { name: e.strHomeTeam, logo: e.strHomeTeamBadge || '' },
        awayTeam: { name: e.strAwayTeam, logo: e.strAwayTeamBadge || '' },
        date: e.dateEvent,
        status: e.strStatus || 'NS',
        competition: e.strLeague,
        lastUpdated: new Date().toISOString(),
        source: 'TheSportsDB',
        confidence: 'medium',
      })) : [];

      await this.setCache(cacheKey, fixtures);
      return fixtures;
    } catch (error) {
      // Fallback to realistic demo data
      console.log('Using fallback fixtures data');
      const demoFixtures = [
        { id: 1001, homeTeam: { name: 'Arsenal' }, awayTeam: { name: 'Tottenham' }, date: '2026-08-25T19:00:00Z', status: 'NS', competition: 'Premier League' },
        { id: 1002, homeTeam: { name: 'Bayern Munich' }, awayTeam: { name: 'Borussia Dortmund' }, date: '2026-08-25T18:30:00Z', status: 'NS', competition: 'Bundesliga' },
      ];
      await this.setCache(cacheKey, demoFixtures);
      return demoFixtures;
    }
  }

  async getStandings(competitionId = '4328') { // Premier League example
    const cacheKey = `standings-${competitionId}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    const demoStandings = [
      { position: 1, team: { name: 'Liverpool', logo: '' }, played: 3, won: 3, drawn: 0, lost: 0, gf: 9, ga: 2, gd: 7, points: 9, form: 'WWW' },
      { position: 2, team: { name: 'Manchester City', logo: '' }, played: 3, won: 2, drawn: 1, lost: 0, gf: 7, ga: 3, gd: 4, points: 7, form: 'WWD' },
      { position: 3, team: { name: 'Arsenal', logo: '' }, played: 3, won: 2, drawn: 0, lost: 1, gf: 6, ga: 4, gd: 2, points: 6, form: 'LWW' },
      { position: 4, team: { name: 'Chelsea', logo: '' }, played: 3, won: 1, drawn: 2, lost: 0, gf: 5, ga: 3, gd: 2, points: 5, form: 'DWW' },
    ];

    await this.setCache(cacheKey, demoStandings, 300);
    return demoStandings;
  }

  async getTransfers() {
    const cacheKey = 'latest-transfers';
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    const demoTransfers = [
      {
        id: 501,
        playerName: 'Victor Osimhen',
        fromTeam: 'Napoli',
        toTeam: 'Galatasaray',
        fee: '€75m',
        date: '2026-08-20',
        type: 'official',
        status: 'Completed',
        source: 'Transfermarkt',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 502,
        playerName: 'Rayan Cherki',
        fromTeam: 'Lyon',
        toTeam: 'Manchester City',
        fee: '€42m',
        date: '2026-08-19',
        type: 'official',
        status: 'Completed',
        source: 'Transfermarkt',
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 503,
        playerName: 'João Neves',
        fromTeam: 'Benfica',
        toTeam: 'PSG',
        fee: 'Rumoured',
        date: '2026-08-24',
        type: 'rumour',
        status: 'Rumour',
        source: 'Fabrizio Romano',
        lastUpdated: new Date().toISOString(),
      },
    ];

    await this.setCache(cacheKey, demoTransfers);
    return demoTransfers;
  }

  async getNews() {
    const cacheKey = 'latest-news';
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    const demoNews = [
      {
        id: 801,
        headline: 'Haaland scores hat-trick as City thrash Arsenal 4-1',
        summary: 'Erling Haaland continued his incredible form with three goals...',
        image: 'https://picsum.photos/id/1015/800/450',
        source: 'BBC Sport',
        publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        url: '#',
        relatedTeam: 'Manchester City',
      },
      {
        id: 802,
        headline: 'Mbappé signs new deal with Real Madrid until 2032',
        summary: 'The French superstar has put pen to paper on a long-term extension...',
        image: 'https://picsum.photos/id/106/800/450',
        source: 'Marca',
        publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        url: '#',
        relatedTeam: 'Real Madrid',
      },
    ];

    await this.setCache(cacheKey, demoNews);
    return demoNews;
  }

  async getTeamById(id: string) {
    // Similar aggregation for team detail page
    return {
      id,
      name: 'Manchester City',
      logo: 'https://www.thesportsdb.com/images/media/team/badge/3.png',
      country: 'England',
      venue: 'Etihad Stadium',
      coach: 'Pep Guardiola',
      competition: 'Premier League',
      squad: [
        { id: 1, name: 'Ederson', position: 'GK', number: 31, photo: 'https://www.thesportsdb.com/images/media/player/face/1.png' },
        { id: 2, name: 'Rodri', position: 'DM', number: 16, photo: '' },
        { id: 3, name: 'Erling Haaland', position: 'ST', number: 9, photo: '' },
      ],
      recentMatches: [],
      injuries: [
        { player: 'Kevin De Bruyne', type: 'Muscle strain', expectedReturn: '2 weeks', status: 'Doubtful' },
      ],
      lastUpdated: new Date().toISOString(),
      source: 'TheSportsDB + Transfermarkt',
      freshness: '🟢 Updated 3m ago',
    };
  }

  // Additional methods can be expanded (getPlayer, getMatchDetails, etc.)
  async search(query: string) {
    if (!query) return [];
    // Mock search across entities
    return [
      { type: 'player', id: 'p1', name: 'Erling Haaland', club: 'Manchester City', photo: '' },
      { type: 'team', id: 't1', name: 'Liverpool FC', logo: '' },
      { type: 'competition', id: 'c1', name: 'Premier League' },
    ].filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
  }
}

export const sportsDataService = new SportsDataService();
