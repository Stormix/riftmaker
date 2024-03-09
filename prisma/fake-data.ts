import { PlayerRole, TournamentStatus, StageType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import Decimal from 'decimal.js';
import { Ranks } from '@/lib/draft';

export function fakeAccount() {
  return {
    type: faker.lorem.words(5),
    provider: faker.lorem.words(5),
    providerAccountId: faker.lorem.words(5),
    refresh_token: undefined,
    access_token: undefined,
    expires_at: undefined,
    token_type: undefined,
    scope: undefined,
    id_token: undefined,
    session_state: undefined,
  };
}
export function fakeAccountComplete() {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    type: faker.lorem.words(5),
    provider: faker.lorem.words(5),
    providerAccountId: faker.lorem.words(5),
    refresh_token: undefined,
    access_token: undefined,
    expires_at: undefined,
    token_type: undefined,
    scope: undefined,
    id_token: undefined,
    session_state: undefined,
  };
}
export function fakeSession() {
  return {
    sessionToken: faker.lorem.words(5),
    expires: faker.date.anytime(),
  };
}
export function fakeSessionComplete() {
  return {
    id: faker.string.uuid(),
    sessionToken: faker.lorem.words(5),
    userId: faker.string.uuid(),
    expires: faker.date.anytime(),
  };
}
export function fakeUser() {
  return {
    name: undefined,
    email: undefined,
    emailVerified: undefined,
    image: undefined,
    riotId: undefined,
    accountId: undefined,
    role: undefined,
    elo: undefined,
  };
}
export function fakeUserComplete() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    emailVerified: undefined,
    image: undefined,
    isAdmin: false,
    isBanned: false,
    riotId: undefined,
    accountId: undefined,
    role: faker.helpers.arrayElement([
      PlayerRole.TOP,
      PlayerRole.JUNGLE,
      PlayerRole.MID,
      PlayerRole.ADC,
      PlayerRole.SUPPORT,
      PlayerRole.FILL,
    ] as const),
    elo: `${faker.helpers.arrayElement([
      'IRON',
      'BRONZE',
      'SILVER',
      'GOLD',
      'PLATINUM',
      'EMERALD',
      'DIAMOND',
    ] as const)} ${Math.floor(Math.random() * 4) + 1}`,
  };
}
export function fakeVerificationToken() {
  return {
    identifier: faker.lorem.words(5),
    token: faker.lorem.words(5),
    expires: faker.date.anytime(),
  };
}
export function fakeVerificationTokenComplete() {
  return {
    identifier: faker.lorem.words(5),
    token: faker.lorem.words(5),
    expires: faker.date.anytime(),
  };
}
export function fakeTeamPlayer() {
  return {
    role: faker.helpers.arrayElement([
      PlayerRole.TOP,
      PlayerRole.JUNGLE,
      PlayerRole.MID,
      PlayerRole.ADC,
      PlayerRole.SUPPORT,
      PlayerRole.FILL,
    ] as const),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeTeamPlayerComplete() {
  return {
    id: faker.string.uuid(),
    teamId: faker.string.uuid(),
    playerId: faker.string.uuid(),
    role: faker.helpers.arrayElement([
      PlayerRole.TOP,
      PlayerRole.JUNGLE,
      PlayerRole.MID,
      PlayerRole.ADC,
      PlayerRole.SUPPORT,
      PlayerRole.FILL,
    ] as const),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeTournament() {
  return {
    name: faker.person.fullName(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeTournamentComplete() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    status: TournamentStatus.CREATED,
    createdById: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeTeam() {
  return {
    name: faker.person.fullName(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeTeamComplete() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
    tournamentId: undefined,
  };
}
export function fakeBracket() {
  return {
    name: faker.person.fullName(),
    type: faker.helpers.arrayElement([StageType.SINGLE_ELIMINATION] as const),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeBracketComplete() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    type: faker.helpers.arrayElement([StageType.SINGLE_ELIMINATION] as const),
    tournamentId: undefined,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeRound() {
  return {
    name: faker.person.fullName(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeRoundComplete() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    isConsolation: false,
    bracketId: undefined,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeMatch() {
  return {
    updatedAt: faker.date.anytime(),
  };
}
export function fakeMatchComplete() {
  return {
    id: faker.string.uuid(),
    roundId: undefined,
    isFinished: false,
    winnerId: undefined,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeMatchPlayer() {
  return {
    score: undefined,
    updatedAt: faker.date.anytime(),
  };
}
export function fakeMatchPlayerComplete() {
  return {
    id: faker.string.uuid(),
    matchId: undefined,
    score: undefined,
    teamId: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
