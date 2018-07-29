import { Component, OnInit, ViewChild } from '@angular/core'; 
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {Observable, Subject, merge} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import { Currency } from '../Models/currency';
import { HttpClient } from '@angular/common/http'; 
 
 

  @Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
  })


export class HomeComponent implements OnInit {
 
  public currencyList : String[];
  public currency : Currency = new Currency(""); 

  constructor(private http : HttpClient) { 
    this.getData();
    
  }

  getData(){
    this.http.get<Currency[]>('https://laravel-xoed.frb.io/api/currencies').subscribe(result => {
      if(result.length > 0){
        this.currencyList = [];
        for(var i =0;i<result.length;i++){ 
          let model : Currency = new Currency(result[i].code);
          this.currencyList.push(model.code); 
        }
      }
     });
  }

  ngOnInit(){
  }
  
  @ViewChild('instance') instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();


  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(100), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;
    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.currencyList : this.currencyList.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }

  updateRates(){ 
    console.log([this.currency.amount,this.currency.code,this.currency.cur_date]);
    //  this.http.post('https://laravel-xoed.frb.io/api/convert', [this.currency.amount,this.currency.code,this.currency.cur_date]).subscribe(result => {
    //   console.log(result);
    //  });
  }

  // Format Number
  validateAmount(){
    var valid = /^\d{0,4}(\.\d{0,2})?$/.test(this.currency.amount),
    val = this.currency.amount;
 
    if(!valid){ 
        this.currency.amount = val.substr(0, val.length - 1);
    }
  }
}
