    trigger FileUploadTrigger on ContentDocumentLink (after insert) {
        Set<Id> opportunityIds = new Set<Id>();
    
        for (ContentDocumentLink cdl : Trigger.new) {
            if (cdl.LinkedEntityId != null && String.valueOf(cdl.LinkedEntityId).startsWith('006')) { // 006 = Opportunity
                opportunityIds.add(cdl.LinkedEntityId);
            }
        }
    
        if (!opportunityIds.isEmpty()) {
            List<Opportunity> oppsToUpdate = [
                SELECT Id, StageName 
                FROM Opportunity 
                WHERE Id IN :opportunityIds AND StageName = 'Prospecting'
            ];
    
            for (Opportunity opp : oppsToUpdate) {
                opp.StageName = 'Qualification';
            }
    
            if (!oppsToUpdate.isEmpty()) {
                update oppsToUpdate;
            }
        }
    }
    