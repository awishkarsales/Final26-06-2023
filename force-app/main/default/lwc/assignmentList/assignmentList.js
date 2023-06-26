import { api, LightningElement, wire } from 'lwc';  
import getAllassignmentList from '@salesforce/apex/assignmentListController.getAllassignmentList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class AssignmentList extends LightningElement {
    listRecs = [];  
    filterFieldAPI = 'Title__c';
    isLoading = false;
    initialListRecs;  
    error;  
    columns;  
    items = [];  
    page = 1;  
    startingRecord = 1;  
    endingRecord = 0;  
    pageSize = 10;  
    totalRecountCount = 0;  
    totalPage = 0;  
    isShowModal = false;
    message;
  
    @api Fields;  
    @api TableColumns;  
    @api Title;  
    @api ObjectName;  
    @api OrderBy;
  
    connectedCallback() {  
        console.log( 'Columns are ==>> ' + this.TableColumns );  
        this.columns = JSON.parse( this.TableColumns.replace( /([a-zA-Z0-9]+?):/g, '"$1":' ).replace( /'/g, '"' ) );  
        console.log( 'Columns are ' + JSON.stringify(this.columns) ); 
    }  
 
    get vals() {   
        console.log( 'this.ObjectName ' + this.ObjectName );  
        console.log( 'this.Fields' + this.Fields );  
        return this.ObjectName + '-' + this.Fields + '-' + this.OrderBy;  
    }  
    

    @wire(getAllassignmentList, { listValues: '$vals' })  
    wiredRecs( { error, data } ) {  
 
        if(data) {  
            this.listRecs = data;  
            let newData;  
            newData = JSON.parse(JSON.stringify(data));  
            this.items = newData;  
            this.initialListRecs = this.items;  
            this.totalRecountCount = data.length;  
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);  
            this.listRecs = this.items.slice(0,this.pageSize);  
            this.endingRecord = this.pageSize;  
        } else if (error) {  
            this.listRecs = null;  
            this.initialListRecs = null;  
            this.error = error;
            console.log(error);
        }
    }

    handleRefresh(event){
        getAllassignmentList({ searchKey: this.searchKey })
        .then((result) => {
            this.contacts = result;
            this.error = undefined;
        })
        .catch((error) => {
            this.error = error;
            this.contacts = undefined;
        });  
    }
 
    //this method displays records page by page
    displayRecordPerPage(page){
 
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);
 
        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 
 
        this.listRecs = this.items.slice(this.startingRecord, this.endingRecord);
 
        this.startingRecord = this.startingRecord + 1;
    }    
 
    //clicking on previous button this method will be called
    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }

    //clicking on next button this method will be called
    nextHandler() {
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }             
    }
 
    get showButtonPrevious(){
        return this.page === 1;
    }
 
    get showButtonNext(){
        return this.page === this.totalPage;
    }
  
    handleKeyChange(event) {     
        const searchKey = event.target.value.toLowerCase();  
        console.log( 'Search Key is ' + searchKey );
        if (searchKey) { 
            this.listRecs = this.initialListRecs;
             if (this.listRecs) {
                let recs = [];
                for ( let rec of this.listRecs ) {
                    if ( (rec[this.filterFieldAPI]).toLowerCase().includes(searchKey)) {
                        recs.push( rec );
                        break;
                   }
                }
                console.log( 'Recs are ' + JSON.stringify( recs ) );
                this.items = recs;
             }
  
        }else {
            this.items = this.initialListRecs;
        }
 
        this.page = 1; 
        this.startingRecord = 1;
        this.endingRecord = 0; 
        this.totalPage = 0;
 
        this.totalRecountCount = this.items.length; 
        this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
        this.listRecs = this.items.slice(0,this.pageSize); 
        this.endingRecord = this.pageSize;
    }  
 
    handleRowAction( event ) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if(actionName === 'edit'){
            this.isShowModal = true;
            //console.log('User wants to edit record....');
            setTimeout(callback =>{
            let child = this.template.querySelector('c-assignment-form');
            child.callFromParent(row.Id,actionName,this.columns,this.ObjectName);
            },1000);
        }    
    }
        
    callFromChild(event){
        console.log('Clossing popup from child....',JSON.stringify(event.detail));
        this.isLoading = true;
        if(event.detail.title === 'Create'){
            this.message = 'Record Created';
        }else{
            this.message = 'Record Updated';
        }
        setTimeout(callback =>{
            const evt = new ShowToastEvent({
                title: this.message,
                message: 'Opearation sucessful',
                variant: 'success',
                mode: 'dismissable'
            });
            this.dispatchEvent(evt);
            this.handleIsLoading(false);
            },1000);
        this.isShowModal = event.detail.isShowModal;
        var EventData = event.detail;
        console.log('Event Data...',EventData.dataToPush);
        this.listRecs.push(EventData.dataToPush);
        var intialData = this.listRecs;
        console.log(intialData);
        this.listRecs = undefined;
        this.listRecs = intialData;
    }
    
    hideModalBox(event){
        this.isShowModal = false;
    }

    updateRecordView() {
        setTimeout(() => {
             eval("$A.get('e.force:refreshView').fire();");
        }, 3000); 
        
    }

    handleIsLoading(isLoading) {
        this.isLoading = isLoading;
    }

    createRecord(){
        this.isShowModal = true;
        let actionName = 'Create';
          //  console.log('User wants to Create record....12');
            setTimeout(callback =>{
            let child = this.template.querySelector('c-assignment-form');
            child.callFromParent('',actionName,this.columns,this.ObjectName);
            },1000);
    }
}