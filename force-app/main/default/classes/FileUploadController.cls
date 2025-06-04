public with sharing class FileUploadController {
    @AuraEnabled
    public static void saveFile(String recordId, String base64Data, String fileName) {
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
        Blob body = EncodingUtil.base64Decode(base64Data);
        
        ContentVersion contentVersion = new ContentVersion(
            Title = fileName,
            PathOnClient = '/' + fileName,
            VersionData = body
        );
        insert contentVersion;

        ContentDocumentLink link = new ContentDocumentLink(
            ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersion.Id].ContentDocumentId,
            LinkedEntityId = recordId,
            ShareType = 'V'
        );
        insert link;
    }
}
