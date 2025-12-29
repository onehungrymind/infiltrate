import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { <%= singularClassName %> } from '@articool/api-interfaces';
import { <%= pluralClassName %>Facade } from '@articool/core-state';
import { Observable } from 'rxjs';
import { <%= singularClassName %>Detail } from './<%= singularKebabCase %>-detail/<%= singularKebabCase %>-detail';
import { <%= pluralClassName %>List } from './<%= pluralKebabCase %>-list/<%= pluralKebabCase %>-list';

@Component({
  selector: 'app-<%= pluralKebabCase %>',
  imports: [<%= pluralClassName %>List, <%= singularClassName %>Detail, AsyncPipe],
  templateUrl: './<%= featureKebabCase %>.html',
  styleUrl: './<%= featureKebabCase %>.scss',
})
export class <%= featureClassName %> implements OnInit {
  private <%= pluralPropertyName %>Facade = inject(<%= pluralClassName %>Facade);

  <%= pluralPropertyName %>$: Observable<<%= singularClassName %>[]> = this.<%= pluralPropertyName %>Facade.all<%= pluralClassName %>$;
  selected<%= singularClassName %>$: Observable<<%= singularClassName %> | null> = this.<%= pluralPropertyName %>Facade.selected<%= singularClassName %>$;
  mutations$ = this.<%= pluralPropertyName %>Facade.mutations$;

  constructor() {
    this.mutations$.subscribe(() => this.reset());
  }

  ngOnInit(): void {
    this.reset();
  }

  reset() {
    this.load<%= pluralClassName %>();
    this.<%= pluralPropertyName %>Facade.resetSelected<%= singularClassName %>();
  }

  select<%= singularClassName %>(<%= singularPropertyName %>: <%= singularClassName %>) {
    this.<%= pluralPropertyName %>Facade.select<%= singularClassName %>(<%= singularPropertyName %>.id as string);
  }

  load<%= pluralClassName %>() {
    this.<%= pluralPropertyName %>Facade.load<%= pluralClassName %>();
  }

  save<%= singularClassName %>(<%= singularPropertyName %>: <%= singularClassName %>) {
    this.<%= pluralPropertyName %>Facade.save<%= singularClassName %>(<%= singularPropertyName %>);
  }

  delete<%= singularClassName %>(<%= singularPropertyName %>: <%= singularClassName %>) {
    this.<%= pluralPropertyName %>Facade.delete<%= singularClassName %>(<%= singularPropertyName %>);
  }

  cancel() {
    this.<%= pluralPropertyName %>Facade.resetSelected<%= singularClassName %>();
  }
}
