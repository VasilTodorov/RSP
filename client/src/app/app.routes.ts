import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { RecipeListComponent } from './features/recipes/recipe-list/recipe-list.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // The Landing Page
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'recipes', component: RecipeListComponent },
  { path: '**', redirectTo: '' } // Wildcard sends back home
];