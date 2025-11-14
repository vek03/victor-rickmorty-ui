import { Component, inject, signal } from '@angular/core';
import { Character } from '../../../../shared/models/character.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-character-detail-dialog',
  standalone: false,
  templateUrl: './character-detail-dialog.component.html',
  styleUrl: './character-detail-dialog.component.scss'
})
export class CharacterDetailDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CharacterDetailDialogComponent>);
  readonly data = inject<Character>(MAT_DIALOG_DATA);

  editedCharacter = signal<Character>(this.data);

  onCloseClick(): void {
    this.dialogRef.close({ remove: false });
  }

  onSaveClick(): void {
    this.dialogRef.close({ editedCharacter: this.editedCharacter(), remove: false });
  }

  onRemoveClick(): void {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.dialogRef.close({ ...this.editedCharacter, remove: true });
      }
    });
  }
}
