trigger OpportunityAfterUpdate on Opportunity (after update) {
    Set<Id> opportunityIdsToProcess = new Set<Id>();

    for (Opportunity opp : Trigger.new) {
        Opportunity oldOpp = Trigger.oldMap.get(opp.Id);

        if (opp.StageName == 'Closed Won' && oldOpp.StageName != 'Closed Won') {
            opportunityIdsToProcess.add(opp.Id);
        }
    }

    if (!opportunityIdsToProcess.isEmpty()) {
        OpportunityContactUserImporter.importFromContentDocuments(new List<Id>(opportunityIdsToProcess));
    }
}
0