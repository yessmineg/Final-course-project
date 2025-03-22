import { LightningElement, wire } from 'lwc';
import getInsurancePackages from '@salesforce/apex/AllPackages.getInsurancePackages';

export default class AllPackages extends LightningElement {
    packages = [];

    @wire(getInsurancePackages)
    wiredPackages({ data, error }) {
        if (data) {
            this.packages = data.map(pkg => ({
                productName: pkg.Name,
                productCode: pkg.ProductCode,
                annualPremium: pkg.Annual_Premium__c,
                coverageLimit: pkg.Coverage_Limit__c,
                deductible: pkg.Deductible__c,
                reimbursementRate: pkg.Reimbursement_Rate__c,
                contractDuration: pkg.Contract_Duration__c,
                description: pkg.Description,
                category: pkg.Category__c,
                exclusions: pkg.Exclusions__c,
                additionalBenefits: pkg.Additional_Benefits__c,
                minimumAge: pkg.Minimum_Age__c,
                maximumAge: pkg.Maximum_Age__c,
                discounts: pkg.Discounts__c,
                renewalConditions: pkg.Renewal_Conditions__c,
                status: pkg.Status__c,
                showDetails: false,
                statusClass: this.getStatusClass(pkg.Status__c) // Assign statusClass
            }));
        } else if (error) {
            console.error('Error fetching packages', error);
        }
    }

    // Method to return the appropriate class based on status
    getStatusClass(status) {
        switch (status) {
            case 'Active':
                return 'status-active';  // Green color
            case 'Inactive':
                return 'status-inactive';  // Red color
            case 'Paused':
                return 'status-paused';  // Mustard color
            default:
                return 'status-default';  // Black color for other statuses
        }
    }
}
