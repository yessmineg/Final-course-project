public with sharing class ContractStatusUpdater {
    @AuraEnabled
    public static void updateStatusToApproval(Id contractId) {
        Contract c = [SELECT Id, Status FROM Contract WHERE Id = :contractId LIMIT 1];
        c.Status = 'In Approval Process';
        update c;
    }
}
