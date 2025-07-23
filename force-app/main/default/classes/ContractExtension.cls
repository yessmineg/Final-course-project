public class ContractExtension {
    public Contract contract { get; set; }
    public User currentUser { get; set; }

    public ContractExtension(ApexPages.StandardController std) {
        this.contract = (Contract)std.getRecord();
        currentUser = [SELECT Id, Name, CompanyName FROM User WHERE Id = :UserInfo.getUserId()];
    }
}
