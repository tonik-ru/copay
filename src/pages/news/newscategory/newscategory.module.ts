import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewscategoryPage } from './newscategory';

@NgModule({
  declarations: [
    NewscategoryPage,
  ],
  imports: [
    IonicPageModule.forChild(NewscategoryPage),
  ],
})
export class NewscategoryPageModule {}
