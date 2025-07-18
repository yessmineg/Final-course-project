public class ContractCreator {
    public static void createContractsForNegotiationOpportunities(List<Opportunity> newOpps, Map<Id, Opportunity> oldOppMap) {
        // Map AccountId -> liste d'opportunités à traiter (pour éviter doublons)
        Set<Id> accountIdsToProcess = new Set<Id>();

        for (Opportunity opp : newOpps) {
            Opportunity oldOpp = oldOppMap.get(opp.Id);
            if (oldOpp.StageName != 'Negotiation/Review' && opp.StageName == 'Negotiation/Review' && opp.AccountId != null) {
                accountIdsToProcess.add(opp.AccountId);
            }
        }

        if (accountIdsToProcess.isEmpty()) {
            return; // rien à faire
        }

        // Récupérer les contrats existants pour ces AccountIds
        List<Contract> existingContracts = [
            SELECT Id, AccountId 
            FROM Contract 
            WHERE AccountId IN :accountIdsToProcess
        ];

        // Supprimer les contrats existants
        if (!existingContracts.isEmpty()) {
            try {
                delete existingContracts;
            } catch (Exception e) {
                System.debug('Erreur lors de la suppression des anciens contrats : ' + e.getMessage());
                // Optionnel : gestion d'erreur plus fine ici
            }
        }

        // Créer un contrat par AccountId
        List<Contract> contractsToInsert = new List<Contract>();
        for (Id accId : accountIdsToProcess) {
            Contract c = new Contract();
            c.AccountId = accId;
            c.StartDate = Date.today();
            c.Status = 'Draft'; // adapter selon ta config
            c.Description = 'Contrat automatique - dernière version pour Account ' + accId;
            // Ajouter d'autres champs obligatoires si besoin
            contractsToInsert.add(c);
        }

        if (!contractsToInsert.isEmpty()) {
            try {
                insert contractsToInsert;
            } catch (Exception e) {
                System.debug('Erreur lors de la création des nouveaux contrats : ' + e.getMessage());
                // Gestion d'erreur si besoin
            }
        }
    }
}
