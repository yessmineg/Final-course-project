public class ContractCreator {
    public static void createContractsForNegotiationOpportunities(List<Opportunity> newOpps, Map<Id, Opportunity> oldOppMap) {
        Set<Id> accountIdsToProcess = new Set<Id>();
        Map<Id, Opportunity> accountToOppMap = new Map<Id, Opportunity>();

        for (Opportunity opp : newOpps) {
            Opportunity oldOpp = oldOppMap.get(opp.Id);
            if (oldOpp.StageName != 'Negotiation/Review'
                && opp.StageName == 'Negotiation/Review'
                && opp.AccountId != null) {
                    
                accountIdsToProcess.add(opp.AccountId);
                accountToOppMap.put(opp.AccountId, opp);
            }
        }

        if (accountIdsToProcess.isEmpty()) return;

        // Supprimer les anciens contrats
        List<Contract> existingContracts = [
            SELECT Id FROM Contract WHERE AccountId IN :accountIdsToProcess
        ];

        if (!existingContracts.isEmpty()) {
            try {
                delete existingContracts;
            } catch (Exception e) {
                System.debug('Erreur lors de la suppression des anciens contrats : ' + e.getMessage());
            }
        }

        // Créer les nouveaux contrats
        List<Contract> contractsToInsert = new List<Contract>();
        for (Id accId : accountIdsToProcess) {
           Contract c = new Contract();
c.AccountId = accId;
c.StartDate = Date.today();
c.ContractTerm = 1; // durée en mois
c.Status = 'Draft';
c.Description = 'Contrat automatique - dernière version pour Account ' + accId;

            Opportunity relatedOpp = accountToOppMap.get(accId);
            if (relatedOpp != null) {
                c.Opportunity__c = relatedOpp.Id; // liaison personnalisée
            }

            contractsToInsert.add(c);
        }

        if (!contractsToInsert.isEmpty()) {
            try {
                insert contractsToInsert;
            } catch (Exception e) {
                System.debug('Erreur lors de la création des nouveaux contrats : ' + e.getMessage());
            }
        }
    }
}
