import { Component, inject, signal } from '@angular/core';
import { Character } from '../../../../shared/models/character.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

  characterForm = new FormGroup({
    name: new FormControl(this.data.name, Validators.required),
    status: new FormControl(this.data.status, Validators.required),
    species: new FormControl(this.data.species, Validators.required),
    type: new FormControl(this.data.type, Validators.required),
    gender: new FormControl(this.data.gender, Validators.required),
    originName: new FormControl(this.data.origin.name, Validators.required),
    locationName: new FormControl(this.data.location.name, Validators.required),
    image: new FormControl(this.data.image, Validators.required)
  });

  ngOnInit(): void {
    if(this.editedCharacter().episode.length !== 0) {
      this.characterForm.disable();
    }
  }

  onCloseClick(): void {
    this.dialogRef.close({ remove: false });
  }

  onSaveClick(): void {
    if(!this.characterForm.valid) return;

    this.editedCharacter.update(c => ({
      ...c,
      name: this.characterForm.value.name || '',
      status: this.characterForm.value.status || 'unknown',
      species: this.characterForm.value.species || '',
      type: this.characterForm.value.type || '',
      gender: this.characterForm.value.gender || 'unknown',
      origin: { ...c.origin, name: this.characterForm.value.originName || '' },
      location: { ...c.location, name: this.characterForm.value.locationName || '' },
      image: this.characterForm.value.image || ''
    }));

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
