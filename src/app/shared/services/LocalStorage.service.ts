import { Injectable } from '@angular/core';
import { Character } from '../models/character.model';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  createCharacter(character: Character): void {
    const storedCharacters = this.getStoredCharacters();
    character.created = new Date().toISOString();
    storedCharacters.push(character);
    localStorage.setItem('customCharacters', JSON.stringify(storedCharacters));
  }

  getStoredCharacters(filter?: Character): Character[] {
    const stored = localStorage.getItem('customCharacters');
    let characters = stored ? JSON.parse(stored) : [];

    if (filter && filter.name) {
      characters = characters.filter((char: Character) =>
        char.name.toLowerCase().includes(filter.name.toLowerCase())
      );
    }

    return characters;
  }

  updateCharacter(updatedCharacter: Character): void {
    const storedCharacters = this.getStoredCharacters();
    const index = storedCharacters.findIndex(char => char.id === updatedCharacter.id);

    if (index !== -1) {
      storedCharacters[index] = updatedCharacter;
      localStorage.setItem('customCharacters', JSON.stringify(storedCharacters));
    }
  }

  clearStoredCharacters(): void {
    localStorage.removeItem('customCharacters');
  }

  removeCharacterById(id: number): void {
    const storedCharacters = this.getStoredCharacters();
    const updatedCharacters = storedCharacters.filter(char => char.id !== id);
    localStorage.setItem('customCharacters', JSON.stringify(updatedCharacters));
  }
}
