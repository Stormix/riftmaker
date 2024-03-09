'use server';

import { authOptions } from '@/lib/auth';
import { getPotentialPlayers } from '@/lib/draft';
import prisma from '@/lib/prisma';
import { PlayerRole, TournamentStatus, type User } from '@prisma/client';
import { sample, shuffle } from 'lodash';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

export const createTournament = async (name: string) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { message: 'Not authenticated' };
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string,
      },
    });

    if (!user || !user.isAdmin) {
      return { message: 'Not allowed' };
    }

    const createdTournament = await prisma.tournament.create({
      data: {
        name,
        createdBy: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return { message: 'Success', id: createdTournament.id };
  } catch (e) {
    return { message: (e as Error).message };
  }
};

export const endTournament = async (id: string) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { message: 'Not authenticated' };
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string,
      },
    });

    if (!user || !user.isAdmin) {
      return { message: 'Not allowed' };
    }

    const tournament = await prisma.tournament.findUnique({
      where: {
        id,
      },
      include: {
        createdBy: true,
      },
    });

    if (!tournament) {
      return { message: 'Not found' };
    }

    if (tournament.createdBy.id !== user.id) {
      return { message: 'You are not the creator of this tournament' };
    }

    const updatedTournament = await prisma.tournament.update({
      where: {
        id,
      },
      data: {
        status: TournamentStatus.FINISHED,
      },
    });

    revalidatePath('/dashboard');

    return { message: 'Success', id: updatedTournament.id };
  } catch (e) {
    return { message: (e as Error).message };
  }
};

export const createTeam = async (tournamentId: string, random: boolean, elo?: string) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { message: 'Not authenticated' };
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string,
      },
    });

    if (!user || !user.isAdmin) {
      return { message: 'Not allowed' };
    }

    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
      include: {
        participants: true,
        teams: {
          include: {
            players: true,
          },
        },
      },
    });

    if (!tournament) {
      return { message: 'Not found' };
    }

    const potentialPlayers = getPotentialPlayers(tournament, random, elo);

    if (potentialPlayers.length < 5) {
      return { message: 'Not enough players' };
    }

    const { team, filledPlayers } = pickPlayers(shuffle(potentialPlayers));

    return { message: 'Success', data: { team, filledPlayers: filledPlayers.map((p) => p.id) } };
  } catch (e) {
    return { message: (e as Error).message };
  }
};

const stripPII = (user: User | undefined) => {
  if (!user) return undefined;
  return {
    ...user,
    email: '',
    image: '',
  };
};

const pickPlayers = (players: User[]) => {
  const usedPlayers: string[] = [];
  const filledPlayers: User[] = [];
  const team = Object.values(PlayerRole)
    .filter((role) => role !== 'FILL')
    .reduce(
      (acc, role) => {
        const player = stripPII(players.find((p) => p.role === role)) as User;

        if (player) {
          acc[role] = player;
          usedPlayers.push(player.id);
        }

        return acc;
      },
      {} as Record<PlayerRole, User>,
    );

  if (Object.values(team).length < 5) {
    console.warn('Not enough players to fill a team');
    // Fill with random players
    for (const role of Object.values(PlayerRole).filter((role) => role !== 'FILL')) {
      if (!team[role as PlayerRole]) {
        console.debug('Filling role', role);
        const player = players.find((p) => usedPlayers.indexOf(p.id) === -1);
        if (player) {
          team[role as PlayerRole] = player;
          filledPlayers.push(player);
          usedPlayers.push(player.id);
        }
      }
    }
  }

  return {
    team,
    usedPlayers,
    filledPlayers,
  };
};

export const rerollPlayer = async (
  tournamentId: string,
  role: PlayerRole,
  elo?: string,
  draftedTeam?: Record<PlayerRole, User>,
) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { message: 'Not authenticated' };
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string,
      },
    });

    if (!user || !user.isAdmin) {
      return { message: 'Not allowed' };
    }

    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
      include: {
        participants: true,
        teams: {
          include: {
            players: true,
          },
        },
      },
    });

    if (!tournament) {
      return { message: 'Not found' };
    }
    const excludedPlayers = draftedTeam ? Object.values(draftedTeam).map((p) => p.id) : [];
    const potentialPlayers = getPotentialPlayers(tournament, !elo, elo).filter(
      (p) => excludedPlayers.indexOf(p.id) === -1,
    );
    const potentialRolePlayers = potentialPlayers.filter((p) => p.role === role);

    if (potentialRolePlayers.length < 1) {
      return { message: 'Success', data: sample(potentialPlayers), fill: true };
    }
    return { message: 'Success', data: sample(potentialPlayers), fill: false };
  } catch (e) {
    return { message: (e as Error).message };
  }
};

export const saveTournamentTeam = async (tournamentId: string, teamName: string, team: Record<PlayerRole, User>) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { message: 'Not authenticated' };
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string,
      },
    });

    if (!user || !user.isAdmin) {
      return { message: 'Not allowed' };
    }

    const tournament = await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
      include: {
        participants: true,
      },
    });

    if (!tournament) {
      return { message: 'Not found' };
    }

    const created = await prisma.team.create({
      data: {
        name: teamName,
        tournament: {
          connect: {
            id: tournamentId,
          },
        },
        players: {
          create: Object.entries(team).map(([role, player]) => ({
            role: role as PlayerRole,
            player: {
              connect: {
                id: player.id,
              },
            },
          })),
        },
      },
    });

    revalidatePath('/tournament/[tournamentId]', 'page');
    revalidatePath('/tournament/[tournamentId]/manage', 'page');

    return { message: 'Success', data: created };
  } catch (e) {
    return { message: (e as Error).message };
  }
};
