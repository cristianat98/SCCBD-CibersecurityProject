import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  
  constructor(private router: Router) {}

  ngOnInit(): void { 
  }

  abrirWallet(): void{
    this.router.navigateByUrl('/abrir')
  }

  crearWallet(): void{
    this.router.navigateByUrl('/crear');
  }
}
