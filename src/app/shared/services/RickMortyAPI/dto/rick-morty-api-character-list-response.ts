import { Character } from "../../../models/character.model";

export interface RickMortyAPICharacterListResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Array<Character>;
}
