'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { sportsDataService } from '@/lib/sportsDataService';
import { Calendar, Clock, TrendingUp, Users, Award, ArrowRight, Star, Play } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface LiveMatch {
  id: number;
  homeTeam: any;
  awayTeam: any;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: string;
  competition: string;
  events: any[];
  lastUpdated: string;
  source: string;
}

export default function ShekoSportsHome() {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'live' | 'delayed' | 'offline'>('live');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time simulation
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [liveData, fixData, stdData, transData, nwsData] = await Promise.all([
          sportsDataService.getLiveMatches(),
          sportsDataService.getFixtures(),
          sportsDataService.getStandings(),
          sportsDataService.getTransfers(),
          sportsDataService.getNews(),
        ]);

        setLiveMatches(Array.isArray(liveData) ? (liveData as LiveMatch[]) : []);
        setFixtures(Array.isArray(fixData) ? fixData : []);
        setStandings(Array.isArray(stdData) ? stdData : []);
        setTransfers(Array.isArray(transData) ? transData : []);
        setNews(Array.isArray(nwsData) ? nwsData : []);
        
        // Simulate occasional data freshness updates
        if (Math.random() > 0.7) setConnectionStatus('delayed');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Polling for live updates (simulated every 25s)
    const interval = setInterval(() => {
      sportsDataService.getLiveMatches().then((live: any) => {
        if (Array.isArray(live) && live.length > 0) setLiveMatches(live as LiveMatch[]);
      });
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  const formatMatchTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'HH:mm');
    } catch {
      return '19:00';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      {/* HERO / LIVE BANNER */}
      <div className="sports-gradient pt-8 pb-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Main Live Scoreboard */}
            <div className="lg:w-3/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="px-4 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full live-dot"></div>
                  LIVE NOW
                </div>
                <div className="text-emerald-400 text-sm flex items-center gap-1">
                  <span className="font-mono">•</span> 
                  {connectionStatus === 'live' ? 'DATA FRESH' : 'UPDATING...'} 
                  <span className="text-[10px] text-zinc-400 ml-2">SOURCE: API-FOOTBALL + THESPORTSDB</span>
                </div>
              </div>

              {liveMatches.length > 0 ? (
                liveMatches.map((match, index) => (
                  <motion.div 
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-4 hover:border-emerald-500/30 group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-xs uppercase tracking-[1px] text-emerald-400 mb-1">{match.competition}</div>
                        <div className="text-4xl font-bold tabular-nums">{match.homeScore} - {match.awayScore}</div>
                      </div>
                      <div className="text-right">
                        <div className="px-5 py-1 text-xs font-mono bg-zinc-800 rounded-2xl inline-block">{match.minute}'</div>
                        <div className="mt-3 text-[11px] text-emerald-400">LIVE • {match.source}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex items-center gap-4">
                        <img src={match.homeTeam.logo || `https://picsum.photos/id/${20 + index}/64/64`} alt="" className="w-12 h-12 object-contain" />
                        <div className="font-semibold text-xl">{match.homeTeam.name}</div>
                      </div>
                      <div className="flex items-center gap-4 justify-end">
                        <div className="font-semibold text-xl text-right">{match.awayTeam.name}</div>
                        <img src={match.awayTeam.logo || `https://picsum.photos/id/${30 + index}/64/64`} alt="" className="w-12 h-12 object-contain" />
                      </div>
                    </div>

                    {/* Key events */}
                    {match.events && match.events.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-white/10 text-sm">
                        <div className="text-zinc-400 text-xs mb-3">KEY MOMENTS</div>
                        <div className="space-y-2">
                          {match.events.map((ev: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 text-xs">
                              <span className="font-mono bg-zinc-800 px-2 py-px rounded">{ev.minute}'</span>
                              <span className={`${ev.team === 'home' ? 'text-sky-400' : 'text-orange-400'}`}>
                                {ev.type.toUpperCase()}
                              </span>
                              <span>{ev.player}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="bg-zinc-900/60 rounded-3xl p-16 text-center">
                  <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
                    ⚽
                  </div>
                  <p className="text-xl font-medium">No live matches right now</p>
                  <p className="text-zinc-400 mt-2">Check back soon for the next match window</p>
                </div>
              )}
            </div>

            {/* Sidebar Quick Stats */}
            <div className="lg:w-2/5 space-y-6">
              <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6">
                <div className="uppercase text-xs tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4" /> TODAY'S HIGHLIGHTS
                </div>
                
                <div className="space-y-5">
                  {fixtures.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="text-sm">{f.homeTeam?.name || f.homeTeam} vs {f.awayTeam?.name || f.awayTeam}</div>
                        <div className="text-[10px] text-zinc-500">{f.competition}</div>
                      </div>
                      <div className="text-right text-xs font-mono text-emerald-400">
                        {formatMatchTime(f.date || '2026-08-25')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Transfer Ticker */}
              <div className="bg-zinc-900 border border-amber-500/20 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-amber-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="uppercase text-xs font-semibold tracking-widest">Transfer Center</span>
                  </div>
                  <Link href="/transfers" className="text-xs flex items-center gap-1 hover:text-white text-amber-400">
                    ALL <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                
                {transfers.slice(0, 3).map((t, index) => (
                  <div key={index} className="flex justify-between py-3 border-t border-white/10 text-sm first:border-0">
                    <div>
                      <span className="font-medium">{t.playerName}</span>
                      <div className="text-xs text-zinc-400">{t.fromTeam} → {t.toTeam}</div>
                    </div>
                    <div className={`text-xs px-3 py-1 rounded-full self-start ${t.type === 'official' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                      {t.type === 'official' ? 'OFFICIAL' : 'RUMOUR'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Favorites & Personalized */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Star className="text-yellow-400" />
            <h2 className="text-2xl font-semibold">Your Favorites</h2>
          </div>
          <Link href="/favorites" className="text-sm flex items-center text-emerald-400 hover:underline">
            Manage favorites →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {['Liverpool', 'Real Madrid', 'Al Ahly', 'Al Nassr'].map((team, i) => (
            <div key={i} className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all active:scale-[0.985]">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
              <div>
                <div className="font-semibold">{team}</div>
                <div className="text-xs text-emerald-400">Premier League • Followed</div>
              </div>
            </div>
          ))}
        </div>

        {/* Standings Quick View */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Award className="text-amber-400" /> Premier League Table
            </h3>
            <Link href="/standings" className="text-sm text-zinc-400 hover:text-white flex items-center gap-1">Full Table <ArrowRight className="w-4 h-4" /></Link>
          </div>

          <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-white/5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-xs text-zinc-400">
                  <th className="py-5 px-8 text-left font-normal">POS</th>
                  <th className="py-5 px-8 text-left font-normal">TEAM</th>
                  <th className="py-5 px-4 text-center font-normal">P</th>
                  <th className="py-5 px-4 text-center font-normal">W</th>
                  <th className="py-5 px-4 text-center font-normal">D</th>
                  <th className="py-5 px-4 text-center font-normal">L</th>
                  <th className="py-5 px-4 text-center font-normal">GD</th>
                  <th className="py-5 px-8 text-right font-normal">PTS</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5">
                {standings.map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-5 px-8 font-mono text-emerald-400">{row.position}</td>
                    <td className="py-5 px-8 font-medium flex items-center gap-3">
                      <div className="w-6 h-6 bg-white/10 rounded"></div>
                      {row.team.name}
                    </td>
                    <td className="py-5 px-4 text-center text-zinc-400">{row.played}</td>
                    <td className="py-5 px-4 text-center">{row.won}</td>
                    <td className="py-5 px-4 text-center">{row.drawn}</td>
                    <td className="py-5 px-4 text-center">{row.lost}</td>
                    <td className="py-5 px-4 text-center font-mono">{row.gd > 0 ? '+' : ''}{row.gd}</td>
                    <td className="py-5 px-8 text-right font-semibold">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest News */}
        <div>
          <div className="flex justify-between items-baseline mb-6">
            <h3 className="text-xl font-semibold">Latest Football News</h3>
            <Link href="/news" className="text-emerald-400 text-sm flex items-center gap-2 hover:gap-3 transition-all">
              VIEW ALL NEWS <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -6 }}
                className="group bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden hover:border-white/20 transition-all"
              >
                <div className="h-48 bg-zinc-800 relative">
                  <img 
                    src={item.image} 
                    alt={item.headline} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 right-4 bg-black/70 text-[10px] px-3 py-1 rounded-full font-mono">{item.source}</div>
                </div>
                <div className="p-6">
                  <div className="line-clamp-2 font-medium leading-snug text-lg mb-3 group-hover:text-emerald-400 transition-colors">
                    {item.headline}
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center justify-between">
                    <span>{format(new Date(item.publishedAt), 'dd MMM • HH:mm')}</span>
                    <span className="text-emerald-400">READ →</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 md:hidden z-50">
        <div className="flex text-xs">
          {[
            { label: 'Home', icon: '🏠' },
            { label: 'Live', icon: '🔴' },
            { label: 'Matches', icon: '📅' },
            { label: 'Transfers', icon: '🔄' },
            { label: 'More', icon: '⋯' },
          ].map((item, index) => (
            <div key={index} className={`flex-1 py-3 flex flex-col items-center justify-center border-t-2 ${index === 0 ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-400'}`}>
              <div className="text-2xl mb-0.5">{item.icon}</div>
              <div>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-black py-16 text-center text-xs text-zinc-500 border-t border-zinc-900 mt-20">
        SHEKO SPORTS © 2026 • Real data aggregated from TheSportsDB, API-Football, Transfermarkt and trusted sources.<br />
        All times are local to your timezone. Data updates continuously.
      </footer>
    </div>
  );
}
