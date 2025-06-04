    trigger ComplaintFileHandler on Complaint__c (after insert) {
    Set<Id> contactIds = new Set<Id>();
    Map<Id, Id> complaintToContact = new Map<Id, Id>();

    for (Complaint__c r : Trigger.new) {
        if (r.Contact__c != null) {
            contactIds.add(r.Contact__c);
            complaintToContact.put(r.Id, r.Contact__c);
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
        // Find the complaint(s) that reference this contact
        for (Id ComplaintId : complaintToContact.keySet()) {
            if (complaintToContact.get(ComplaintId) == link.LinkedEntityId) {
                // Clone the file link to Complaint
                newLinks.add(new ContentDocumentLink(
                    ContentDocumentId = link.ContentDocumentId,
                    LinkedEntityId = ComplaintId,
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


