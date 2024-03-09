import BackButton from '@/components/molecules/back-button';
import TournamentDashboard from '@/components/organisms/tournament-dashboard';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

const ManageTournament = async ({
  params,
}: {
  params: {
    tournamentId: string;
  };
}) => {
  const { tournamentId } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    return <div>Not authorized</div>;
  }

  return (
    <main className="flex flex-col gap-16 px-24 w-full flex-grow overflow-y-auto">
      <BackButton />
      <Suspense>
        <TournamentDashboard tournamentId={tournamentId} />
      </Suspense>
    </main>
  );
};

export default ManageTournament;
