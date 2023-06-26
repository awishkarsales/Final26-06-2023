import { LightningElement , api,track} from 'lwc';
import updateAssignmentRecord from '@salesforce/apex/assignmentListController.updateAssignmentRecord';   

// eslint-disable-next-line @lwc/lwc/no-leading-uppercase-api-name
export default class AssignmentForm extends LightningElement {
    Fields;
    recordId;
    actionType;
    fieldwithvalue = [];
    isShowModal;
    objectName;
    item = {};
    @api callFromParent(paremt1, paremt2 , paremt3, paremt4){
         console.log('Api call For Create>>>>',paremt1);
         console.log('paremt2>>>>',paremt2);
        console.log('paremt3>>>>',paremt3);
        // console.log('paremt4>>>>',paremt4);
        this.actionType = paremt2;
        if(this.actionType==='edit'){
            this.recordId = paremt1;
        }
        let recs = [];
        for ( let val of paremt3 ) {
            recs.push (val.fieldName);
        }
        this.fieldwithvalue = recs;
        this.objectName = paremt4;
        console.log('this.actionType>>>>',this.actionType);
    }

    updateRecordField(event) {
        let name = event.target.name;
        console.log(name);
        if (
          Object.prototype.hasOwnProperty.call(
            this.contactRecordEditable.fields,
            name
          ) &&
          this.contactRecordEditable.fields[name]
        ) {
          console.log(this.contactRecordEditable.fields[name].value);
          this.contactRecordEditable.fields[name].value = event.target.value;
        }
        console.log(this.contactRecordEditable);
      }

      saveRecord() {
        console.log('Closing popup....');
        
      }
      
      handleSubmit(event) {
        event.preventDefault(); // stop the form from submitting
        const fields = event.detail.fields;
        
        let newData = JSON.parse(JSON.stringify(fields));
        newData.Id = this.recordId;
        let newRecords = newData; 
        this.item = newRecords;
        let abc = JSON.stringify(this.item);
        console.log('Updated field value',this.item);
        if(abc){
            updateAssignmentRecord({ listValues: abc,objectName:this.objectName ,actionType:this.actionType})
            .then(result => {
                // console.log('update methode result....',result);
                this.isShowModal = false;
                let ev = new CustomEvent("abc", 
                                        {detail : {isShowModal:this.isShowModal,title:this.actionType,dataToPush : result}}
                                        );
                this.dispatchEvent(ev); 
            })
            .catch(error => {
                console.log('update methode error result....',error);
            })
        }
    }
}