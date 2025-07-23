trigger UpdateQuoteStatusOnOpportunityStage on Opportunity (after update) {
    Set<Id> oppIdsToCheck = new Set<Id>();

    for (Opportunity opp : Trigger.new) {
        Opportunity oldOpp = Trigger.oldMap.get(opp.Id);
        // Vérifie que le stage a changé
        if (opp.StageName != oldOpp.StageName &&
            (opp.StageName == 'Negotiation/Review' || opp.StageName == 'Closed Lost')) {
            oppIdsToCheck.add(opp.Id);
        }
    }

    if (!oppIdsToCheck.isEmpty()) {
        List<Quote> quotesToUpdate = new List<Quote>();

        // Récupère les quotes associés
        List<Quote> relatedQuotes = [
            SELECT Id, OpportunityId, Status 
            FROM Quote 
            WHERE OpportunityId IN :oppIdsToCheck
        ];

        Map<Id, Opportunity> oppMap = new Map<Id, Opportunity>([
            SELECT Id, StageName FROM Opportunity WHERE Id IN :oppIdsToCheck
        ]);

        for (Quote q : relatedQuotes) {
            Opportunity opp = oppMap.get(q.OpportunityId);
            if (opp != null) {
                if (opp.StageName == 'Negotiation/Review') {
                    q.Status = 'Accepted';
                } else if (opp.StageName == 'Closed Lost') {
                    q.Status = 'Denied';
                }
                quotesToUpdate.add(q);
            }
        }

        if (!quotesToUpdate.isEmpty()) {
            update quotesToUpdate;
        }
    }
}
