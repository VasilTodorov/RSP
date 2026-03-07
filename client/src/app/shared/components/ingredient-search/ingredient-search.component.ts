import { Component, signal, inject, output, ElementRef, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Added for two-way binding
import { IngredientService } from '../../../core/services/ingredient.service';
import { Ingredient } from '../../../core/models/ingredient.model';
import { AutocompleteNavDirective } from '../../directives/autocomplete-navigation.directive';

@Component({
  selector: 'app-ingredient-search',
  standalone: true,
  imports: [CommonModule, FormsModule, AutocompleteNavDirective],
  templateUrl: './ingredient-search.component.html',
  styleUrl: './ingredient-search.component.css'
})
export class IngredientSearchComponent {
  private ingredientService = inject(IngredientService);
  private elementRef = inject(ElementRef);

  // --- Internal State ---
  searchTerm = signal(''); // This is now the source of truth for the text box
  results = signal<Ingredient[]>([]);
  selected = signal<Ingredient[]>([]);
  activeIndex = signal(-1);

  // --- Computed State ---
  filteredResults = computed(() => {
    const selectedIds = new Set(this.selected().map(s => s.id));
    return this.results().filter(ing => !selectedIds.has(ing.id));
  });

  isListExhausted = computed(() => {
    return this.results().length > 0 && this.filteredResults().length === 0;
  });
  // --- Events ---
  onSelectionChange = output<Ingredient[]>();

  handleSelection() {
    const item = this.filteredResults()[this.activeIndex()];
    if (item) {
      this.add(item);
      this.activeIndex.set(-1); // Reset after adding
    }
  }
  // Logic: Search
  onSearch() {
    this.ingredientService.searchIngredients(this.searchTerm()).subscribe(data => {
      this.results.set(data);
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.results.set([]);
    }
  }

  add(ing: Ingredient) {
    if (!this.selected().some(i => i.id === ing.id)) {
      this.selected.update(list => [...list, ing]);
      this.onSelectionChange.emit(this.selected());
    }

    // THE KEY: Reset the search state but keep the "results" active
    this.searchTerm.set(''); 
    this.activeIndex.set(-1); 
    
    // Re-fetch immediately so the dropdown stays open with the remaining items
    this.results.set([]);
    //this.onSearch(); 
  }
  closeResults() {
    this.results.set([]);
    this.activeIndex.set(-1);
  }
  remove(id: number) {
    this.selected.update(list => list.filter(i => i.id !== id));
    this.onSelectionChange.emit(this.selected());
  }

  public reset() {
    this.selected.set([]);
    this.results.set([]);
    this.searchTerm.set(''); // CLEAN: Reset the signal
    this.onSelectionChange.emit([]);
  }
}