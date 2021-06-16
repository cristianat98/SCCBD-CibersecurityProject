import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './iniciar/login/login.component'
import { PrincipalComponent } from './principal/principal.component';
import { LoginGuard } from './login.guard'
import { CrearComponent } from './iniciar/crear/crear.component'
import { AbrirComponent} from './iniciar/abrir/abrir.component'

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'abrir',
    component: AbrirComponent
  },
  {
    path: 'crear',
    component: CrearComponent
  },
  {
    path: 'wallet',
    canActivateChild: [LoginGuard],
    children: [
      {
        path: '',
        component: PrincipalComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
