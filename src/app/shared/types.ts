export interface GameInfo {
  maxPlayers: number;
  category: string;
  isNew: boolean;
  letterWord: string[][];
  letters?: {
    correct?: string[];
    incorrect?: string[];
  };
  'updated-on': number;
}
