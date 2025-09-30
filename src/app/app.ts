import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UtilityBarComponent } from './shared/components/utility-bar/utility-bar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UtilityBarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('doc-project');
}
