import { Component, OnInit } from '@angular/core';
import { Character } from '../../shared/models/character.model';
import { RickMortyAPIService } from '../../shared/services/RickMortyAPI.service';
import Swal from 'sweetalert2';

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
    private rickMortyAPIService: RickMortyAPIService
  ) {}

  ngOnInit() {
    this.searchCharacters();
  }

  onSearchChange() {
    this.searchCharacters({ name: this.searchTerm } as Character);
  }

  searchCharacters(filter?: Character) {
    this.rickMortyAPIService.getCharacters(filter).subscribe({
      next: (res) => {
        this.characters = res.results;
      },
      error: (err) => {
        console.error('Error fetching characters:', err);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Erro ao buscar personagens. Por favor, tente novamente mais tarde.',
        });
      }
    });
  }
}
