trigger OpportunityContratTrigger on Opportunity (after update) {
    if (Trigger.isAfter && Trigger.isUpdate) {
        ContractCreator.createContractsForNegotiationOpportunities(Trigger.new, Trigger.oldMap);
    }
}
