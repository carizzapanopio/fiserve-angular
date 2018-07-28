export class Currency {

    public Code : string;
    public Name : string;
    public Rate : number; 
    public CurrencyDate : Date;

    constructor(){};

    loadData(Code : string, Name : string, Rate : number, CurrencyDate : Date){
        this.Code = Code; 
        this.Rate = Rate;
        this.CurrencyDate = CurrencyDate;
    }

}
