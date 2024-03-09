import { mapPlayer } from '@/lib/draft';
import { PlayerRole, Team, Tournament, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      tournamentId: string;
    };
  },
) {
  const { tournamentId } = params;

  if (!tournamentId) {
    return NextResponse.json(
      {
        message: 'Missing tournamentId',
      },
      {
        status: 400,
      },
    );
  }

  const tournament = await prisma.tournament.findUnique({
    where: {
      id: tournamentId,
    },
    include: {
      participants: true,
      kickedPlayers: true,
      teams: {
        include: {
          players: {
            include: {
              player: true,
            },
          },
        },
      },
    },
  });

  if (!tournament) {
    return NextResponse.json(
      {
        message: 'Tournament not found',
      },
      {
        status: 404,
      },
    );
  }

  const data = await mapTournament(tournament);

  return NextResponse.json(data);
}

const mapTournament = async (
  tournament: Tournament & {
    participants: User[];
    kickedPlayers: User[];
    teams: Array<
      Team & {
        players: Array<{
          role: PlayerRole;
          player: User;
        }>;
      }
    >;
  },
) => ({
  ...tournament,
  brackets: null,
  participants: tournament.participants.map((participant) => ({
    ...mapPlayer(participant),
    tournamentId: tournament.id,
    kicked: tournament.kickedPlayers.some((kickedPlayer) => kickedPlayer.id === participant.id),
  })),
  kickedPlayers: tournament.kickedPlayers.map((participant) => ({
    ...mapPlayer(participant),
    tournamentId: tournament.id,
    kicked: true,
  })),
  teams: tournament.teams.map((team) => ({
    id: team.id,
    name: team.name,
    tournamentId: tournament.id,
    players: team.players.map((player) => {
      const p = mapPlayer(player.player);
      return {
        ...p,
        mainRole: p.role as PlayerRole,
        role: player.role as PlayerRole,
      };
    }),
  })),
});

export type TournamentData = Awaited<ReturnType<typeof mapTournament>>;
