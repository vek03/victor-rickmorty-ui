import { NgModule } from '@angular/core';

import { FooterComponent } from './components/footer/footer.component';
import { LayoutComponent } from './layout.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { NavComponent } from './components/nav/nav.component';

@NgModule({
  declarations: [
    LayoutComponent,
    FooterComponent,
    NavComponent
  ],
  imports: [
    RouterModule,
    SharedModule
  ],
  providers: []
})
export class LayoutModule { }
