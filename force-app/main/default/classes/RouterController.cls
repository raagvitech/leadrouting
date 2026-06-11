public with sharing class RouterController {
    
    @AuraEnabled(cacheable=true)
    public static List<Router_Rule__c> getRouterRules(String targetObject) {
        try {
            return [
                SELECT Id, 
                       Order__c, //Number
                       Name,
                       Enabled__c, //Boolean
                       Status__c, //Picklist
                       Assignment_Method__c, //Picklist
                       Connected_Queue__c, //Lookup to Group
                       Criteria__c, //Text
                       Overflow_Behavior__c, //Picklist
                       Assigned_Count__c//Number
                FROM Router_Rule__c
                WHERE Router__r.Name = :targetObject
                ORDER BY Order__c ASC
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching router rules: ' + e.getMessage());
        }
    }


    //Added Code
    // @AuraEnabled
    // public static Router__c createRouter(String routerName,String objectName,String assignedField,String evaluationOrder) 
    // {
    //     try {
    //         Router__c newRouter = new Router__c(
    //             Name = routerName,
    //             Target_Object__c = objectName
    //             Assigned_Field__c = assignedField,
    //             Evaluation_Order__c = evaluationOrder
    //         );
    //         insert newRouter;
    //         return newRouter;
    //     } catch (Exception e) {
    //         throw new AuraHandledException('Error creating router: ' + e.getMessage()); 
    // }
    // }
}