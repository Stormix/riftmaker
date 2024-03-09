import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { TournamentData } from '@/app/api/tournament/[tournamentId]/route';
import { createBracket } from '@/app/tournament/[tournamentId]/actions';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState } from 'react';
import { Input } from '../ui/input';
import { MultiSelect } from '../ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';
import useAction from '@/hooks/useAction';
import { StageType } from '@prisma/client';

interface CreateBracketProps {
  tournament: TournamentData;
}

const createBracketSchema = z.object({
  name: z.string(),
  type: z.nativeEnum(StageType),
  teams: z.array(z.string()),
});

const CreateBracket = ({ tournament }: CreateBracketProps) => {
  const form = useForm<z.infer<typeof createBracketSchema>>({
    resolver: zodResolver(createBracketSchema),
    defaultValues: {
      name: '',
      type: StageType.SINGLE_ELIMINATION,
      teams: [],
    },
  });

  const { toast } = useToast();

  const { execute, loading } = useAction<typeof createBracket>(createBracket, () => {
    toast({
      title: 'Success',
      description: 'Bracket created successfully',
    });
  });

  const onCreate = async (data: z.infer<typeof createBracketSchema>) => {
    await execute({
      tournamentId: tournament.id,
      bracketName: data.name,
      teamsIds: data.teams,
      stageType: data.type,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Bracket</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create tournament bracket</DialogTitle>
          <DialogDescription>
            Create a new bracket for the <strong>{tournament.name}</strong> tournament.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onCreate)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bracket Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Bracket name.." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bracket Type:</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bracket type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(StageType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participating teams:</FormLabel>
                  <MultiSelect
                    selected={field.value}
                    options={tournament.teams.map((team) => ({ label: team.name, value: team.id }))}
                    {...field}
                    className="sm:w-[510px]"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" loading={loading} className="mx-auto">
              Create
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBracket;
