import { expect, test, describe } from 'bun:test';
import TournamentManager from '../bracket';
import { seedData } from '@/tests/setup';
import { StageType } from '@prisma/client';

describe('Tournament Manager', () => {
  describe('Single Elimination Brackets', () => {
    test('should throw if input is invalid', () => {
      if (!seedData) {
        throw new Error('Seed data not available');
      }
      const instance = new TournamentManager(seedData?.tournament);

      expect(instance.createBracket('Test Bracket', StageType.SINGLE_ELIMINATION, [])).rejects.toThrow('Invalid input');
    });

    test('should throw if the number of teams is not a power of 2', async () => {
      if (!seedData) {
        throw new Error('Seed data not available');
      }
      const instance = new TournamentManager(seedData?.tournament);
      const teams = await seedData.seedTeams(10, seedData.tournament);

      expect(
        instance.createBracket(
          'Test Bracket',
          StageType.SINGLE_ELIMINATION,
          teams.map((team) => team.id),
        ),
      ).rejects.toThrow('Invalid input');
    });

    test('should create a single elimination bracket', async () => {
      if (!seedData) {
        throw new Error('Seed data not available');
      }
      const instance = new TournamentManager(seedData?.tournament);
      const teams = await seedData.seedTeams(16, seedData.tournament);

      const bracket = await instance.createBracket(
        'Test Bracket',
        StageType.SINGLE_ELIMINATION,
        teams.map((team) => team.id),
      );

      expect(bracket).not.toBe(null);
    });
  });
});
