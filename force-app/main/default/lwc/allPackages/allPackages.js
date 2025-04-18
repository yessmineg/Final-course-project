import { LightningElement, wire, track } from 'lwc';
import getInsurancePackages from '@salesforce/apex/AllPackages.getInsurancePackages';
import createLead from '@salesforce/apex/AllPackages.createLead';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import copper from '@salesforce/resourceUrl/copper';
import silver from '@salesforce/resourceUrl/silver';
import gold from '@salesforce/resourceUrl/gold';

export default class AllPackages extends LightningElement {
    @track packages = [];
    @track isModalOpen = false; 
    @track selectedPackage = {};
    @track name = '';  
    @track email = ''; 
    @track mobile = ''; 
    @track company = ''; 
    @track title = ''; 
    @track numEmployees = '';
    @track Industry = ''; 
    @track leadSource = ''; 


    @wire(getInsurancePackages)
    wiredPackages({ data, error }) {
        if (data) {
            this.packages = data.map(pkg => {
                let imageUrl;
                let iconClass = ''; // New variable for the icon class
    
                switch (pkg.Name) {
                    case 'Basic Insurance Package':
                        imageUrl = copper;
                        break;
                    case 'Standard Insurance Package':
                        imageUrl = silver;
                        break;
                    case 'Premium Insurance Package':
                        imageUrl = gold;
                        break;
                    default:
                        iconClass = 'slds-icon_container slds-icon-standard-shield'; // Add the icon class for packages that don't match
                        imageUrl = ''; // No image for these packages
                }
    
                return {
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
                    type: pkg.Type__c,
                    showDetails: false,
                    imageUrl,
                    iconClass, // Store the iconClass if needed
                    statusClass: this.getStatusClass(pkg.Status__c)
                };
            });
        } else if (error) {
            console.error('Error fetching packages', error);
        }
    }
    
    getStatusClass(status) {
        switch (status) {
            case 'Active':
                return 'slds-text-color_success'; 
            case 'Inactive':
                return 'slds-text-color_error'; 
            default:
                return 'slds-text-color_default'; 
        }
    }

    openModal(event) {
        const productCode = event.target.dataset.id;
        this.selectedPackage = this.packages.find(pkg => pkg.productCode === productCode);
        this.isModalOpen = true;
        this.name = '';  
        this.email = ''; 
        this.mobile = '';
        this.company = '';
        this.title = '';
        this.numEmployees = '';
        this.Industry = ''; 
        this.leadSource = '';
    }
    
    closeModal() {
        this.isModalOpen = false;
    }

    handleInputChange(event) {
        this[event.target.name] = event.target.value;
    }
    handleSubmit() {
        if (!this.selectedPackage || !this.selectedPackage.productCode) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'No package selected. Please select a package before submitting.',
                    variant: 'error'
                })
            );
            return;
        }
    
        if (this.name && this.email && this.mobile && this.company && this.title && this.numEmployees && this.Industry && this.leadSource) {
            createLead({ 
                name: this.name, 
                email: this.email, 
                mobile: this.mobile, 
                company: this.company,
                title: this.title,
                numEmployees: this.numEmployees ? parseInt(this.numEmployees, 10) : null,
                productCode: this.selectedPackage.productCode,  // Utilisation du productCode
                leadSource: this.leadSource,
                Industry: this.Industry
            })
            .then(result => {
                if (result === 'Success') {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Your interest has been recorded!',
                            variant: 'success'
                        })
                    );
                    this.closeModal();
                } else {
                    throw new Error('Unexpected response from server: ' + result);
                }
            })
            .catch(error => {
                console.error('Error during lead creation:', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.message || 'An unexpected error occurred.',
                        variant: 'error'
                    })
                );
            });
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please fill in all required fields.',
                    variant: 'error'
                })
            );
        }
    }
    
    
    toggleAccordion(event) {
        const productCode = event.target.dataset.id;
        const packageIndex = this.packages.findIndex(pkg => pkg.productCode === productCode);
        if (packageIndex !== -1) {
            this.packages[packageIndex].showDetails = !this.packages[packageIndex].showDetails;
            this.packages = [...this.packages];
        }
    }

    leadSourceOptions = [
        { label: 'Phone Inquiry', value: 'Phone Inquiry' },
        { label: 'Partner Referral', value: 'Partner Referral' },
        { label: 'Web', value: 'Web' },
        { label: 'Purchased List', value: 'Purchased List' },
        { label: 'Other', value: 'Other' },
    ];
    IndustryOptions = [
        { label: 'Agriculture ', value: 'Agriculture ' },
        { label: 'Apparel ', value: 'Apparel ' },
        { label: 'Banking ', value: 'Banking ' },
        { label: 'Biotechnology ', value: 'Biotechnology ' },
        { label: 'Chemicals ', value: 'Chemicals ' },
        { label: 'Communications', value: 'Communications' },
        { label: 'Construction ', value: 'Construction ' }
    ];
}
