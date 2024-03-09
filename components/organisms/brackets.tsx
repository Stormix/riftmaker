'use client';

import type { TournamentData } from '@/app/api/tournament/[tournamentId]/route';

interface BracketsProps {
  tournament: TournamentData;
}

const Brackets = ({ tournament }: BracketsProps) => {
  return <div className="flex flex-col flex-grow gap-8">aaa</div>;
};

export default Brackets;
