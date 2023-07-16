enum ArenaStatus {
  Open,
  Closed,
  Finished,
}
enum FixtureResult {
  Pending,
  Home,
  Draw,
  Away,
  Cancelled,
}
enum BetProno {
  None,
  Home,
  Draw,
  Away,
}

interface Game {
  id: number;
  state: FixtureResult;
  winningProno: BetProno;
}

type ArenaType = {
  address: string;
  entryCost: number;
  participantsNumber: number;
  status: ArenaStatus;
  winners: number[];
  games: Game[];
};

export { ArenaStatus, FixtureResult, BetProno };
export type { Game, ArenaType };
