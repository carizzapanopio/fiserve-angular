 

export class Currency {

    public code : string;
    public name : string; 
    public amount : string;
    public cur_date : string;
    public api_url : string;
    public convered_rate: string;

    constructor(code: string){
        this.code = code;
    	// this.api_url = "https://laravel-xoed.frb.io/";
    	this.api_url = "http://localhost/fiserve/public/api/";
    };
 

}
