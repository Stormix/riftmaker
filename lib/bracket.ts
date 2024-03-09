import type { StageType, Tournament } from '@prisma/client';
import prisma from './prisma';
import { validateTournamentAccess } from './validation';

class TournamentManager {
  constructor(readonly tournament: Tournament) {}

  async createBracket(name: string, type: StageType, teamsIds: string[], withConsolation = true) {
    if (!this.tournament || teamsIds.length < 2 || Math.log2(teamsIds.length) % 1 !== 0) {
      throw new Error('Invalid input');
    }
    //
    const bracket = await prisma.bracket.create({
      data: {
        name,
        type,
        tournament: {
          connect: {
            id: this.tournament.id,
          },
        },
        teams: {
          connect: teamsIds.map((id) => ({ id })),
        },
      },
    });

    const numberOfRounds = Math.log2(teamsIds.length) + (withConsolation ? 1 : 0);

    // Create rounds
    const rounds = await prisma.$transaction(
      Array.from({ length: numberOfRounds }).map((_, round) => {
        const isConsolation = withConsolation && round === numberOfRounds - 1;
        return prisma.round.create({
          data: {
            bracket: {
              connect: {
                id: bracket.id,
              },
            },
            name: isConsolation ? 'Consolation' : `Round ${round + 1}`,
            isConsolation,
          },
        });
      }),
    );

    // Create matches
    const matches = await prisma.$transaction(
      Array.from({ length: numberOfRounds }).flatMap((_, round) =>
        Array.from({ length: 2 ** (numberOfRounds - round - 1) / 2 }).map((_, match) =>
          prisma.match.create({
            data: {
              round: {
                connect: {
                  id: rounds[round].id,
                },
              },
            },
          }),
        ),
      ),
    );

    // Seed intial round matches
    const teams = (
      await prisma.team.findMany({
        where: {
          id: {
            in: teamsIds,
          },
        },
      })
    ).sort(() => Math.random() - 0.5);

    const firstRound = rounds.find((round) => round.name === 'Round 1')!;
    const firstRoundMatches = matches.filter((match) => match.roundId === firstRound.id);

    await prisma.$transaction(
      firstRoundMatches.map((match, index) => {
        const team1 = teams.pop();
        const team2 = teams.pop();
        return prisma.match.update({
          where: {
            id: match.id,
          },
          data: {
            players: {
              createMany: {
                data: [
                  {
                    teamId: team1!.id,
                  },
                  {
                    teamId: team2!.id,
                  },
                ],
              },
            },
          },
        });
      }),
    );

    return bracket;
  }
}

export default TournamentManager;
