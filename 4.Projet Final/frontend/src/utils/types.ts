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
  name: string;
  creator: string;
  isPrivate: boolean;
};

export { ArenaStatus, FixtureResult, BetProno };
export type { Game, ArenaType };

export type FixturesResponseData = {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number;
      second: number;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean;
    };
  };
  goals: {
    home: number;
    away: number;
  };
  score: {
    halftime: {
      home: number;
      away: number;
    };
    fulltime: {
      home: number;
      away: number;
    };
    extratime: {
      home: any;
      away: any;
    };
    penalty: {
      home: any;
      away: any;
    };
  };
  events: Array<{
    time: {
      elapsed: number;
      extra?: number;
    };
    team: {
      id: number;
      name: string;
      logo: string;
    };
    player: {
      id: number;
      name: string;
    };
    assist: {
      id?: number;
      name?: string;
    };
    type: string;
    detail: string;
    comments?: string;
  }>;
  lineups: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
      colors: {
        player: {
          primary: string;
          number: string;
          border: string;
        };
        goalkeeper: {
          primary: string;
          number: string;
          border: string;
        };
      };
    };
    coach: {
      id: number;
      name: string;
      photo: string;
    };
    formation: string;
    startXI: Array<{
      player: {
        id: number;
        name: string;
        number: number;
        pos: string;
        grid: string;
      };
    }>;
    substitutes: Array<{
      player: {
        id: number;
        name: string;
        number: number;
        pos: string;
        grid: any;
      };
    }>;
  }>;
  statistics: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    statistics: Array<{
      type: string;
      value: any;
    }>;
  }>;
  players: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
      update: string;
    };
    players: Array<{
      player: {
        id: number;
        name: string;
        photo: string;
      };
      statistics: Array<{
        games: {
          minutes?: number;
          number: number;
          position: string;
          rating?: string;
          captain: boolean;
          substitute: boolean;
        };
        offsides?: number;
        shots: {
          total?: number;
          on?: number;
        };
        goals: {
          total?: number;
          conceded: number;
          assists?: number;
          saves?: number;
        };
        passes: {
          total?: number;
          key?: number;
          accuracy?: string;
        };
        tackles: {
          total?: number;
          blocks?: number;
          interceptions?: number;
        };
        duels: {
          total?: number;
          won?: number;
        };
        dribbles: {
          attempts?: number;
          success?: number;
          past?: number;
        };
        fouls: {
          drawn?: number;
          committed?: number;
        };
        cards: {
          yellow: number;
          red: number;
        };
        penalty: {
          won: any;
          commited: any;
          scored: number;
          missed: number;
          saved?: number;
        };
      }>;
    }>;
  }>;
};
