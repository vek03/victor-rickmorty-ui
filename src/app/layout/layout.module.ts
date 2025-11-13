import { NgModule } from '@angular/core';

import { FooterComponent } from './components/footer/footer.component';
import { NavComponent } from './components/nav/nav.component';
import { LayoutComponent } from './layout.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    LayoutComponent,
    FooterComponent,
    NavComponent
  ],
  imports: [
    RouterModule
  ],
  providers: []
})
export class LayoutModule { }
