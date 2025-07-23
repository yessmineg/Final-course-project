trigger ComplaintFileHandler on Complaint__c (after insert) {
    Set<Id> contactIds = new Set<Id>();
    Map<Id, Id> complaintToContact = new Map<Id, Id>();

    // Récupérer les Contact__c liés aux nouvelles plaintes
    for (Complaint__c complaint : Trigger.new) {
        if (complaint.Contact__c != null) {
            contactIds.add(complaint.Contact__c);
            complaintToContact.put(complaint.Id, complaint.Contact__c);
        }
    }

    // Ne rien faire si pas de contacts à traiter
    if (contactIds.isEmpty()) {
        return;
    }

    // Récupérer les ContentDocumentLinks liés aux contacts
    List<ContentDocumentLink> contactLinks = [
        SELECT ContentDocumentId, LinkedEntityId
        FROM ContentDocumentLink
        WHERE LinkedEntityId IN :contactIds
    ];

    List<ContentDocumentLink> newLinks = new List<ContentDocumentLink>();
    List<ContentDocumentLink> linksToDelete = new List<ContentDocumentLink>();

    // Pour optimiser la recherche, crée une map ContactId -> List des ContentDocumentId
    Map<Id, List<ContentDocumentLink>> contactIdToLinks = new Map<Id, List<ContentDocumentLink>>();
    for (ContentDocumentLink link : contactLinks) {
        if (!contactIdToLinks.containsKey(link.LinkedEntityId)) {
            contactIdToLinks.put(link.LinkedEntityId, new List<ContentDocumentLink>());
        }
        contactIdToLinks.get(link.LinkedEntityId).add(link);
    }

    // Pour chaque plainte, crée des liens vers les fichiers du contact associé
    for (Id complaintId : complaintToContact.keySet()) {
        Id contactId = complaintToContact.get(complaintId);
        if (contactIdToLinks.containsKey(contactId)) {
            for (ContentDocumentLink link : contactIdToLinks.get(contactId)) {
                newLinks.add(new ContentDocumentLink(
                    ContentDocumentId = link.ContentDocumentId,
                    LinkedEntityId = complaintId,
                    ShareType = 'V',       // Viewer access
                    Visibility = 'AllUsers'
                ));
                // Prépare à supprimer l'ancien lien (au contact)
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
