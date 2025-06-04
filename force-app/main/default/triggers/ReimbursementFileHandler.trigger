trigger ReimbursementFileHandler on Reimbursement_Request__c (after insert) {
    Set<Id> contactIds = new Set<Id>();
    Map<Id, Id> reimbursementToContact = new Map<Id, Id>();

    for (Reimbursement_Request__c r : Trigger.new) {
        if (r.Contact__c != null) {
            contactIds.add(r.Contact__c);
            reimbursementToContact.put(r.Id, r.Contact__c);
        }
    }

    // Get all ContentDocumentLinks related to the contacts
    List<ContentDocumentLink> contactLinks = [
        SELECT ContentDocumentId, LinkedEntityId
        FROM ContentDocumentLink
        WHERE LinkedEntityId IN :contactIds
    ];

    List<ContentDocumentLink> newLinks = new List<ContentDocumentLink>();
    List<ContentDocumentLink> linksToDelete = new List<ContentDocumentLink>();

    for (ContentDocumentLink link : contactLinks) {
        // Find the reimbursement(s) that reference this contact
        for (Id reimbursementId : reimbursementToContact.keySet()) {
            if (reimbursementToContact.get(reimbursementId) == link.LinkedEntityId) {
                // Clone the file link to reimbursement
                newLinks.add(new ContentDocumentLink(
                    ContentDocumentId = link.ContentDocumentId,
                    LinkedEntityId = reimbursementId,
                    ShareType = 'V', // Viewer access
                    Visibility = 'AllUsers'
                ));
                // Prepare the original link for deletion
                linksToDelete.add(link);
            }
        }
    }

    if (!newLinks.isEmpty()) {
        insert newLinks;
    }
    if (!linksToDelete.isEmpty()) {
        delete linksToDelete;
    }
}
