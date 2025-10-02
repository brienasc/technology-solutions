import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-rodape',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rodape.html',
  styleUrl: './rodape.css'
})
export class Rodape {
}
