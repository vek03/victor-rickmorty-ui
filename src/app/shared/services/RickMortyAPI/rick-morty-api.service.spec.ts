import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RickMortyAPIService } from './rick-morty-api.service';
import { Character } from '../../models/character.model';
import { RickMortyAPICharacterListResponse } from './dto/rick-morty-api-character-list-response';
import { environment } from '../../../../environments/environments';

describe('RickMortyAPIService', () => {
  let service: RickMortyAPIService;
  let httpMock: HttpTestingController;

  const mockCharacter: Character = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: {
      name: 'Earth (C-137)',
      url: 'https://rickandmortyapi.com/api/location/1'
    },
    location: {
      name: 'Citadel of Ricks',
      url: 'https://rickandmortyapi.com/api/location/3'
    },
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    episode: ['https://rickandmortyapi.com/api/episode/1'],
    url: 'https://rickandmortyapi.com/api/character/1',
    created: '2017-11-04T18:48:46.250Z'
  };

  const mockCharacterListResponse: RickMortyAPICharacterListResponse = {
    info: {
      count: 826,
      pages: 42,
      next: 'https://rickandmortyapi.com/api/character?page=2',
      prev: null
    },
    results: [mockCharacter]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RickMortyAPIService]
    });

    service = TestBed.inject(RickMortyAPIService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCharacters', () => {
    it('should get characters without filter or page', () => {
      service.getCharacters().subscribe(response => {
        expect(response).toEqual(mockCharacterListResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/character/`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockCharacterListResponse);
    });

    it('should get characters with page parameter only', () => {
      const page = 2;

      service.getCharacters(undefined, page).subscribe(response => {
        expect(response).toEqual(mockCharacterListResponse);
      });

      const req = httpMock.expectOne(req => 
        req.url === `${environment.apiUrl}/character/` && 
        req.params.get('page') === '2'
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('2');
      req.flush(mockCharacterListResponse);
    });

    it('should get characters with filter parameters', () => {
      const filter: Partial<Character> = {
        name: 'Rick',
        status: 'Alive',
        species: 'Human',
        gender: 'Male'
      };

      service.getCharacters(filter as Character).subscribe(response => {
        expect(response).toEqual(mockCharacterListResponse);
      });

      const req = httpMock.expectOne(req => 
        req.url === `${environment.apiUrl}/character/` && 
        req.params.get('name') === 'Rick' &&
        req.params.get('status') === 'Alive' &&
        req.params.get('species') === 'Human' &&
        req.params.get('gender') === 'Male'
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('name')).toBe('Rick');
      expect(req.request.params.get('status')).toBe('Alive');
      expect(req.request.params.get('species')).toBe('Human');
      expect(req.request.params.get('gender')).toBe('Male');
      req.flush(mockCharacterListResponse);
    });

    it('should get characters with filter and page parameters', () => {
      const filter: Partial<Character> = {
        name: 'Morty',
        status: 'Alive'
      };
      const page = 3;

      service.getCharacters(filter as Character, page).subscribe(response => {
        expect(response).toEqual(mockCharacterListResponse);
      });

      const req = httpMock.expectOne(req => 
        req.url === `${environment.apiUrl}/character/` && 
        req.params.get('name') === 'Morty' &&
        req.params.get('status') === 'Alive' &&
        req.params.get('page') === '3'
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('name')).toBe('Morty');
      expect(req.request.params.get('status')).toBe('Alive');
      expect(req.request.params.get('page')).toBe('3');
      req.flush(mockCharacterListResponse);
    });

    it('should exclude undefined, null and empty string values from filter', () => {
      const filter: Partial<Character> = {
        name: 'Rick',
        status: undefined as any,
        species: null as any,
        type: '',
        gender: 'Male'
      };

      service.getCharacters(filter as Character).subscribe(response => {
        expect(response).toEqual(mockCharacterListResponse);
      });

      const req = httpMock.expectOne(req => 
        req.url === `${environment.apiUrl}/character/` && 
        req.params.get('name') === 'Rick' &&
        req.params.get('gender') === 'Male' &&
        !req.params.has('status') &&
        !req.params.has('species') &&
        !req.params.has('type')
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('name')).toBe('Rick');
      expect(req.request.params.get('gender')).toBe('Male');
      expect(req.request.params.has('status')).toBe(false);
      expect(req.request.params.has('species')).toBe(false);
      expect(req.request.params.has('type')).toBe(false);
      req.flush(mockCharacterListResponse);
    });

    it('should include 0 as a valid filter value', () => {
      const filter: Partial<Character> = {
        id: 0
      };

      service.getCharacters(filter as Character).subscribe(response => {
        expect(response).toEqual(mockCharacterListResponse);
      });

      const req = httpMock.expectOne(req => 
        req.url === `${environment.apiUrl}/character/` && 
        req.params.get('id') === '0'
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('id')).toBe('0');
      req.flush(mockCharacterListResponse);
    });
  });

  describe('getMultipleCharacters', () => {
    it('should get multiple characters by ids', () => {
      const ids = [1, 2, 3];
      const mockCharacters = [mockCharacter];

      service.getMultipleCharacters(ids).subscribe(characters => {
        expect(characters).toEqual(mockCharacters);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/character/1,2,3`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacters);
    });

    it('should handle single character id', () => {
      const ids = [1];
      const mockCharacters = [mockCharacter];

      service.getMultipleCharacters(ids).subscribe(characters => {
        expect(characters).toEqual(mockCharacters);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/character/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacters);
    });

    it('should handle empty ids array', () => {
      const ids: number[] = [];
      const mockCharacters: Character[] = [];

      service.getMultipleCharacters(ids).subscribe(characters => {
        expect(characters).toEqual(mockCharacters);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/character/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacters);
    });
  });

  describe('getCharacterById', () => {
    it('should get character by id', () => {
      const characterId = 1;

      service.getCharacterById(characterId).subscribe(character => {
        expect(character).toEqual(mockCharacter);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/character/${characterId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacter);
    });

    it('should handle different character ids', () => {
      const characterId = 42;

      service.getCharacterById(characterId).subscribe(character => {
        expect(character).toEqual(mockCharacter);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/character/${characterId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCharacter);
    });
  });
});
