import { pgTable, serial, text, integer, timestamp, jsonb, boolean, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const competitions = pgTable('competitions', {
  id: serial('id').primaryKey(),
  apiId: text('api_id').unique().notNull(),
  name: text('name').notNull(),
  country: text('country'),
  logo: text('logo'),
  type: text('type'), // 'league' | 'cup'
  season: integer('season'),
  lastUpdated: timestamp('last_updated').defaultNow(),
  source: text('source').default('thesportsdb'),
  metadata: jsonb('metadata'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  apiId: text('api_id').unique().notNull(),
  name: text('name').notNull(),
  shortName: text('short_name'),
  logo: text('logo'),
  country: text('country'),
  venue: text('venue'),
  coach: text('coach'),
  competitionId: integer('competition_id').references(() => competitions.id),
  lastUpdated: timestamp('last_updated').defaultNow(),
  source: text('source').default('thesportsdb'),
  metadata: jsonb('metadata'),
});

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  apiId: text('api_id').unique().notNull(),
  name: text('name').notNull(),
  photo: text('photo'),
  nationality: text('nationality'),
  age: integer('age'),
  position: text('position'),
  currentTeamId: integer('current_team_id').references(() => teams.id),
  squadNumber: integer('squad_number'),
  lastTransfer: jsonb('last_transfer'),
  contractUntil: timestamp('contract_until'),
  lastUpdated: timestamp('last_updated').defaultNow(),
  source: text('source').default('thesportsdb'),
  metadata: jsonb('metadata'),
});

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  apiId: text('api_id').unique().notNull(),
  competitionId: integer('competition_id').references(() => competitions.id),
  homeTeamId: integer('home_team_id').references(() => teams.id),
  awayTeamId: integer('away_team_id').references(() => teams.id),
  date: timestamp('date').notNull(),
  status: text('status').notNull(), // 'NS', '1H', 'HT', '2H', 'FT', 'PEN', etc.
  homeScore: integer('home_score').default(0),
  awayScore: integer('away_score').default(0),
  minute: integer('minute'),
  venue: text('venue'),
  referee: text('referee'),
  events: jsonb('events').default([]), // goals, cards, subs
  statistics: jsonb('statistics').default({}),
  lineups: jsonb('lineups').default([]),
  lastUpdated: timestamp('last_updated').defaultNow(),
  source: text('source').default('thesportsdb'),
});

export const standings = pgTable('standings', {
  id: serial('id').primaryKey(),
  competitionId: integer('competition_id').references(() => competitions.id),
  teamId: integer('team_id').references(() => teams.id),
  position: integer('position').notNull(),
  played: integer('played').default(0),
  won: integer('won').default(0),
  drawn: integer('drawn').default(0),
  lost: integer('lost').default(0),
  goalsFor: integer('goals_for').default(0),
  goalsAgainst: integer('goals_against').default(0),
  goalDifference: integer('goal_difference'),
  points: integer('points').default(0),
  form: text('form'), // 'WDLWW'
  lastUpdated: timestamp('last_updated').defaultNow(),
});

export const transfers = pgTable('transfers', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').references(() => players.id),
  playerName: text('player_name').notNull(),
  fromTeam: text('from_team').notNull(),
  toTeam: text('to_team').notNull(),
  fee: text('fee'),
  date: timestamp('date').notNull(),
  type: text('type').notNull(), // 'official' | 'rumour'
  status: text('status'),
  source: text('source').default('transfermarkt'),
  lastUpdated: timestamp('last_updated').defaultNow(),
  metadata: jsonb('metadata'),
});

export const news = pgTable('news', {
  id: serial('id').primaryKey(),
  headline: text('headline').notNull(),
  summary: text('summary'),
  image: text('image'),
  source: text('source').notNull(),
  publishedAt: timestamp('published_at').notNull(),
  url: text('url'),
  relatedTeamId: integer('related_team_id').references(() => teams.id),
  relatedPlayerId: integer('related_player_id').references(() => players.id),
  relatedCompetitionId: integer('related_competition_id').references(() => competitions.id),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: text('user_id').default('demo-user'), // for demo
  entityType: text('entity_type').notNull(), // 'team' | 'player' | 'competition'
  entityId: integer('entity_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cache = pgTable('cache', {
  key: text('key').primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  source: text('source'),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

export const relationsSchema = relations(teams, ({ many }) => ({
  players: many(players),
  homeMatches: many(matches, { relationName: 'homeTeam' }),
  awayMatches: many(matches, { relationName: 'awayTeam' }),
}));

// Types for Drizzle
export type Competition = typeof competitions.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Standing = typeof standings.$inferSelect;
export type Transfer = typeof transfers.$inferSelect;
export type NewsItem = typeof news.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
