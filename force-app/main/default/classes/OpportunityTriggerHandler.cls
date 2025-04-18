public class OpportunityTriggerHandler {

    public static void handleAfterInsert(List<Opportunity> newOpps) {
        List<OpportunityLineItem> oliToInsert = new List<OpportunityLineItem>();
        Set<String> productCodes = new Set<String>();
        Map<Id, Opportunity> oppMap = new Map<Id, Opportunity>();

        // Step 1: Collect ProductCodes and map Opportunities
        for (Opportunity opp : newOpps) {
            if (String.isNotBlank(opp.ProductCode__c)) {
                productCodes.add(opp.ProductCode__c.trim());
                oppMap.put(opp.Id, opp);
            }
        }

        if (productCodes.isEmpty()) return;

        // Step 2: Get Products by ProductCode
        Map<String, Product2> codeToProductMap = new Map<String, Product2>();
        for (Product2 prod : [
            SELECT Id, Name, ProductCode
            FROM Product2
            WHERE ProductCode IN :productCodes
        ]) {
            codeToProductMap.put(prod.ProductCode, prod);
        }

        // Step 3: Get Standard Pricebook
        Id standardPricebookId = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1].Id;

        // Step 4: Get Active PricebookEntries for those Products
        Map<Id, PricebookEntry> productPriceMap = new Map<Id, PricebookEntry>();
        for (PricebookEntry entry : [
            SELECT Id, Product2Id, UnitPrice
            FROM PricebookEntry
            WHERE Pricebook2Id = :standardPricebookId
            AND Product2Id IN :codeToProductMap.values()
            AND IsActive = true
        ]) {
            productPriceMap.put(entry.Product2Id, entry);
        }

        // Step 5: Create OpportunityLineItems
        for (Opportunity opp : oppMap.values()) {
            String code = opp.ProductCode__c;
            if (String.isNotBlank(code) && codeToProductMap.containsKey(code)) {
                Product2 product = codeToProductMap.get(code);
                PricebookEntry priceEntry = productPriceMap.get(product.Id);

                if (priceEntry != null) {
                    Decimal qty = opp.number_of_employees__c != null ? opp.number_of_employees__c : 1;

                    oliToInsert.add(new OpportunityLineItem(
                        OpportunityId = opp.Id,
                        PricebookEntryId = priceEntry.Id,
                        Quantity = qty,
                        UnitPrice = priceEntry.UnitPrice
                    ));
                }
            }
        }

        // Step 6: Insert OpportunityLineItems
        if (!oliToInsert.isEmpty()) {
            insert oliToInsert;
        }
    }
}
