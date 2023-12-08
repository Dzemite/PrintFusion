import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap, takeUntil } from 'rxjs/operators';

export interface IAutoCompleteScrollEvent {
  autoComplete: MatAutocomplete;
  scrollEvent: Event;
}

@UntilDestroy()
@Directive({
  selector: 'mat-autocomplete[optionsScroll]'
})
export class OptionsScrollDirective {

  @Input() thresholdPercent = .95;
  @Output('optionsScroll') scroll = new EventEmitter<IAutoCompleteScrollEvent>();

  constructor(public autoComplete: MatAutocomplete) {
    this.autoComplete.opened.pipe(
      tap(() => {
        // Note: When autocomplete raises opened, panel is not yet created (by Overlay)
        // Note: The panel will be available on next tick
        // Note: The panel wil NOT open if there are no options to display
        setTimeout(() => {
          // Note: remove listner just for safety, in case the close event is skipped.
          this.removeScrollEventListener();
          this.autoComplete.panel.nativeElement
            .addEventListener('scroll', this.onScroll.bind(this))
        });
      }),
      untilDestroyed(this)
    ).subscribe();

    this.autoComplete.closed.pipe(
      tap(() => this.removeScrollEventListener()),
      untilDestroyed(this)).subscribe();
  }

  private removeScrollEventListener() {
    this.autoComplete.panel.nativeElement
      .removeEventListener('scroll', this.onScroll);
  }

  onScroll(event: Event) {

    if (this.thresholdPercent === undefined) {
      this.scroll.next({ autoComplete: this.autoComplete, scrollEvent: event });
    } else {
     const threshold = this.thresholdPercent * 100 * (<HTMLInputElement>event.target).scrollHeight / 100;
      const current = (<HTMLInputElement>event.target).scrollTop + (<HTMLInputElement>event.target).clientHeight;

      // console.log(`scroll ${current}, threshold: ${threshold}`)
      if (current > threshold) {
        //console.log('load next page');
        this.scroll.next({ autoComplete: this.autoComplete, scrollEvent: event });
      }
    }
  }
}