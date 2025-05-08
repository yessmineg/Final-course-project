trigger EmailQuoteStatusUpdate on EmailMessage (after insert) {
    Set<Id> quoteIds = new Set<Id>();

    for (EmailMessage em : Trigger.new) {
        if (em.RelatedToId != null && em.RelatedToId.getSObjectType() == Quote.SObjectType) {
            quoteIds.add(em.RelatedToId);
        }
    }

    if (!quoteIds.isEmpty()) {
        List<Quote> quotesToUpdate = [
            SELECT Id, Status, OpportunityId, Opportunity.StageName
            FROM Quote
            WHERE Id IN :quoteIds
        ];

        List<Opportunity> oppsToUpdate = new List<Opportunity>();

        for (Quote q : quotesToUpdate) {
            q.Status = 'presented'; // or 'Presented' if that's your desired status

            if (q.OpportunityId != null && q.Opportunity.StageName == 'Qualification') {
                Opportunity opp = new Opportunity(
                    Id = q.OpportunityId,
                    StageName = 'Proposal/Price Quote'
                );
                oppsToUpdate.add(opp);
            }
        }

        update quotesToUpdate;
        if (!oppsToUpdate.isEmpty()) {
            update oppsToUpdate;
        }
    }
}
