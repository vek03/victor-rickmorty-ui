import { Component, Input } from '@angular/core';
import { Character } from '../../../../shared/models/character.model';

@Component({
  selector: 'app-character-card',
  standalone: false,
  templateUrl: './character-card.component.html',
  styleUrl: './character-card.component.scss'
})
export class CharacterCardComponent {
  @Input()
  character!: Character;
}
