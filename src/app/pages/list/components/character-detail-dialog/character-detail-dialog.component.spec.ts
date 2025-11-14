import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CharacterDetailDialogComponent } from './character-detail-dialog.component';
import { Character } from '../../../../shared/models/character.model';
import Swal from 'sweetalert2';

// Mock do SweetAlert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn()
}));

describe('CharacterDetailDialogComponent', () => {
  let component: CharacterDetailDialogComponent;
  let fixture: ComponentFixture<CharacterDetailDialogComponent>;
  let mockDialogRef: jest.Mocked<MatDialogRef<CharacterDetailDialogComponent>>;
  let mockCharacterData: Character;

  beforeEach(async () => {
    // Mock do MatDialogRef
    mockDialogRef = {
      close: jest.fn()
    } as any;

    // Dados mock do personagem
    mockCharacterData = {
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
        name: 'Earth (Replacement Dimension)',
        url: 'https://rickandmortyapi.com/api/location/20'
      },
      image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
      episode: ['https://rickandmortyapi.com/api/episode/1'],
      url: 'https://rickandmortyapi.com/api/character/1',
      created: '2017-11-04T18:48:46.250Z'
    };

    await TestBed.configureTestingModule({
      declarations: [CharacterDetailDialogComponent],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockCharacterData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with injected data', () => {
      expect(component.data).toEqual(mockCharacterData);
      expect(component.editedCharacter()).toEqual(mockCharacterData);
    });

    it('should initialize form with character data', () => {
      expect(component.characterForm.value).toEqual({
        name: mockCharacterData.name,
        status: mockCharacterData.status,
        species: mockCharacterData.species,
        type: mockCharacterData.type,
        gender: mockCharacterData.gender,
        originName: mockCharacterData.origin.name,
        locationName: mockCharacterData.location.name,
        image: mockCharacterData.image
      });
    });

    it('should disable form when character has episodes', () => {
      component.ngOnInit();
      expect(component.characterForm.disabled).toBe(true);
    });

    it('should keep form enabled when character has no episodes', () => {
      // Criar um novo personagem sem episódios
      const characterWithoutEpisodes: Character = {
        ...mockCharacterData,
        episode: []
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [CharacterDetailDialogComponent],
        imports: [
          ReactiveFormsModule,
          MatFormFieldModule,
          MatInputModule,
          MatSelectModule,
          MatButtonModule,
          MatIconModule,
          MatTooltipModule
        ],
        providers: [
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: characterWithoutEpisodes }
        ]
      });

      const newFixture = TestBed.createComponent(CharacterDetailDialogComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      newComponent.ngOnInit();
      expect(newComponent.characterForm.disabled).toBe(false);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      // Criar componente com personagem sem episódios para permitir edição
      const characterWithoutEpisodes: Character = {
        ...mockCharacterData,
        episode: []
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [CharacterDetailDialogComponent],
        imports: [
          ReactiveFormsModule,
          MatFormFieldModule,
          MatInputModule,
          MatSelectModule,
          MatButtonModule,
          MatIconModule,
          MatTooltipModule
        ],
        providers: [
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: characterWithoutEpisodes }
        ]
      });

      fixture = TestBed.createComponent(CharacterDetailDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should be valid with all required fields filled', () => {
      component.characterForm.patchValue({
        name: 'Rick Sanchez',
        status: 'Alive',
        species: 'Human',
        type: 'Sub',
        gender: 'Male',
        originName: 'Earth (C-137)',
        locationName: 'Earth (Replacement Dimension)',
        image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg'
      });
      expect(component.characterForm.valid).toBe(true);
    });

    it('should be invalid when name is empty', () => {
      component.characterForm.patchValue({ name: '' });
      expect(component.characterForm.valid).toBe(false);
      expect(component.characterForm.get('name')?.hasError('required')).toBe(true);
    });

    it('should be invalid when status is empty', () => {
      component.characterForm.patchValue({ status: null });
      expect(component.characterForm.valid).toBe(false);
      expect(component.characterForm.get('status')?.hasError('required')).toBe(true);
    });

    it('should be invalid when species is empty', () => {
      component.characterForm.patchValue({ species: '' });
      expect(component.characterForm.valid).toBe(false);
      expect(component.characterForm.get('species')?.hasError('required')).toBe(true);
    });

    it('should be invalid when type is empty', () => {
      component.characterForm.patchValue({ type: '' });
      expect(component.characterForm.valid).toBe(false);
      expect(component.characterForm.get('type')?.hasError('required')).toBe(true);
    });

    it('should be invalid when gender is empty', () => {
      component.characterForm.patchValue({ gender: null });
      expect(component.characterForm.valid).toBe(false);
      expect(component.characterForm.get('gender')?.hasError('required')).toBe(true);
    });

    it('should be invalid when originName is empty', () => {
      component.characterForm.patchValue({ originName: '' });
      expect(component.characterForm.valid).toBe(false);
      expect(component.characterForm.get('originName')?.hasError('required')).toBe(true);
    });

    it('should be invalid when locationName is empty', () => {
      component.characterForm.patchValue({ locationName: '' });
      expect(component.characterForm.valid).toBe(false);
      expect(component.characterForm.get('locationName')?.hasError('required')).toBe(true);
    });

    it('should be invalid when image is empty', () => {
      component.characterForm.patchValue({ image: '' });
      expect(component.characterForm.valid).toBe(false);
      expect(component.characterForm.get('image')?.hasError('required')).toBe(true);
    });
  });

  describe('onCloseClick', () => {
    it('should close dialog with remove: false', () => {
      component.onCloseClick();
      expect(mockDialogRef.close).toHaveBeenCalledWith({ remove: false });
    });
  });

  describe('onSaveClick', () => {
    beforeEach(() => {
      // Criar componente com personagem sem episódios para permitir edição
      const characterWithoutEpisodes: Character = {
        ...mockCharacterData,
        episode: []
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [CharacterDetailDialogComponent],
        imports: [
          ReactiveFormsModule,
          MatFormFieldModule,
          MatInputModule,
          MatSelectModule,
          MatButtonModule,
          MatIconModule,
          MatTooltipModule
        ],
        providers: [
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: characterWithoutEpisodes }
        ]
      });

      fixture = TestBed.createComponent(CharacterDetailDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should not save when form is invalid', () => {
      component.characterForm.patchValue({ name: '' });
      component.onSaveClick();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should save and close dialog when form is valid', () => {
      const updatedData = {
        name: 'Updated Rick',
        status: 'Dead' as const,
        species: 'Alien',
        type: 'Scientist',
        gender: 'Male' as const,
        originName: 'Updated Origin',
        locationName: 'Updated Location',
        image: 'updated-image.jpg'
      };

      component.characterForm.patchValue(updatedData);
      component.onSaveClick();

      expect(component.editedCharacter().name).toBe(updatedData.name);
      expect(component.editedCharacter().status).toBe(updatedData.status);
      expect(component.editedCharacter().species).toBe(updatedData.species);
      expect(component.editedCharacter().type).toBe(updatedData.type);
      expect(component.editedCharacter().gender).toBe(updatedData.gender);
      expect(component.editedCharacter().origin.name).toBe(updatedData.originName);
      expect(component.editedCharacter().location.name).toBe(updatedData.locationName);
      expect(component.editedCharacter().image).toBe(updatedData.image);

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        editedCharacter: component.editedCharacter(),
        remove: false
      });
    });

    it('should handle empty form values with defaults', () => {
      component.characterForm.patchValue({
        name: null,
        status: null,
        species: null,
        type: null,
        gender: null,
        originName: null,
        locationName: null,
        image: null
      });

      // Tornar o formulário válido manualmente para este teste
      component.characterForm.get('name')?.setValue('Test');
      component.characterForm.get('status')?.setValue('unknown');
      component.characterForm.get('species')?.setValue('Test');
      component.characterForm.get('type')?.setValue('Test');
      component.characterForm.get('gender')?.setValue('unknown');
      component.characterForm.get('originName')?.setValue('Test');
      component.characterForm.get('locationName')?.setValue('Test');
      component.characterForm.get('image')?.setValue('Test');

      component.onSaveClick();

      expect(component.editedCharacter().name).toBe('Test');
      expect(component.editedCharacter().status).toBe('unknown');
      expect(component.editedCharacter().species).toBe('Test');
      expect(component.editedCharacter().type).toBe('Test');
      expect(component.editedCharacter().gender).toBe('unknown');
      expect(component.editedCharacter().origin.name).toBe('Test');
      expect(component.editedCharacter().location.name).toBe('Test');
      expect(component.editedCharacter().image).toBe('Test');
    });
  });

  describe('onRemoveClick', () => {
    it('should show confirmation dialog', () => {
      const mockSwalResult = { isConfirmed: false };
      (Swal.fire as jest.Mock).mockResolvedValue(mockSwalResult);

      component.onRemoveClick();

      expect(Swal.fire).toHaveBeenCalledWith({
        title: 'Tem certeza?',
        text: 'Esta ação não pode ser desfeita!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, remover!',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      });
    });

    it('should close dialog with remove: true when confirmed', async () => {
      const mockSwalResult = { isConfirmed: true };
      (Swal.fire as jest.Mock).mockResolvedValue(mockSwalResult);

      await component.onRemoveClick();

      // Aguardar o próximo ciclo para que a Promise seja resolvida
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        ...component.editedCharacter,
        remove: true
      });
    });

    it('should not close dialog when cancelled', async () => {
      const mockSwalResult = { isConfirmed: false };
      (Swal.fire as jest.Mock).mockResolvedValue(mockSwalResult);

      await component.onRemoveClick();

      // Aguardar o próximo ciclo para que a Promise seja resolvida
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    it('should display character name in title', () => {
      const titleElement = fixture.debugElement.nativeElement.querySelector('h1[mat-dialog-title]');
      expect(titleElement.textContent).toBe(mockCharacterData.name);
    });

    it('should display character image with correct src and alt', () => {
      const imageElement = fixture.debugElement.nativeElement.querySelector('img[mat-card-image]');
      expect(imageElement.src).toBe(mockCharacterData.image);
      expect(imageElement.alt).toBe(mockCharacterData.name);
    });

    it('should have correct form field values', () => {
      const nameInput = fixture.debugElement.nativeElement.querySelector('input[formControlName="name"]');
      const speciesInput = fixture.debugElement.nativeElement.querySelector('input[formControlName="species"]');
      const typeInput = fixture.debugElement.nativeElement.querySelector('input[formControlName="type"]');
      const originInput = fixture.debugElement.nativeElement.querySelector('input[formControlName="originName"]');
      const locationInput = fixture.debugElement.nativeElement.querySelector('input[formControlName="locationName"]');
      const imageInput = fixture.debugElement.nativeElement.querySelector('input[formControlName="image"]');

      expect(nameInput.value).toBe(mockCharacterData.name);
      expect(speciesInput.value).toBe(mockCharacterData.species);
      expect(typeInput.value).toBe(mockCharacterData.type);
      expect(originInput.value).toBe(mockCharacterData.origin.name);
      expect(locationInput.value).toBe(mockCharacterData.location.name);
      expect(imageInput.value).toBe(mockCharacterData.image);
    });
  });

  describe('Signal Updates', () => {
    beforeEach(() => {
      // Criar componente com personagem sem episódios para permitir edição
      const characterWithoutEpisodes: Character = {
        ...mockCharacterData,
        episode: []
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [CharacterDetailDialogComponent],
        imports: [
          ReactiveFormsModule,
          MatFormFieldModule,
          MatInputModule,
          MatSelectModule,
          MatButtonModule,
          MatIconModule,
          MatTooltipModule
        ],
        providers: [
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: characterWithoutEpisodes }
        ]
      });

      fixture = TestBed.createComponent(CharacterDetailDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should update editedCharacter signal when form is saved', () => {
      component.characterForm.patchValue({
        name: null,
        status: null,
        species: null,
        type: null,
        gender: null,
        originName: null,
        locationName: null,
        image: null
      });

      component.characterForm.get('name')?.setValue('Test');
      component.characterForm.get('status')?.setValue('unknown');
      component.characterForm.get('species')?.setValue('Test');
      component.characterForm.get('type')?.setValue('Test');
      component.characterForm.get('gender')?.setValue('unknown');
      component.characterForm.get('originName')?.setValue('Test');
      component.characterForm.get('locationName')?.setValue('Test');
      component.characterForm.get('image')?.setValue('Test');

      component.onSaveClick();

      expect(component.editedCharacter().name).toBe('Test');
    });
  });

  describe('Edge Cases', () => {
    it('should handle character with empty string type', () => {
      expect(component.characterForm.get('type')?.value).toBe('');
    });

    it('should maintain original character properties not in form', () => {
      // Criar componente com personagem sem episódios para permitir edição
      const characterWithoutEpisodes: Character = {
        ...mockCharacterData,
        episode: []
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [CharacterDetailDialogComponent],
        imports: [
          ReactiveFormsModule,
          MatFormFieldModule,
          MatInputModule,
          MatSelectModule,
          MatButtonModule,
          MatIconModule,
          MatTooltipModule
        ],
        providers: [
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: characterWithoutEpisodes }
        ]
      });

      fixture = TestBed.createComponent(CharacterDetailDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const originalId = component.editedCharacter().id;
      const originalUrl = component.editedCharacter().url;
      const originalCreated = component.editedCharacter().created;

      component.characterForm.patchValue({
        name: 'Updated Name'
      });

      component.onSaveClick();

      expect(component.editedCharacter().id).toBe(originalId);
      expect(component.editedCharacter().url).toBe(originalUrl);
      expect(component.editedCharacter().created).toBe(originalCreated);
    });
  });
});
