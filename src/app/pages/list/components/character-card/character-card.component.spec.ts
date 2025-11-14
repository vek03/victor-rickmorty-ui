import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CharacterCardComponent } from './character-card.component';
import { Character } from '../../../../shared/models/character.model';
import { MatCardModule } from '@angular/material/card';

// Mock CharacterDetailDialogComponent to avoid SweetAlert2 issues
class MockCharacterDetailDialogComponent {}

describe('CharacterCardComponent', () => {
  let component: CharacterCardComponent;
  let fixture: ComponentFixture<CharacterCardComponent>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockDialogRef: jest.Mocked<MatDialogRef<any>>;

  const mockCharacter: Character = {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    type: 'Sub',
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
    episode: [
      'https://rickandmortyapi.com/api/episode/1',
      'https://rickandmortyapi.com/api/episode/2'
    ],
    url: 'https://rickandmortyapi.com/api/character/1',
    created: '2017-11-04T18:48:46.250Z'
  };

  beforeEach(async () => {
    mockDialogRef = {
      open: jest.fn(),
      close: jest.fn(),
      afterClosed: jest.fn().mockReturnValue(of(undefined))
    } as any;

    mockDialog = {
      open: jest.fn().mockReturnValue(mockDialogRef)
    } as any;

    await TestBed.configureTestingModule({
      declarations: [CharacterCardComponent],
      imports: [
        MatCardModule
      ],
      providers: [
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterCardComponent);
    component = fixture.componentInstance;

    // Mock the required input before detectChanges
    fixture.componentRef.setInput('character', mockCharacter);

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have character input property', () => {
    expect(component.character()).toEqual(mockCharacter);
  });

  it('should display character information in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h2')?.textContent).toContain(mockCharacter.name);
    expect(compiled.querySelector('.type')?.textContent).toContain(
      `${mockCharacter.species}/${mockCharacter.gender} - ${mockCharacter.status}`
    );
    expect(compiled.textContent).toContain(mockCharacter.location.name);
    expect(compiled.textContent).toContain(mockCharacter.origin.name);

    const img = compiled.querySelector('img') as HTMLImageElement;
    expect(img.src).toBe(mockCharacter.image);
    expect(img.alt).toBe(mockCharacter.name);
  });

  describe('openDetails', () => {
    it('should open dialog with correct configuration', () => {
      component.openDetails();

      expect(mockDialog.open).toHaveBeenCalledWith(expect.anything(), {
        data: mockCharacter,
        panelClass: 'custom-dialog-container'
      });
    });

    it('should subscribe to dialog afterClosed', () => {
      mockDialogRef.afterClosed.mockReturnValue(of(undefined));

      component.openDetails();

      expect(mockDialogRef.afterClosed).toHaveBeenCalled();
    });

    it('should not emit any events when dialog returns undefined', () => {
      mockDialogRef.afterClosed.mockReturnValue(of(undefined));
      const characterChangeSpy = jest.spyOn(component.characterChange, 'emit');
      const removeCharacterSpy = jest.spyOn(component.removeCharacter, 'emit');

      component.openDetails();

      expect(characterChangeSpy).not.toHaveBeenCalled();
      expect(removeCharacterSpy).not.toHaveBeenCalled();
    });

    it('should emit removeCharacter when dialog returns remove: true', () => {
      const dialogResult = { remove: true };
      mockDialogRef.afterClosed.mockReturnValue(of(dialogResult));
      const removeCharacterSpy = jest.spyOn(component.removeCharacter, 'emit');
      const characterChangeSpy = jest.spyOn(component.characterChange, 'emit');

      component.openDetails();

      expect(removeCharacterSpy).toHaveBeenCalledWith(mockCharacter);
      expect(characterChangeSpy).not.toHaveBeenCalled();
    });

    it('should emit characterChange when dialog returns editedCharacter', () => {
      const editedCharacter: Character = {
        ...mockCharacter,
        name: 'Modified Rick'
      };
      const dialogResult = {
        remove: false,
        editedCharacter: editedCharacter
      };
      mockDialogRef.afterClosed.mockReturnValue(of(dialogResult));
      const characterChangeSpy = jest.spyOn(component.characterChange, 'emit');
      const removeCharacterSpy = jest.spyOn(component.removeCharacter, 'emit');

      component.openDetails();

      expect(characterChangeSpy).toHaveBeenCalledWith(editedCharacter);
      expect(removeCharacterSpy).not.toHaveBeenCalled();
    });

    it('should not emit characterChange when dialog returns remove: false and no editedCharacter', () => {
      const dialogResult = { remove: false };
      mockDialogRef.afterClosed.mockReturnValue(of(dialogResult));
      const characterChangeSpy = jest.spyOn(component.characterChange, 'emit');
      const removeCharacterSpy = jest.spyOn(component.removeCharacter, 'emit');

      component.openDetails();

      expect(characterChangeSpy).not.toHaveBeenCalled();
      expect(removeCharacterSpy).not.toHaveBeenCalled();
    });

    it('should handle dialog result with both editedCharacter and remove: false', () => {
      const editedCharacter: Character = {
        ...mockCharacter,
        status: 'Dead'
      };
      const dialogResult = {
        remove: false,
        editedCharacter: editedCharacter
      };
      mockDialogRef.afterClosed.mockReturnValue(of(dialogResult));
      const characterChangeSpy = jest.spyOn(component.characterChange, 'emit');

      component.openDetails();

      expect(characterChangeSpy).toHaveBeenCalledWith(editedCharacter);
    });
  });

  describe('click interaction', () => {
    it('should call openDetails when card is clicked', () => {
      const openDetailsSpy = jest.spyOn(component, 'openDetails');
      const cardElement = fixture.nativeElement.querySelector('mat-card');

      cardElement.click();

      expect(openDetailsSpy).toHaveBeenCalled();
    });
  });

  describe('image error handling', () => {
    it('should have onerror attribute for fallback image', () => {
      const img = fixture.nativeElement.querySelector('img');
      expect(img.getAttribute('onerror')).toBe("this.src='assets/images/Unknown_person.jpg'");
    });
  });

  describe('outputs', () => {
    it('should have characterChange output defined', () => {
      expect(component.characterChange).toBeDefined();
    });

    it('should have removeCharacter output defined', () => {
      expect(component.removeCharacter).toBeDefined();
    });
  });

  describe('input validation', () => {
    it('should work with different character data', () => {
      const newCharacter: Character = {
        id: 2,
        name: 'Morty Smith',
        status: 'Alive',
        species: 'Human',
        type: '',
        gender: 'Male',
        origin: {
          name: 'unknown',
          url: ''
        },
        location: {
          name: 'Earth (Replacement Dimension)',
          url: 'https://rickandmortyapi.com/api/location/20'
        },
        image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
        episode: ['https://rickandmortyapi.com/api/episode/1'],
        url: 'https://rickandmortyapi.com/api/character/2',
        created: '2017-11-04T18:50:21.651Z'
      };

      fixture.componentRef.setInput('character', newCharacter);
      fixture.detectChanges();

      expect(component.character()).toEqual(newCharacter);

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('h2')?.textContent).toContain(newCharacter.name);
    });

    it('should handle characters with empty episode array', () => {
      const characterWithoutEpisodes: Character = {
        ...mockCharacter,
        episode: []
      };

      fixture.componentRef.setInput('character', characterWithoutEpisodes);
      fixture.detectChanges();

      expect(component.character().episode).toEqual([]);
    });

    it('should handle different character statuses', () => {
      const deadCharacter: Character = {
        ...mockCharacter,
        status: 'Dead'
      };

      fixture.componentRef.setInput('character', deadCharacter);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.type')?.textContent).toContain('Dead');
    });

    it('should handle unknown status and gender', () => {
      const unknownCharacter: Character = {
        ...mockCharacter,
        status: 'unknown',
        gender: 'unknown',
        species: 'unknown'
      };

      fixture.componentRef.setInput('character', unknownCharacter);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const typeText = compiled.querySelector('.type')?.textContent;
      expect(typeText).toContain('unknown/unknown - unknown');
    });
  });

  describe('edge cases for dialog interactions', () => {
    it('should handle dialog error gracefully', () => {
      mockDialogRef.afterClosed.mockReturnValue(of(null));
      const characterChangeSpy = jest.spyOn(component.characterChange, 'emit');
      const removeCharacterSpy = jest.spyOn(component.removeCharacter, 'emit');

      expect(() => component.openDetails()).not.toThrow();
      expect(characterChangeSpy).not.toHaveBeenCalled();
      expect(removeCharacterSpy).not.toHaveBeenCalled();
    });

    it('should handle dialog result with unexpected structure', () => {
      const unexpectedResult = { someOtherProperty: 'value' };
      mockDialogRef.afterClosed.mockReturnValue(of(unexpectedResult));
      const characterChangeSpy = jest.spyOn(component.characterChange, 'emit');
      const removeCharacterSpy = jest.spyOn(component.removeCharacter, 'emit');

      component.openDetails();

      expect(characterChangeSpy).not.toHaveBeenCalled();
      expect(removeCharacterSpy).not.toHaveBeenCalled();
    });
  });
});
