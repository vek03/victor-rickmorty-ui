import { LocalStorageService } from './local-storage.service';
import { Character } from '../../models/character.model';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let mockLocalStorage: { [key: string]: string };

  // Mock character data
  const mockCharacter1: Character = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
    location: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/20' },
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    episode: ['https://rickandmortyapi.com/api/episode/1'],
    url: 'https://rickandmortyapi.com/api/character/1',
    created: '2017-11-04T18:48:46.250Z'
  };

  const mockCharacter2: Character = {
    id: 2,
    name: 'Morty Smith',
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
    location: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/20' },
    image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
    episode: ['https://rickandmortyapi.com/api/episode/1'],
    url: 'https://rickandmortyapi.com/api/character/2',
    created: '2017-11-04T18:50:21.651Z'
  };

  const mockCharacterToCreate: Character = {
    id: 3,
    name: 'Summer Smith',
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Female',
    origin: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/1' },
    location: { name: 'Earth', url: 'https://rickandmortyapi.com/api/location/20' },
    image: 'https://rickandmortyapi.com/api/character/avatar/3.jpeg',
    episode: ['https://rickandmortyapi.com/api/episode/6'],
    url: 'https://rickandmortyapi.com/api/character/3',
    created: ''
  };

  beforeEach(() => {
    service = new LocalStorageService();

    // Mock localStorage
    mockLocalStorage = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => {
          return mockLocalStorage[key] || null;
        }),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: jest.fn(() => {
          mockLocalStorage = {};
        })
      },
      writable: true
    });

    // Mock Date for consistent testing
    const mockDate = new Date('2023-11-14T10:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    Date.now = jest.fn(() => mockDate.getTime());
    Date.prototype.toISOString = jest.fn(() => mockDate.toISOString());
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createCharacter', () => {
    it('should create a character and add to localStorage when no existing characters', () => {
      const characterToCreate = { ...mockCharacterToCreate };

      service.createCharacter(characterToCreate);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'customCharacters',
        JSON.stringify([{ ...characterToCreate, created: '2023-11-14T10:00:00.000Z' }])
      );
      expect(characterToCreate.created).toBe('2023-11-14T10:00:00.000Z');
    });

    it('should create a character and append to existing characters in localStorage', () => {
      // Setup existing characters
      mockLocalStorage['customCharacters'] = JSON.stringify([mockCharacter1, mockCharacter2]);
      const characterToCreate = { ...mockCharacterToCreate };

      service.createCharacter(characterToCreate);

      const expectedCharacters = [
        mockCharacter1,
        mockCharacter2,
        { ...characterToCreate, created: '2023-11-14T10:00:00.000Z' }
      ];
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'customCharacters',
        JSON.stringify(expectedCharacters)
      );
    });
  });

  describe('getStoredCharacters', () => {
    it('should return empty array when no characters stored', () => {
      const result = service.getStoredCharacters();

      expect(result).toEqual([]);
      expect(localStorage.getItem).toHaveBeenCalledWith('customCharacters');
    });

    it('should return all stored characters when no filter provided', () => {
      mockLocalStorage['customCharacters'] = JSON.stringify([mockCharacter1, mockCharacter2]);

      const result = service.getStoredCharacters();

      expect(result).toEqual([mockCharacter1, mockCharacter2]);
    });

    it('should return filtered characters by name (case insensitive)', () => {
      mockLocalStorage['customCharacters'] = JSON.stringify([mockCharacter1, mockCharacter2]);
      const filter: Partial<Character> = { name: 'rick' };

      const result = service.getStoredCharacters(filter as Character);

      expect(result).toEqual([mockCharacter1]);
    });

    it('should return filtered characters by exact name match', () => {
      mockLocalStorage['customCharacters'] = JSON.stringify([mockCharacter1, mockCharacter2]);
      const filter: Partial<Character> = { name: 'Morty Smith' };

      const result = service.getStoredCharacters(filter as Character);

      expect(result).toEqual([mockCharacter2]);
    });

    it('should return empty array when filter name does not match any character', () => {
      mockLocalStorage['customCharacters'] = JSON.stringify([mockCharacter1, mockCharacter2]);
      const filter: Partial<Character> = { name: 'Beth Smith' };

      const result = service.getStoredCharacters(filter as Character);

      expect(result).toEqual([]);
    });

    it('should return all characters when filter is provided but name is empty', () => {
      mockLocalStorage['customCharacters'] = JSON.stringify([mockCharacter1, mockCharacter2]);
      const filter: Partial<Character> = { name: '' };

      const result = service.getStoredCharacters(filter as Character);

      expect(result).toEqual([mockCharacter1, mockCharacter2]);
    });

    it('should return all characters when filter is provided but name is undefined', () => {
      mockLocalStorage['customCharacters'] = JSON.stringify([mockCharacter1, mockCharacter2]);
      const filter: Partial<Character> = {};

      const result = service.getStoredCharacters(filter as Character);

      expect(result).toEqual([mockCharacter1, mockCharacter2]);
    });
  });

  describe('updateCharacter', () => {
    beforeEach(() => {
      mockLocalStorage['customCharacters'] = JSON.stringify([mockCharacter1, mockCharacter2]);
    });

    it('should update an existing character', () => {
      const updatedCharacter: Character = {
        ...mockCharacter1,
        name: 'Rick Sanchez Updated',
        status: 'Dead'
      };

      service.updateCharacter(updatedCharacter);

      const expectedCharacters = [updatedCharacter, mockCharacter2];
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'customCharacters',
        JSON.stringify(expectedCharacters)
      );
    });

    it('should not update when character id does not exist', () => {
      const nonExistentCharacter: Character = {
        ...mockCharacter1,
        id: 999,
        name: 'Non-existent Character'
      };

      service.updateCharacter(nonExistentCharacter);

      // Should not call setItem since character was not found
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should update the correct character when multiple characters exist', () => {
      const updatedCharacter: Character = {
        ...mockCharacter2,
        name: 'Morty Smith Updated'
      };

      service.updateCharacter(updatedCharacter);

      const expectedCharacters = [mockCharacter1, updatedCharacter];
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'customCharacters',
        JSON.stringify(expectedCharacters)
      );
    });
  });

  describe('clearStoredCharacters', () => {
    it('should remove all characters from localStorage', () => {
      mockLocalStorage['customCharacters'] = JSON.stringify([mockCharacter1, mockCharacter2]);

      service.clearStoredCharacters();

      expect(localStorage.removeItem).toHaveBeenCalledWith('customCharacters');
    });

    it('should call removeItem even when no characters are stored', () => {
      service.clearStoredCharacters();

      expect(localStorage.removeItem).toHaveBeenCalledWith('customCharacters');
    });
  });

  describe('removeCharacterById', () => {
    beforeEach(() => {
      mockLocalStorage['customCharacters'] = JSON.stringify([mockCharacter1, mockCharacter2]);
    });

    it('should remove character by id', () => {
      service.removeCharacterById(1);

      const expectedCharacters = [mockCharacter2];
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'customCharacters',
        JSON.stringify(expectedCharacters)
      );
    });

    it('should remove correct character when multiple characters exist', () => {
      service.removeCharacterById(2);

      const expectedCharacters = [mockCharacter1];
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'customCharacters',
        JSON.stringify(expectedCharacters)
      );
    });

    it('should not change storage when character id does not exist', () => {
      service.removeCharacterById(999);

      const expectedCharacters = [mockCharacter1, mockCharacter2];
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'customCharacters',
        JSON.stringify(expectedCharacters)
      );
    });

    it('should handle empty characters array', () => {
      mockLocalStorage['customCharacters'] = JSON.stringify([]);

      service.removeCharacterById(1);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'customCharacters',
        JSON.stringify([])
      );
    });

    it('should remove all matching characters with the same id', () => {
      const duplicateCharacter = { ...mockCharacter1, name: 'Duplicate Rick' };
      mockLocalStorage['customCharacters'] = JSON.stringify([mockCharacter1, duplicateCharacter, mockCharacter2]);

      service.removeCharacterById(1);

      const expectedCharacters = [mockCharacter2];
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'customCharacters',
        JSON.stringify(expectedCharacters)
      );
    });
  });
});
