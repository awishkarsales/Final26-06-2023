public without sharing class assignmentListController {
    @AuraEnabled
    public static list<Contact> fetchContacts(){        
            list<Contact> lstContact = new list<Contact>();
            for(Contact con : [SELECT id,name,email,phone,title FROM Contact LIMIT 5000]){
                lstContact.add(con);
            } 
            return lstContact;        
    }
    @AuraEnabled( cacheable = true )  
    public static List <sObject> getAllassignmentList(String listValues) {
        
        List<String> strList = listValues.split( '-' );  
        system.debug( 'values are ' + strList );   
        String strObject = strList.get(0);
        String strFields = strList.get(1);
        String ordBy = strList.get(2);
         
        List <sObject> listRecs = new List < sObject >();
        String strSOQL = 'SELECT Id, ' + strFields + ' FROM ' + strObject ;
        If(String.isNotBlank(ordby)){
            strSOQL +=' ORDER BY ' + ordBy;
        }
         
        strSOQL += ' LIMIT 100';
        system.debug( 'SOQL is ' + strSOQL );
        listRecs = Database.query( strSOQL );
        system.debug('assignmentList>>> '+listRecs);
        return listRecs;
    } 
    
    @AuraEnabled( cacheable = false ) 
    public static Assignment__c updateAssignmentRecord(string listValues, String objectName, String actionType) {
        system.debug('actionType.... '+actionType);
        system.debug('objectName .... '+objectName);
        Database.UpsertResult SR;
        Assignment__c assign = (Assignment__c)JSON.deserialize( listValues, Assignment__c.class);
        system.debug('Assignment__c .... '+assign);
        SR = Database.upsert(assign, False);
        if(SR.isSuccess()){
            system.debug(assign);
            return assign;
        }else{
            return assign;
        }
    } 
}