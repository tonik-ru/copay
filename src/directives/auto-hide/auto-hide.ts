import { Directive, ElementRef, Renderer } from '@angular/core';
import { Logger } from '../../providers';

/**
 * Generated class for the AutoHideDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[auto-hide]', // Attribute selector
  host: {
    '(ionScroll)': 'onContentScroll($event)'
  }
})
export class AutoHideDirective {
  fabToHide;

  oldScrollTop: number = 0;

  constructor(
    private renderer: Renderer,
    private element: ElementRef,
    public logger: Logger
  ) {
    this.logger.log('scroller added');
  }
  ngOnInit() {
    this.fabToHide = this.element.nativeElement.getElementByClassName('fab')[0];
  }
  onContentScroll(e) {
    if (e.scrollTop - this.oldScrollTop > 10) {
      this.logger.log('DOWN');
      this.renderer.setElementStyle(this.fabToHide, 'opacity', '1');
    } else if (e.scrollTop - this.oldScrollTop < 0) {
      this.renderer.setElementStyle(this.fabToHide, 'opacity', '0');
      this.logger.log('UP');
    }
    this.oldScrollTop = e.scrollTop;
  }
}
