public with sharing class ContractPDFController {
    public Contract contract { get; private set; }
    public List<Quote> quotes { get; private set; }
    public Map<Id, List<QuoteLineItem>> quoteLineItemsMap { get; private set; }
    public User currentUser { get; private set; }

    public ContractPDFController(ApexPages.StandardController std) {
        Id contractId = std.getId();

        contract = [
            SELECT Id, Account.Name, StartDate, EndDate, Status
            FROM Contract WHERE Id = :contractId
        ];

        currentUser = [SELECT CompanyName FROM User WHERE Id = :UserInfo.getUserId()];

        quotes = [
            SELECT Id, Name, TotalPrice, ExpirationDate, Status
            FROM Quote WHERE Contract__c = :contract.Id
        ];

        quoteLineItemsMap = new Map<Id, List<QuoteLineItem>>();
        for (Quote q : quotes) {
            List<QuoteLineItem> qlis = [
                SELECT Quantity, UnitPrice, TotalPrice, Product2.Name
                FROM QuoteLineItem WHERE QuoteId = :q.Id
            ];
            quoteLineItemsMap.put(q.Id, qlis);
        }
    }

    // ✅ Méthode statique pour générer et attacher le PDF au contrat
    public static Id generateAndAttachPDF(Id contractId) {
        // Générer le contenu PDF depuis la page Visualforce
        PageReference pdfPage = Page.ContractPDF;
        pdfPage.getParameters().put('id', contractId);
        Blob pdfBlob;
        try {
            pdfBlob = pdfPage.getContent();
        } catch (Exception e) {
            throw new AuraHandledException('Erreur lors de la génération du PDF: ' + e.getMessage());
        }

        // Créer le fichier (ContentVersion)
        ContentVersion cv = new ContentVersion();
        cv.Title = 'Contract_' + contractId;
        cv.PathOnClient = 'Contract_' + contractId + '.pdf';
        cv.VersionData = pdfBlob;
        insert cv;

        // Récupérer ContentDocumentId et créer le lien vers le Contract
        Id contentDocumentId = [
            SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id
        ].ContentDocumentId;

        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = contentDocumentId;
        cdl.LinkedEntityId = contractId;
        cdl.ShareType = 'V';
        cdl.Visibility = 'AllUsers';
        insert cdl;

        return cv.Id;
    }
}
