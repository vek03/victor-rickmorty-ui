import { Component, input, output } from '@angular/core';
import { Character } from '../../../../shared/models/character.model';
import { MatDialog } from '@angular/material/dialog';
import { CharacterDetailDialogComponent } from '../character-detail-dialog/character-detail-dialog.component';

@Component({
  selector: 'app-character-card',
  standalone: false,
  templateUrl: './character-card.component.html',
  styleUrl: './character-card.component.scss'
})
export class CharacterCardComponent {
  readonly character = input.required<Character>();

  readonly characterChange = output<Character>();

  readonly removeCharacter = output<Character>();

  constructor(private dialog: MatDialog) {}

  openDetails() {
    const dialogRef = this.dialog.open(CharacterDetailDialogComponent, {
      data: this.character(),
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if(result.remove) {
          this.removeCharacter.emit(this.character());
          return;
        }

        if(result.editedCharacter) {
          this.characterChange.emit(result.editedCharacter);
        }
      }
    });
  }
}
