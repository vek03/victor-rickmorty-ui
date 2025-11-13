import { Component, inject, model } from '@angular/core';
import { Character } from '../../../../shared/models/character.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-character-detail-dialog',
  standalone: false,
  templateUrl: './character-detail-dialog.component.html',
  styleUrl: './character-detail-dialog.component.scss'
})
export class CharacterDetailDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CharacterDetailDialogComponent>);
  readonly data = inject<Character>(MAT_DIALOG_DATA);

  editedCharacter: Character = this.data;

  onCloseClick(): void {
    this.dialogRef.close(this.editedCharacter);
  }
}
