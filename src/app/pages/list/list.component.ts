import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { Character } from '../../shared/models/character.model';
import { RickMortyAPIService } from '../../shared/services/RickMortyAPI/RickMortyAPI.service';
import Swal from 'sweetalert2';
import { CharacterDetailDialogComponent } from './components/character-detail-dialog/character-detail-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { LocalStorageService } from '../../shared/services/LocalStorage/LocalStorage.service';

@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  searchTerm: string = '';
  characters: Character[] = [];

  @ViewChild('endOfList', { static: true }) endOfList!: ElementRef;
  pagination = signal({ page: 1, totalPages: 1, totalCharacters: 0 });
  loading = signal(false);
  observer!: IntersectionObserver;

  constructor(
    private localStorageService: LocalStorageService,
    private rickMortyAPIService: RickMortyAPIService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.searchCharacters();

    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !this.loading()) {
        this.loadMore();
      }
    });

    this.observer.observe(this.endOfList.nativeElement);
  }

  onSearchChange() {
    this.searchCharacters({ name: this.searchTerm } as Character);
  }

  openCreateCharacterDialog() {
    const character: Character = {
      id: Date.now().valueOf(),
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
    };

    const dialogRef = this.dialog.open(CharacterDetailDialogComponent, {
      data: character,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && result.editedCharacter) {
        this.addCharacter(result.editedCharacter);
      }
    });
  }

  loadMore() {
    if (this.pagination().page >= this.pagination().totalPages) return;

    this.loading.set(true);
    this.pagination.update(p => ({ ...p, page: p.page + 1 }));

    this.rickMortyAPIService.getCharacters({ name: this.searchTerm } as Character, this.pagination().page).subscribe({
      next: (res) => {
        this.characters = [...this.characters, ...res.results];
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error fetching more characters:', err);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Erro ao buscar mais personagens. Por favor, tente novamente mais tarde.',
        });
      }
    });
  }

  searchCharacters(filter?: Character) {
    this.loading.set(true);
    this.pagination.update(p => ({ ...p, page: 1 }));

    this.rickMortyAPIService.getCharacters(filter).subscribe({
      next: (res) => {
        const storedCharacters = this.localStorageService.getStoredCharacters(filter);

        this.pagination.update(p => ({
          ...p,
          totalPages: res.info.pages,
          totalCharacters: res.info.count + storedCharacters.length
        }));
        this.characters = [...storedCharacters, ...res.results];
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);

        if (err.status === 404) {
          this.updatePagination404(this.localStorageService.getStoredCharacters(filter));
          return;
        }

        console.error('Error fetching characters:', err);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Erro ao buscar personagens. Por favor, tente novamente mais tarde.',
        });
      }
    });
  }

  updateCharacter(updatedCharacter: Character) {
    const index = this.characters.findIndex(char => char.id === updatedCharacter.id);
    if (index !== -1) {
      this.localStorageService.updateCharacter(updatedCharacter);
      this.searchCharacters({ name: this.searchTerm } as Character);
    }
    else {
      this.addCharacter(updatedCharacter);
    }
  }

  updatePagination404(storedCharacters: Character[]) {
    this.characters = storedCharacters;
    this.pagination.set({ page: 1, totalPages: 1, totalCharacters: this.characters.length });
  }

  addCharacter(character: Character) {
    this.localStorageService.createCharacter(character);
    this.searchCharacters({ name: this.searchTerm } as Character);
  }

  removeCharacter(character: Character) {
    this.localStorageService.removeCharacterById(character.id);
    this.searchCharacters({ name: this.searchTerm } as Character);
  }
}
