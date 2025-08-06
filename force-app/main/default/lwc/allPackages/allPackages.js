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
    @track street = '';
    @track city = '';
    @track state = '';
    @track postalCode = '';
    @track country = '';

    @wire(getInsurancePackages)
    wiredPackages({ data, error }) {
        if (data) {
            this.packages = data.map(pkg => {
                let imageUrl;
                let iconClass = '';

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
                        iconClass = 'slds-icon_container slds-icon-standard-shield';
                        imageUrl = '';
                }

                const showDetails = false; // default

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
                    showDetails,
                    imageUrl,
                    iconClass,
                    statusClass: this.getStatusClass(pkg.Status__c),

                    // Precompute values for template
                    ariaLabelledBy: `title-${pkg.ProductCode}`,
                    altText: `Image for ${pkg.Name}`,
                    ariaControls: `details-${pkg.ProductCode}`,
                    detailsId: `details-${pkg.ProductCode}`,
                    toggleTitle: showDetails ? 'Hide details' : 'Show details',
                    iconName: showDetails ? 'utility:up' : 'utility:down',
                    alternativeText: showDetails ? 'Collapse details' : 'Expand details',
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
        this.street = '';
        this.city = '';
        this.state = '';
        this.postalCode = '';
        this.country = '';
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
                productCode: this.selectedPackage.productCode,
                leadSource: this.leadSource,
                Industry: this.Industry,
                street: this.street,
                city: this.city,
                state: this.state,
                postalCode: this.postalCode,
                country: this.country
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
            const pkg = this.packages[packageIndex];
            pkg.showDetails = !pkg.showDetails;
            pkg.iconName = pkg.showDetails ? 'utility:up' : 'utility:down';
            pkg.toggleTitle = pkg.showDetails ? 'Hide details' : 'Show details';
            pkg.alternativeText = pkg.showDetails ? 'Collapse details' : 'Expand details';

            this.packages = [...this.packages];
        }
    }

    leadSourceOptions = [
        { label: 'Partner Referral', value: 'Partner Referral' },
        { label: 'Web', value: 'Web' },
        { label: 'Purchased List', value: 'Purchased List' },
        { label: 'Other', value: 'Other' },
    ];

    IndustryOptions = [
        { label: 'Agriculture', value: 'Agriculture' },
        { label: 'Apparel', value: 'Apparel' },
        { label: 'Banking', value: 'Banking' },
        { label: 'Biotechnology', value: 'Biotechnology' },
        { label: 'Chemicals', value: 'Chemicals' },
        { label: 'Communications', value: 'Communications' },
        { label: 'Construction', value: 'Construction' }
    ];
}
