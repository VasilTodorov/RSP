import { Directive, HostListener, input, output, model } from '@angular/core';

@Directive({
  selector: '[appAutocompleteNav]',
  standalone: true
})
export class AutocompleteNavDirective {
  listLength = input.required<number>();
  activeIndex = model<number>(-1); 
  selectOption = output<void>();
  escPressed = output<void>();

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const length = this.listLength();
    if (length === 0) return;

    // 1. Navigation
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update(i => (i + 1) % length);
    } 
    else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update(i => (i - 1 + length) % length);
    } 
    
    // 2. Selection (The "Frustration Fix")
    else if (event.key === 'Enter' || event.key === 'Tab') {
      // Only intercept Tab if the user has actually highlighted an item
      if (this.activeIndex() >= 0) {
        event.preventDefault(); 
        this.selectOption.emit();
        this.activeIndex.set(-1);
      }
    }
    
    // 3. Escape to close
    else if (event.key === 'Escape') {
      this.activeIndex.set(-1);
      this.escPressed.emit();
      // We'll let the component handle the results clear
    }
  }
}