trigger LinkQuotesToContract on Contract (after insert) {
    // Collecte des AccountIds et ContractIds
    Map<Id, Id> accountToContractId = new Map<Id, Id>();
    Set<Id> accountIds = new Set<Id>();

    for (Contract c : Trigger.new) {
        if (c.AccountId != null) {
            accountIds.add(c.AccountId);
            accountToContractId.put(c.AccountId, c.Id);
        }
    }

    if (accountIds.isEmpty()) return;

    // Récupérer les quotes non liés à un contrat mais liés aux comptes concernés
    List<Quote> quotesToUpdate = [
        SELECT Id, Contract__c, Opportunity.AccountId
        FROM Quote
        WHERE Opportunity.AccountId IN :accountIds
        AND Contract__c = null
    ];

    // Affecter le champ lookup Contract__c au contrat correspondant
    for (Quote q : quotesToUpdate) {
        Id contractId = accountToContractId.get(q.Opportunity.AccountId);
        if (contractId != null) {
            q.Contract__c = contractId;
        }
    }

    if (!quotesToUpdate.isEmpty()) {
        update quotesToUpdate;
    }
}
