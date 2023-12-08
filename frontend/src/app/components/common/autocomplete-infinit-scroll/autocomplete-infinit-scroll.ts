import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { startWith, switchMap, tap, debounceTime, filter, scan, exhaustMap } from 'rxjs/operators';
import { takeWhileInclusive } from 'rxjs-take-while-inclusive';
import { InfinitAutocompleteItem } from 'src/app/interfaces/common';

@Component({
  selector: 'autocomplete-infinit-scroll[control][getItems]',
  templateUrl: 'autocomplete-infinit-scroll.html',
  styleUrls: ['autocomplete-infinit-scroll.scss'],
})
export class AutocompleteInfinitScrollComponent implements OnInit {

  @Input() control!: FormControl;
  @Input() getItems!: (filter: string, offset: number, limit: number) => Observable<InfinitAutocompleteItem[]>;
  @Input() hideOptionCondition: (option: InfinitAutocompleteItem) => boolean = () => false;
  @Input() pageSize = 10;
  @Input() placeholder = 'Pick one';
  @Input() optionClasses = '';
  @Input() displayWith = (item: InfinitAutocompleteItem) =>  item ? item.name : '';

  filteredLookups$!: Observable<InfinitAutocompleteItem[]>;
  private nextPage$ = new Subject();


  ngOnInit() {

    // Note: listen for search text changes
    const filter$ = this.control.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      // Note: If the option valye is bound to object, after selecting the option
      // Note: the value will change from string to {}. We want to perform search 
      // Note: only when the type is string (no match)
      filter(q => typeof q === "string")
    );

    // Note: There are 2 stream here: the search text changes stream and the nextPage$ (raised by directive at 80% scroll)
    // Note: On every search text change, we issue a backend request starting the first page
    // Note: While the backend is processing our request we ignore any other NextPage emitts (exhaustMap).
    // Note: If in this time the search text changes, we don't need those results anymore (switchMap)
    this.filteredLookups$ = filter$.pipe(
      switchMap(filter => {
        //Note: Reset the page with every new seach text
        let currentPage = 1;
        return this.nextPage$.pipe(
          startWith(currentPage),
          //Note: Until the backend responds, ignore NextPage requests.
          exhaustMap(_ => this.getItems(filter as string, currentPage, this.pageSize)),
          tap(() => currentPage++),
          //Note: This is a custom operator because we also need the last emitted value.
          //Note: Stop if there are no more pages, or no results at all for the current search text.
          
          // TODO: remove ts-ignore
          // @ts-ignore
          takeWhileInclusive(p => p.length > 0),
          scan((allProducts, newProducts: never[]) => allProducts.concat(newProducts), []),
        );
      })); // Note: We let asyncPipe subscribe.

  }

  onScroll() {
    //Note: This is called multiple times after the scroll has reached the 80% threshold position.
    this.nextPage$.next(true);
  }
}