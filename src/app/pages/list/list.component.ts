import { Component, OnInit } from '@angular/core';
import { Character } from '../../shared/models/character.model';
import { RickMortyAPIService } from '../../shared/services/RickMortyAPI.service';
import Swal from 'sweetalert2';
import { CharacterDetailDialogComponent } from './components/character-detail-dialog/character-detail-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { LocalStorageService } from '../../shared/services/LocalStorage.service';

@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  searchTerm: string = '';
  characters: Character[] = [];

  constructor(
    private localStorageService: LocalStorageService,
    private rickMortyAPIService: RickMortyAPIService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.searchCharacters();
  }

  onSearchChange() {
    this.searchCharacters({ name: this.searchTerm } as Character);
  }

  openCreateCharacterDialog() {
    const character: Character = {
      id: Date.now().valueOf(),
      name: '',
      status: '',
      species: '',
      type: '',
      gender: '',
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
      if (result !== undefined) {
        this.addCharacter(result);
      }
    });
  }

  searchCharacters(filter?: Character) {
    this.rickMortyAPIService.getCharacters(filter).subscribe({
      next: (res) => {
        this.characters = [...this.localStorageService.getStoredCharacters(filter), ...res.results];
      },
      error: (err) => {
        if (err.status === 404) {
          this.characters = this.localStorageService.getStoredCharacters(filter);
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

  addCharacter(character: Character) {
    this.localStorageService.createCharacter(character);
    this.searchCharacters({ name: this.searchTerm } as Character);
  }
}
