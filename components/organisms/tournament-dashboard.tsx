'use client';

import { TournamentStatus } from '@prisma/client';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { TournamentData } from '@/app/api/tournament/[tournamentId]/route';
import { useState } from 'react';
import CreateTeam from '../molecules/create-team';
import InviteLink from '../molecules/invite-link';
import ParticipantsTable from '../molecules/participants-table';
import PickRandom from '../molecules/pick-random';
import TeamsTable from '../molecules/teams-table';
import TournamentControls from '../molecules/tournament-controls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LuSwords, LuUsers2, LuUserX } from 'react-icons/lu';
import Status from '../tournament-status';
import { TbTournament } from 'react-icons/tb';
import Brackets from './brackets';
import api from '@/lib/api';
import CreateBracket from '../molecules/create-bracket';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
});

interface TournamentDashboardProps {
  tournamentId: string;
}

const TournamentDashboardConsumer = ({ tournamentId }: TournamentDashboardProps) => {
  const [open, setOpen] = useState(false);
  const { error, data } = useQuery('tounament', () => api.get<TournamentData>(`/api/tournament/${tournamentId}`), {
    refetchInterval: 5_000,
  });

  if (error) return 'An error has occurred: ' + (error as Error).message;

  const tournament = data!.data;

  return (
    <div className="flex flex-col gap-8 ">
      <div className="flex flex-row justify-between gap-4 font-sans flex-grow">
        <div className="flex gap-4 items-center">
          <h1 className="text-4xl font-bold">{tournament.name}</h1>
          <Status status={tournament.status} />
        </div>
        {tournament.status !== TournamentStatus.FINISHED && <TournamentControls tournament={tournament} />}
      </div>

      {(
        [
          TournamentStatus.CREATED,
          TournamentStatus.ACCEPTING_PARTICIPANTS,
          TournamentStatus.READY,
        ] as TournamentStatus[]
      ).includes(tournament.status) && <InviteLink tournament={tournament} />}

      <Tabs defaultValue="participants" className="w-full h-full">
        <TabsList className="h-12 px-2 gap-4">
          <TabsTrigger className="uppercase text-xl" value="participants">
            <LuUsers2 className="w-4 h-4 mr-2" />
            Participants
          </TabsTrigger>
          <TabsTrigger className="uppercase text-xl" value="teams">
            <LuSwords className="w-4 h-4 mr-2" />
            Teams
          </TabsTrigger>
          <TabsTrigger className="uppercase text-xl" value="brackets">
            <TbTournament className="w-4 h-4 mr-2" />
            Brackets
          </TabsTrigger>
          <TabsTrigger className="uppercase text-xl" value="blacklisted">
            <LuUserX className="w-4 h-4 mr-2" />
            Blacklisted
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="w-full flex-grow py-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 justify-between items-center">
              <h3 className="text-3xl font-semibold">Teams:</h3>
              <div className="space-x-2">
                <CreateTeam tournament={tournament} />
                <PickRandom tournamentId={tournamentId} open={open} onOpenChange={setOpen} />
              </div>
            </div>
            <TeamsTable data={tournament.teams} />
          </div>
        </TabsContent>
        <TabsContent value="participants" className="w-full flex-grow py-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-3xl font-semibold">Participants:</h3>
            <ParticipantsTable data={tournament.participants} />
          </div>
        </TabsContent>
        <TabsContent value="blacklisted" className="w-full flex-grow py-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-3xl font-semibold">Blacklist Players:</h3>
            <ParticipantsTable data={tournament.kickedPlayers} />
          </div>
        </TabsContent>
        <TabsContent value="brackets" className="w-full flex-grow py-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 justify-between items-center">
              <h3 className="text-3xl font-semibold">Brackets:</h3>
              <CreateBracket tournament={tournament} />
            </div>
            <div className="space-x-2">
              <Brackets tournament={tournament} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TournamentDashboard = ({ tournamentId }: TournamentDashboardProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TournamentDashboardConsumer tournamentId={tournamentId} />
    </QueryClientProvider>
  );
};

export default TournamentDashboard;
