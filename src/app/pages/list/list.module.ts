import { NgModule } from '@angular/core';

import { ListComponent } from './list.component';
import { SharedModule } from '../../shared/shared.module';
import { ListRoutingModule } from './list-routing.module';
import { CharacterCardComponent } from './components/character-card/character-card.component';
import { CharacterDetailDialogComponent } from './components/character-detail-dialog/character-detail-dialog.component';

@NgModule({
  declarations: [
    ListComponent,
    CharacterCardComponent,
    CharacterDetailDialogComponent
  ],
  imports: [
    ListRoutingModule,
    SharedModule
  ],
  providers: []
})
export class ListModule { }
