import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewsmenuPage } from './newsmenu';

@NgModule({
  declarations: [
    NewsmenuPage,
  ],
  imports: [
    IonicPageModule.forChild(NewsmenuPage),
  ],
})
export class NewsmenuPageModule {}
