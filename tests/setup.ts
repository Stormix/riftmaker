import { config } from 'dotenv';

config({ path: '.env.test' });

import prisma from '@/lib/prisma';
import { fakeUserComplete } from '@/prisma/fake-data';
import { PlayerRole, type Tournament } from '@prisma/client';
import { afterEach, beforeAll, beforeEach } from 'bun:test';

let seedData: Awaited<ReturnType<typeof seed>> | null = null;

const seed = async () => {
  await prisma.user.create({
    data: {
      email: 'admin@admin.com',
    },
  });

  const tournament = await prisma.tournament.create({
    data: {
      name: 'Test Tournament',
      createdBy: {
        connect: {
          email: 'admin@admin.com',
        },
      },
    },
  });

  const seedPlayers = (count: number) => {
    const players = Array.from({ length: count }, (_, i) => fakeUserComplete());
    return prisma.$transaction(players.map((player) => prisma.user.create({ data: player })));
  };

  const seedTeams = async (count: number, tournament: Tournament) => {
    const players = await seedPlayers(count * 5);
    const teams = Array.from({ length: count }, (_, i) => {
      const teamPlayers = players.slice(i * 5, i * 5 + 5);
      return {
        name: `Team ${i + 1}`,
        tournament: {
          connect: {
            id: tournament.id,
          },
        },
        players: {
          create: teamPlayers.map((player) => ({
            role: Object.values(PlayerRole)[i % 5],
            player: {
              connect: {
                id: player.id,
              },
            },
          })),
        },
      };
    });

    return prisma.$transaction(teams.map((team) => prisma.team.create({ data: team })));
  };

  return {
    tournament,
    seedPlayers,
    seedTeams,
  };
};

const cleanup = async () => {
  await prisma.tournament.deleteMany();
  await prisma.matchPlayer.deleteMany();
  await prisma.match.deleteMany();
  await prisma.round.deleteMany();
  await prisma.bracket.deleteMany();
  await prisma.teamPlayer.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  await prisma.$disconnect();

  seedData = null;
};

beforeAll(async () => {
  console.log('Running tests, Environment: ', process.env.NODE_ENV);
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests should be run in test environment.');
  }
});

beforeEach(async () => {
  seedData = await seed();
});

afterEach(async () => {
  await cleanup();
});

export { seedData };
