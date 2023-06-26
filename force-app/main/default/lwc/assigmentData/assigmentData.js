import { api, LightningElement, wire} from 'lwc';
//Import apex method 
import getAllassignmentList from '@salesforce/apex/assignmentListController.getAllassignmentList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class DatatableWithPagination extends LightningElement {
    
    // JS Properties 
    filterFieldAPI = 'Title__c';
    pageSizeOptions = [5, 10, 25, 50, 75, 100]; //Page size options
    records = []; //All records available in the data table
    columns = []; //columns information available in the data table
    totalRecords = 0; //Total no.of records
    pageSize; //No.of records to be displayed per page
    totalPages; //Total no.of pages
    pageNumber = 1; //Page number    
    recordsToDisplay = []; //Records to be displayed on the page
    items = [];
    isShowModal = false;
    isLoading = false;
    
    get bDisableFirst() {
        return this.pageNumber == 1;
    }
    get bDisableLast() {
        return this.pageNumber == this.totalPages;
    }
    // connectedCallback method called when the element is inserted into a document
    connectedCallback() {
        this.columns = [{label:'Assignment Name', fieldName:'Name', sortable:false}, {label:'Title',fieldName:'Title__c'}, {label:'Description',fieldName:'Description__c'}, {label:'DueDate',fieldName:'DueDate__c'},{label:'Status',fieldName:'Status__c'},{type:'action',typeAttributes:{rowActions:[{label:'Edit',name:'edit'}]}}];
    }
    @wire(getAllassignmentList, { listValues:  'Assignment__c-Name, Title__c, Description__c, DueDate__c,Status__c-DueDate__c'})  
    wiredRecs( { error, data } ) {  
 
        if(data) {  
            this.initialListRecs = data;
            this.records = data;
            this.totalRecords = data.length; // update total records count                 
            this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
            this.paginationHelper(); // call helper menthod to update pagination logic  
             
        } else if (error) {  
            
            console.log(error);
        }
    }
    handleKeyChange(event) {     
        const searchKey = event.target.value.toLowerCase();  
        console.log( 'Search Key is ' + searchKey );
        if (searchKey) { 
            this.records = this.initialListRecs;
             if (this.records) {
                let recs = [];
                for ( let rec of this.records ) {
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
        this.records = this.items;
        this.totalRecords = this.records.length; // update total records count                 
        this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
        this.paginationHelper();
        
    }
    handleRecordsPerPage(event) {
        this.pageSize = event.target.value;
        this.paginationHelper();
    }
    previousPage() {
        this.pageNumber = this.pageNumber - 1;
        this.paginationHelper();
    }
    nextPage() {
        this.pageNumber = this.pageNumber + 1;
        this.paginationHelper();
    }
    firstPage() {
        this.pageNumber = 1;
        this.paginationHelper();
    }
    hideModalBox(event){
        this.isShowModal = false;
    }
    createRecord(){
        this.isShowModal = true;
        let actionName = 'Create';
          //  console.log('User wants to Create record....12');
            setTimeout(callback =>{
            let child = this.template.querySelector('c-assignment-form');
            child.callFromParent('',actionName,this.columns,'Assignment__c');
            },1000);
    }
    handleRowAction( event ) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if(actionName === 'edit'){
            this.isShowModal = true;
            //console.log('User wants to edit record....');
            setTimeout(callback =>{
            let child = this.template.querySelector('c-assignment-form');
            child.callFromParent(row.Id,actionName,this.columns,'Assignment__c');
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
        var dataTableww=[];
        if(EventData.title == 'Create'){
            for ( let rec of this.records ) {
                dataTableww.push( rec );
        }
        dataTableww.push( EventData.dataToPush );
        this.initialListRecs = dataTableww;
        this.records = dataTableww;
        //console.log(JSON.stringify(this.records));
        this.totalRecords = this.records.length; // update total records count                 
        this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
        this.paginationHelper();
        }else{
            var i = 0;
            for ( let rec of this.records ) {
                if(rec.Id === EventData.dataToPush.Id){
                    alert(rec.Id);
                    alert(EventData.dataToPush.Id);
                    dataTableww[i] = EventData.dataToPush;
                }
                
                i++;
            }
        this.initialListRecs = dataTableww;
        this.records = dataTableww;
        //console.log(JSON.stringify(this.records));
        this.totalRecords = this.records.length; // update total records count                 
        this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
         //this.paginationHelper();
        }
        
       // console.log(JSON.stringify(this.records));
        
    }
    handleIsLoading(isLoading) {
        this.isLoading = isLoading;
    }
    lastPage() {
        this.pageNumber = this.totalPages;
        this.paginationHelper();
    }
    // JS function to handel pagination logic 
    paginationHelper() {
        this.recordsToDisplay = [];
        // calculate total pages
        this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        // set page number 
        if (this.pageNumber <= 1) {
            this.pageNumber = 1;
        } else if (this.pageNumber >= this.totalPages) {
            this.pageNumber = this.totalPages;
        }
        // set records to display on current page 
        for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
            if (i === this.totalRecords) {
                break;
            }
            this.recordsToDisplay.push(this.records[i]);
        }
    }
}