import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivateChild {

  constructor(private router: Router){}
  
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (environment.login === true){
        return true;
      }

      else{
        this.router.navigateByUrl('/login')
        return false;
      }
  }
}
