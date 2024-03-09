'use client';

import { TournamentData } from '@/app/api/tournament/[tournamentId]/route';
import { createBracket, updateMatchScores } from '@/app/tournament/[tournamentId]/actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import useAction from '@/hooks/useAction';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil1Icon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { MatchWithTeams } from '../providers/stage-provider';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';

interface EditMatchProps {
  tournament: TournamentData;
  match: MatchWithTeams;
}

const editMatchSchema = z.object({
  opponent1Score: z.coerce.number().min(0).max(1),
  opponent2Score: z.coerce.number().min(0).max(1),
});

const EditMatch = ({ tournament, match }: EditMatchProps) => {
  const form = useForm<z.infer<typeof editMatchSchema>>({
    resolver: zodResolver(editMatchSchema),
    defaultValues: {
      opponent1Score: match.opponent1.score ?? 0,
      opponent2Score: match.opponent2.score ?? 0,
    },
  });

  const { toast } = useToast();

  const { execute, loading } = useAction<typeof updateMatchScores>(updateMatchScores, () => {
    toast({
      title: 'Success',
      description: 'Match updated successfully',
    });
  });

  const onSaveScore = async (data: z.infer<typeof editMatchSchema>) => {
    await execute(tournament.id, match.id as string, [data.opponent1Score, data.opponent2Score]);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" icon={<Pencil1Icon />} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report match scores</DialogTitle>
          <DialogDescription>
            Set the scores for the match between <b>{match.opponent1.team?.name}</b> and{' '}
            <b>{match.opponent2.team?.name}</b>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSaveScore)} className="space-y-8">
            <FormField
              control={form.control}
              name="opponent1Score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{match.opponent1.team?.name}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="opponent2Score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{match.opponent2.team?.name}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" loading={loading} className="mx-auto">
              Submit Scores
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMatch;
