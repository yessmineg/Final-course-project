trigger UpdateLeadStatusOnEmail on EmailMessage (after insert) {
    Set<Id> leadIds = new Set<Id>();
    
    for (EmailMessage em : Trigger.New) {
        if (!em.Incoming && em.ParentId != null && String.valueOf(em.ParentId).startsWith('00Q')) {
            leadIds.add(em.ParentId);
        }
    }
    
    if (!leadIds.isEmpty()) {
        List<Lead> leadsToUpdate = new List<Lead>();
        for (Lead ld : [SELECT Id, Status FROM Lead WHERE Id IN :leadIds]) {
            ld.Status = 'Working - Contacted';
            leadsToUpdate.add(ld);
        }
        update leadsToUpdate;
    }
}
