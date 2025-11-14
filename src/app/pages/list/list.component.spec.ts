import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListComponent } from './list.component';
import { RickMortyAPIService } from '../../shared/services/RickMortyAPI/rick-morty-api.service';
import { LocalStorageService } from '../../shared/services/LocalStorage/local-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Character } from '../../shared/models/character.model';
import { RickMortyAPICharacterListResponse } from '../../shared/services/RickMortyAPI/dto/rick-morty-api-character-list-response';
import Swal from 'sweetalert2';
import { CharacterDetailDialogComponent } from './components/character-detail-dialog/character-detail-dialog.component';

// Mock Swal
jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({ isConfirmed: true })
}));

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let mockRickMortyAPIService: jest.Mocked<RickMortyAPIService>;
  let mockLocalStorageService: jest.Mocked<LocalStorageService>;
  let mockMatDialog: jest.Mocked<MatDialog>;
  let mockEndOfListElement: jest.Mocked<ElementRef>;

  const mockCharacter: Character = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: { name: 'Earth (C-137)', url: '' },
    location: { name: 'Citadel of Ricks', url: '' },
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    episode: ['https://rickandmortyapi.com/api/episode/1'],
    url: 'https://rickandmortyapi.com/api/character/1',
    created: '2017-11-04T18:48:46.250Z'
  };

  const mockAPIResponse: RickMortyAPICharacterListResponse = {
    info: {
      count: 826,
      pages: 42,
      next: 'https://rickandmortyapi.com/api/character/?page=2',
      prev: null
    },
    results: [mockCharacter]
  };

  beforeEach(async () => {
    // Create mocks
    mockRickMortyAPIService = {
      getCharacters: jest.fn(),
      getMultipleCharacters: jest.fn(),
      getCharacterById: jest.fn()
    } as any;

    mockLocalStorageService = {
      createCharacter: jest.fn(),
      getStoredCharacters: jest.fn(),
      updateCharacter: jest.fn(),
      clearStoredCharacters: jest.fn(),
      removeCharacterById: jest.fn()
    } as any;

    mockMatDialog = {
      open: jest.fn()
    } as any;

    mockEndOfListElement = {
      nativeElement: document.createElement('div')
    } as any;

    await TestBed.configureTestingModule({
      declarations: [ListComponent],
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: RickMortyAPIService, useValue: mockRickMortyAPIService },
        { provide: LocalStorageService, useValue: mockLocalStorageService },
        { provide: MatDialog, useValue: mockMatDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;

    // Mock viewChild signal
    (component as any).endOfList = jest.fn().mockReturnValue(mockEndOfListElement);

    // Mock IntersectionObserver
    const mockIntersectionObserver = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    };

    global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
      component.observer = mockIntersectionObserver as any;
      return mockIntersectionObserver;
    });

    // Setup default mocks
    mockLocalStorageService.getStoredCharacters.mockReturnValue([]);
    mockRickMortyAPIService.getCharacters.mockReturnValue(of(mockAPIResponse));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component properly', () => {
      const searchCharactersSpy = jest.spyOn(component, 'searchCharacters');

      component.ngOnInit();

      expect(searchCharactersSpy).toHaveBeenCalled();
      expect(global.IntersectionObserver).toHaveBeenCalled();
      expect(component.endOfList).toHaveBeenCalled();
      expect(component.observer.observe).toHaveBeenCalledWith(mockEndOfListElement.nativeElement);
    });

    it('should create intersection observer that calls loadMore when intersecting and not loading', () => {
      const loadMoreSpy = jest.spyOn(component, 'loadMore');
      component.loading.set(false);

      component.ngOnInit();

      // Get the callback function passed to IntersectionObserver
      const observerCallback = (global.IntersectionObserver as jest.Mock).mock.calls[0][0];

      // Simulate intersection
      observerCallback([{ isIntersecting: true }]);

      expect(loadMoreSpy).toHaveBeenCalled();
    });

    it('should not call loadMore when not intersecting', () => {
      const loadMoreSpy = jest.spyOn(component, 'loadMore');
      component.loading.set(false);

      component.ngOnInit();

      // Get the callback function passed to IntersectionObserver
      const observerCallback = (global.IntersectionObserver as jest.Mock).mock.calls[0][0];

      // Simulate no intersection
      observerCallback([{ isIntersecting: false }]);

      expect(loadMoreSpy).not.toHaveBeenCalled();
    });

    it('should not call loadMore when loading is true', () => {
      const loadMoreSpy = jest.spyOn(component, 'loadMore');

      // First initialize without loading
      component.ngOnInit();

      // Now set loading to true
      component.loading.set(true);

      // Get the callback function passed to IntersectionObserver
      const observerCallback = (global.IntersectionObserver as jest.Mock).mock.calls[0][0];

      // Reset spy to clear any previous calls from initialization
      loadMoreSpy.mockClear();

      // Simulate intersection while loading
      observerCallback([{ isIntersecting: true }]);

      expect(loadMoreSpy).not.toHaveBeenCalled();
    });
  });

  describe('onSearchChange', () => {
    it('should call searchCharacters with search term', () => {
      const searchCharactersSpy = jest.spyOn(component, 'searchCharacters');
      const searchTerm = 'Rick';

      component.searchForm.get('searchTerm')?.setValue(searchTerm);
      component.onSearchChange();

      expect(searchCharactersSpy).toHaveBeenCalledWith({ name: searchTerm } as Character);
    });

    it('should log search term change', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const searchTerm = 'Morty';

      component.searchForm.get('searchTerm')?.setValue(searchTerm);
      component.onSearchChange();

      expect(consoleSpy).toHaveBeenCalledWith('Search term changed:', searchTerm);

      consoleSpy.mockRestore();
    });

    it('should handle null search term', () => {
      const searchCharactersSpy = jest.spyOn(component, 'searchCharacters');

      component.searchForm.get('searchTerm')?.setValue(null);
      component.onSearchChange();

      expect(searchCharactersSpy).toHaveBeenCalledWith({ name: null } as any);
    });
  });

  describe('openCreateCharacterDialog', () => {
    it('should open dialog with new character data', () => {
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of({ editedCharacter: mockCharacter }))
      };
      mockMatDialog.open.mockReturnValue(mockDialogRef as any);
      const addCharacterSpy = jest.spyOn(component, 'addCharacter');

      component.openCreateCharacterDialog();

      expect(mockMatDialog.open).toHaveBeenCalledWith(CharacterDetailDialogComponent, {
        data: expect.objectContaining({
          id: expect.any(Number),
          name: '',
          status: 'unknown',
          species: '',
          type: '',
          gender: 'unknown',
          origin: { name: '', url: '' },
          location: { name: '', url: '' },
          image: '',
          episode: [],
          url: '',
          created: ''
        }),
        panelClass: 'custom-dialog-container'
      });

      expect(addCharacterSpy).toHaveBeenCalledWith(mockCharacter);
    });

    it('should not call addCharacter when dialog is cancelled', () => {
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of(undefined))
      };
      mockMatDialog.open.mockReturnValue(mockDialogRef as any);
      const addCharacterSpy = jest.spyOn(component, 'addCharacter');

      component.openCreateCharacterDialog();

      expect(addCharacterSpy).not.toHaveBeenCalled();
    });

    it('should not call addCharacter when result has no editedCharacter', () => {
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of({ editedCharacter: null }))
      };
      mockMatDialog.open.mockReturnValue(mockDialogRef as any);
      const addCharacterSpy = jest.spyOn(component, 'addCharacter');

      component.openCreateCharacterDialog();

      expect(addCharacterSpy).not.toHaveBeenCalled();
    });
  });

  describe('loadMore', () => {
    beforeEach(() => {
      component.pagination.set({ page: 1, totalPages: 5, totalCharacters: 100 });
    });

    it('should load more characters successfully', () => {
      const existingCharacters = [mockCharacter];
      component.characters.set(existingCharacters);
      component.searchForm.get('searchTerm')?.setValue('test');

      const newCharacter = { ...mockCharacter, id: 2, name: 'Morty' };
      const newResponse = { ...mockAPIResponse, results: [newCharacter] };
      mockRickMortyAPIService.getCharacters.mockReturnValue(of(newResponse));

      component.loadMore();

      expect(component.loading()).toBe(false);
      expect(component.pagination().page).toBe(2);
      expect(component.characters()).toEqual([...existingCharacters, newCharacter]);
      expect(mockRickMortyAPIService.getCharacters).toHaveBeenCalledWith(
        { name: 'test' } as Character,
        2
      );
    });

    it('should not load more when already at last page', () => {
      component.pagination.set({ page: 5, totalPages: 5, totalCharacters: 100 });
      const getCharactersSpy = mockRickMortyAPIService.getCharacters;

      component.loadMore();

      expect(getCharactersSpy).not.toHaveBeenCalled();
    });

    it('should handle error when loading more characters', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = { status: 500, message: 'Server error' };
      mockRickMortyAPIService.getCharacters.mockReturnValue(throwError(() => error));

      component.loadMore();

      expect(component.loading()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching more characters:', error);
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'Oops...',
        text: 'Erro ao buscar mais personagens. Por favor, tente novamente mais tarde.',
      });

      consoleSpy.mockRestore();
    });
  });

  describe('searchCharacters', () => {
    it('should search characters successfully without filter', () => {
      const storedCharacters = [{ ...mockCharacter, id: 999 }];
      mockLocalStorageService.getStoredCharacters.mockReturnValue(storedCharacters);

      component.searchCharacters();

      expect(component.loading()).toBe(false);
      expect(component.pagination()).toEqual({
        page: 1,
        totalPages: mockAPIResponse.info.pages,
        totalCharacters: mockAPIResponse.info.count + storedCharacters.length
      });
      expect(component.characters()).toEqual([...storedCharacters, ...mockAPIResponse.results]);
    });

    it('should search characters with filter', () => {
      const filter = { name: 'Rick' } as Character;
      const storedCharacters = [{ ...mockCharacter, id: 999 }];
      mockLocalStorageService.getStoredCharacters.mockReturnValue(storedCharacters);

      component.searchCharacters(filter);

      expect(mockRickMortyAPIService.getCharacters).toHaveBeenCalledWith(filter);
      expect(mockLocalStorageService.getStoredCharacters).toHaveBeenCalledWith(filter);
    });

    it('should handle 404 error and show only stored characters', () => {
      const filter = { name: 'NonExistent' } as Character;
      const storedCharacters = [{ ...mockCharacter, id: 999 }];
      mockLocalStorageService.getStoredCharacters.mockReturnValue(storedCharacters);

      const error404 = { status: 404 };
      mockRickMortyAPIService.getCharacters.mockReturnValue(throwError(() => error404));
      const updatePagination404Spy = jest.spyOn(component, 'updatePagination404');

      component.searchCharacters(filter);

      expect(component.loading()).toBe(false);
      expect(updatePagination404Spy).toHaveBeenCalledWith(storedCharacters);
    });

    it('should handle non-404 errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error500 = { status: 500, message: 'Server error' };
      mockRickMortyAPIService.getCharacters.mockReturnValue(throwError(() => error500));

      component.searchCharacters();

      expect(component.loading()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching characters:', error500);
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'Oops...',
        text: 'Erro ao buscar personagens. Por favor, tente novamente mais tarde.',
      });

      consoleSpy.mockRestore();
    });
  });

  describe('updateCharacter', () => {
    it('should update existing character', () => {
      const existingCharacters = [mockCharacter, { ...mockCharacter, id: 2 }];
      component.characters.set(existingCharacters);
      component.searchForm.get('searchTerm')?.setValue('test');

      const updatedCharacter = { ...mockCharacter, name: 'Updated Rick' };
      const searchCharactersSpy = jest.spyOn(component, 'searchCharacters');

      component.updateCharacter(updatedCharacter);

      expect(mockLocalStorageService.updateCharacter).toHaveBeenCalledWith(updatedCharacter);
      expect(searchCharactersSpy).toHaveBeenCalledWith({ name: 'test' } as Character);
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: 'Sucesso',
        text: 'Personagem atualizado com sucesso!',
      });
    });

    it('should add character if not found in current list', () => {
      const existingCharacters = [{ ...mockCharacter, id: 2 }];
      component.characters.set(existingCharacters);

      const newCharacter = { ...mockCharacter, id: 999, name: 'New Character' };
      const addCharacterSpy = jest.spyOn(component, 'addCharacter');

      component.updateCharacter(newCharacter);

      expect(addCharacterSpy).toHaveBeenCalledWith(newCharacter);
    });
  });

  describe('updatePagination404', () => {
    it('should update pagination for 404 scenarios', () => {
      const storedCharacters = [mockCharacter, { ...mockCharacter, id: 2 }];

      component.updatePagination404(storedCharacters);

      expect(component.characters()).toEqual(storedCharacters);
      expect(component.pagination()).toEqual({
        page: 1,
        totalPages: 1,
        totalCharacters: storedCharacters.length
      });
    });

    it('should handle empty stored characters', () => {
      const storedCharacters: Character[] = [];

      component.updatePagination404(storedCharacters);

      expect(component.characters()).toEqual([]);
      expect(component.pagination()).toEqual({
        page: 1,
        totalPages: 1,
        totalCharacters: 0
      });
    });
  });

  describe('addCharacter', () => {
    it('should add character and refresh list', () => {
      const newCharacter = { ...mockCharacter, id: 999, name: 'New Character' };
      component.searchForm.get('searchTerm')?.setValue('test');
      const searchCharactersSpy = jest.spyOn(component, 'searchCharacters');

      component.addCharacter(newCharacter);

      expect(mockLocalStorageService.createCharacter).toHaveBeenCalledWith(newCharacter);
      expect(searchCharactersSpy).toHaveBeenCalledWith({ name: 'test' } as Character);
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: 'Sucesso',
        text: 'Personagem criado com sucesso!',
      });
    });
  });

  describe('removeCharacter', () => {
    it('should remove character and refresh list', () => {
      const characterToRemove = { ...mockCharacter, id: 999 };
      component.searchForm.get('searchTerm')?.setValue('test');
      const searchCharactersSpy = jest.spyOn(component, 'searchCharacters');

      component.removeCharacter(characterToRemove);

      expect(mockLocalStorageService.removeCharacterById).toHaveBeenCalledWith(characterToRemove.id);
      expect(searchCharactersSpy).toHaveBeenCalledWith({ name: 'test' } as Character);
      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: 'Sucesso',
        text: 'Personagem removido com sucesso!',
      });
    });
  });

  describe('form initialization', () => {
    it('should initialize search form with empty searchTerm', () => {
      expect(component.searchForm.get('searchTerm')?.value).toBe('');
    });
  });

  describe('signals initialization', () => {
    it('should initialize characters signal as empty array', () => {
      expect(component.characters()).toEqual([]);
    });

    it('should initialize pagination signal with default values', () => {
      expect(component.pagination()).toEqual({
        page: 1,
        totalPages: 1,
        totalCharacters: 0
      });
    });

    it('should initialize loading signal as false', () => {
      expect(component.loading()).toBe(false);
    });
  });
});
