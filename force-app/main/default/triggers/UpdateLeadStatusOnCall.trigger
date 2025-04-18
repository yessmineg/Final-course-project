trigger UpdateLeadStatusOnCall on Task (after insert) {
    // Collect all Lead Ids related to logged calls
    Set<Id> leadIdsToUpdate = new Set<Id>();

    for (Task t : Trigger.new) {
        if (t.WhatId == null && 
            t.WhoId != null &&
            t.Subject != null &&
            (t.Subject.equalsIgnoreCase('Call') || t.Subject.equalsIgnoreCase('Log a Call')) &&
            String.valueOf(t.WhoId).startsWith('00Q')) { // 00Q = Lead prefix
                leadIdsToUpdate.add(t.WhoId);
        }
    }

    if (!leadIdsToUpdate.isEmpty()) {
        List<Lead> leadsToUpdate = [SELECT Id, Status FROM Lead WHERE Id IN :leadIdsToUpdate];

        for (Lead l : leadsToUpdate) {
            if (l.Status == 'Open - Not Contacted') {
                l.Status = 'Working - Contacted';
            }
        }

        if (!leadsToUpdate.isEmpty()) {
            update leadsToUpdate;
        }
    }
}
