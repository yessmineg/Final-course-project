trigger CreateQuoteFromOpportunity on Opportunity (after insert, after update) {
    List<Quote> quotesToInsert = new List<Quote>();
    Map<Id, Opportunity> oppMap = new Map<Id, Opportunity>();

    for (Opportunity opp : Trigger.new) {
        Opportunity oldOpp = Trigger.isUpdate ? Trigger.oldMap.get(opp.Id) : null;

        Boolean shouldCreateQuote = Trigger.isInsert ||
        (oldOpp != null && oldOpp.StageName != 'Qualification' && opp.StageName == 'Qualification');
    
        if (shouldCreateQuote) {
            Quote q = new Quote(
                Name = 'Quote for ' + opp.Name,
                OpportunityId = opp.Id,
                ExpirationDate = System.today().addDays(30),
                Status = 'In Review',
                BillingName = opp.Account.Name,
                ShippingName = opp.Account.Name
            );
            quotesToInsert.add(q);
            oppMap.put(opp.Id, opp);
        }
    }

    if (!quotesToInsert.isEmpty()) {
        insert quotesToInsert;

        // Map OpportunityId to newly created Quote Id
        Map<Id, Id> oppToQuoteIdMap = new Map<Id, Id>();
        for (Quote q : quotesToInsert) {
            oppToQuoteIdMap.put(q.OpportunityId, q.Id);
        }

        // Get Opportunity Products (OpportunityLineItems)
        List<OpportunityLineItem> oppLineItems = [
            SELECT Id, OpportunityId, Quantity, UnitPrice, PricebookEntryId
            FROM OpportunityLineItem
            WHERE OpportunityId IN :oppToQuoteIdMap.keySet()
        ];

        List<QuoteLineItem> quoteLineItemsToInsert = new List<QuoteLineItem>();

        for (OpportunityLineItem oli : oppLineItems) {
            Id quoteId = oppToQuoteIdMap.get(oli.OpportunityId);
            if (quoteId != null) {
                quoteLineItemsToInsert.add(new QuoteLineItem(
                    QuoteId = quoteId,
                    Quantity = oli.Quantity,
                    UnitPrice = oli.UnitPrice,
                    PricebookEntryId = oli.PricebookEntryId
                ));
            }
        }

        if (!quoteLineItemsToInsert.isEmpty()) {
            insert quoteLineItemsToInsert;
        }
    }
}
