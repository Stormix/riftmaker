'use server';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export interface ValidateTournamentAccessOptions {
  adminOnly?: boolean;
  creatorOnly?: boolean;
}

export const validateTournamentAccess = async (
  tournamentId: string,
  options: ValidateTournamentAccessOptions = {
    adminOnly: true,
    creatorOnly: true,
  },
) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user?.email as string,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (options.adminOnly && !user.isAdmin) {
    throw new Error('User not an admin');
  }

  const tounament = await prisma.tournament.findUnique({
    where: {
      id: tournamentId,
    },
    include: {
      createdBy: true,
      teams: true,
    },
  });

  if (!tounament) {
    throw new Error('Tournament not found');
  }

  if (options.creatorOnly && tounament.createdBy.id !== user.id) {
    throw new Error('You are not the creator of this tournament');
  }

  return tounament;
};
