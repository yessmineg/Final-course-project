public with sharing class OpportunityContactUserImporter {
    public static final Id TARGET_PROFILE_ID = '00eQy00000BWqla'; // Replace with actual Profile Id
    public static final String USERNAME_DOMAIN = 'mydomain.com';  // Replace with your org's allowed domain

    public static void importFromContentDocuments(List<Id> opportunityIds) {
        System.debug('DEBUG: importFromContentDocuments called with Opportunity IDs: ' + opportunityIds);

        // Get ContentDocumentLinks
        List<ContentDocumentLink> docLinks = [
            SELECT ContentDocumentId, LinkedEntityId
            FROM ContentDocumentLink
            WHERE LinkedEntityId IN :opportunityIds
        ];
        if (docLinks.isEmpty()) return;

        Set<Id> contentDocIds = new Set<Id>();
        Map<Id, Id> oppIdByContentDocId = new Map<Id, Id>();
        for (ContentDocumentLink cdl : docLinks) {
            contentDocIds.add(cdl.ContentDocumentId);
            oppIdByContentDocId.put(cdl.ContentDocumentId, cdl.LinkedEntityId);
        }

        // Get latest content versions
        List<ContentVersion> contentVersions = [
            SELECT Id, Title, VersionData, ContentDocumentId, FileType
            FROM ContentVersion
            WHERE ContentDocumentId IN :contentDocIds
            AND IsLatest = true
        ];
        if (contentVersions.isEmpty()) return;

        // Map Opportunities
        Map<Id, Opportunity> oppMap = new Map<Id, Opportunity>(
            [SELECT Id, AccountId FROM Opportunity WHERE Id IN :opportunityIds]
        );

        List<Contact> contactsToInsert = new List<Contact>();

        // Parse CSVs
        for (ContentVersion cv : contentVersions) {
            if (cv.Title != null && (cv.Title.toLowerCase().endsWith('.csv') || cv.FileType == 'CSV')) {
                String csvBody = cv.VersionData.toString();
                List<Map<String, String>> csvRecords = parseCSV(csvBody);
                Id oppId = oppIdByContentDocId.get(cv.ContentDocumentId);
                Opportunity opp = oppMap.get(oppId);
                if (opp == null || opp.AccountId == null) continue;

                for (Map<String, String> record : csvRecords) {
                    String firstName = record.get('FirstName');
                    String lastName = record.get('LastName');
                    String email = record.get('Email');
                    String phone = record.get('Phone');

                    if (String.isBlank(lastName) || String.isBlank(email)) continue;

                    Contact c = new Contact(
                        AccountId = opp.AccountId,
                        FirstName = firstName,
                        LastName = lastName,
                        Email = email,
                        Phone = phone
                    );
                    contactsToInsert.add(c);
                }
            }
        }

        if (!contactsToInsert.isEmpty()) {
            insert contactsToInsert;
            System.debug('DEBUG: Contacts inserted: ' + contactsToInsert.size());

            // Collect Contact IDs for @future method
            List<Id> contactIds = new List<Id>();
            for (Contact c : contactsToInsert) {
                contactIds.add(c.Id);
            }

            // Call async method to create Users
            createUsersAsync(contactIds);
        }
    }

    @future
    public static void createUsersAsync(List<Id> contactIds) {
        List<Contact> contacts = [
            SELECT Id, FirstName, LastName, Email, AccountId
            FROM Contact
            WHERE Id IN :contactIds
        ];

        List<User> usersToInsert = new List<User>();

        for (Contact c : contacts) {
            if (String.isBlank(c.Email)) continue;

            User u = new User();
            u.ContactId = c.Id;
            u.ProfileId = TARGET_PROFILE_ID;
            u.Alias = (c.FirstName != null && c.FirstName.length() >= 3) ? c.FirstName.substring(0, 3) : 'usr';
            u.Email = c.Email;
            u.Username = generateUniqueUsername(c.FirstName, c.LastName);
            u.LastName = (c.LastName != null) ? c.LastName : 'Unknown';
            u.TimeZoneSidKey = 'America/Los_Angeles';
            u.LocaleSidKey = 'en_US';
            u.EmailEncodingKey = 'UTF-8';
            u.LanguageLocaleKey = 'en_US';
            u.IsActive = true;

            // Required for Community Users
            String nickname = (c.FirstName != null ? c.FirstName : 'user') + Math.abs(Crypto.getRandomInteger());
            if (nickname.length() > 40) {
                nickname = nickname.substring(0, 40);
            }
            u.CommunityNickname = nickname;

            // Do NOT set UserRoleId for High Volume Portal Users
            // u.UserRoleId = getAnyUserRoleId(); // Removed

            usersToInsert.add(u);
        }

        try {
            insert usersToInsert;
            System.debug('✅ Users created: ' + usersToInsert.size());
        } catch (DmlException e) {
            System.debug('❌ Error creating users: ' + e.getDmlMessage(0));
        }
    }

    private static List<Map<String, String>> parseCSV(String csvBody) {
        List<Map<String, String>> records = new List<Map<String, String>>();
        List<String> lines = csvBody.split('\n');
        if (lines.isEmpty()) return records;

        List<String> headers = splitCSVLine(lines[0]);
        for (Integer i = 1; i < lines.size(); i++) {
            String line = lines[i].trim();
            if (line == '') continue;

            List<String> values = splitCSVLine(line);
            Map<String, String> record = new Map<String, String>();
            for (Integer j = 0; j < headers.size() && j < values.size(); j++) {
                record.put(headers[j].trim(), values[j].trim());
            }
            records.add(record);
        }
        return records;
    }

    private static List<String> splitCSVLine(String line) {
        return line.split(';');
    }

    private static String generateUniqueUsername(String firstName, String lastName) {
        String baseUsername = '';

        if (lastName != null && lastName.length() > 0) {
            baseUsername += lastName.replaceAll('\\s+', '').toLowerCase();
        } else {
            baseUsername += 'user';
        }

        if (firstName != null && firstName.length() > 0) {
            baseUsername += '.' + firstName.replaceAll('\\s+', '').toLowerCase();
        }

        String uniqueSuffix = String.valueOf(Datetime.now().getTime());
        return baseUsername + '.' + uniqueSuffix + '@' + USERNAME_DOMAIN;
    }

    private static Id getAnyUserRoleId() {
        List<UserRole> roles = [SELECT Id FROM UserRole LIMIT 1];
        return (roles.isEmpty()) ? null : roles[0].Id;
    }
}
