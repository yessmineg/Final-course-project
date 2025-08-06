import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getInsurancePackages from '@salesforce/apex/InsurancePackageController.getInsurancePackages';

export default class InsurancePackages extends NavigationMixin(LightningElement) {
    @track packages = [];

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
                type: pkg.type__c,
                showDetails: false,
                iconClass: 'icon',
                accordionClass: 'additional-info'
            }));
        } else if (error) {
            console.error('Error fetching packages', error);
        }
    }

    toggleAccordion(event) {
        const productCode = event.currentTarget.dataset.id;
        const index = this.packages.findIndex(pkg => pkg.productCode === productCode);

        if (index !== -1) {
            // Toggle showDetails
            this.packages[index].showDetails = !this.packages[index].showDetails;

            // Update classes
            this.packages[index].iconClass = this.packages[index].showDetails ? 'icon rotate' : 'icon';
            this.packages[index].accordionClass = this.packages[index].showDetails ? 'additional-info expanded' : 'additional-info';

            // Trigger reactive update
            this.packages = [...this.packages];
        }
    }

    navigateToProducts() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: { url: '/products' }
        });
    }
}
