trigger OpportunityTrigger on Opportunity (after insert) {
    OpportunityTriggerHandler.handleAfterInsert(Trigger.new);
}
