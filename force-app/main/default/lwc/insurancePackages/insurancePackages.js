import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'; // Import NavigationMixin
import getInsurancePackages from '@salesforce/apex/InsurancePackageController.getInsurancePackages';

export default class InsurancePackages extends NavigationMixin(LightningElement) {
    packages = [];

    // Utilisation de la méthode @wire pour récupérer les packages depuis Apex
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
                showDetails: false // Ajouter une propriété pour chaque produit
            }));
        } else if (error) {
            console.error('Error fetching packages', error);
        }
    }

    // Fonction pour basculer l'état de l'affichage des détails
    toggleAccordion(event) {
        const productCode = event.target.dataset.id; // Get the product code from the data-id attribute
        const packageIndex = this.packages.findIndex(pkg => pkg.productCode === productCode);
        
        if (packageIndex !== -1) {
            this.packages[packageIndex].showDetails = !this.packages[packageIndex].showDetails; // Toggle the showDetails property
            this.packages = [...this.packages]; // Trigger reactivity by creating a new array reference
        }
    }

    // Fonction pour rediriger vers la page des produits
    navigateToProducts() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/products'  // Change this to the actual URL or Salesforce page reference
            }
        });
    }
}
