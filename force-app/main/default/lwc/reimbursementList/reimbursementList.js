import { LightningElement, track, wire } from 'lwc';
import getReimbursementsForCurrentUser from '@salesforce/apex/ReimbursementRequestController.getReimbursementsForCurrentUser';

export default class ReimbursementList extends LightningElement {
    @track reimbursements = [];
    @track error;
    @track isLoading = true;
    @track annualCoverageLimit;
    @track exclusions;
columns = [
    { label: 'Title', fieldName: 'Name' },
    {
        label: 'Amount',
        fieldName: 'Amount_Requested__c',
        type: 'currency',
        cellAttributes: { alignment: 'left' }
    },
    { label: 'Payment Method', fieldName: 'Payment_Method__c' },
    {
        label: 'Status',
        fieldName: 'Status__c',
        cellAttributes: {
            class: { fieldName: 'statusClass' }
        }
    },
    { label: 'Description', fieldName: 'Description__c' },
    {
        label: 'Created Date',
        fieldName: 'CreatedDate',
        type: 'date',
        typeAttributes: { year: 'numeric', month: 'short', day: '2-digit' }
    }
];

@wire(getReimbursementsForCurrentUser)
wiredRequests({ error, data }) {
    this.isLoading = false;
    if (data) {
        let totalApprovedAmount = 0;

        this.reimbursements = data.map(item => {
            const statusLower = item.Status__c?.toLowerCase();
            if (statusLower === 'approved') {
                totalApprovedAmount += item.Amount_Requested__c || 0;
            }

            return {
                ...item,
                statusClass:
                    statusLower === 'rejected' ? 'slds-text-color_error' :
                    statusLower === 'approved' ? 'slds-text-color_success' : ''
            };
        });

        this.error = undefined;

        if (data.length > 0 && data[0].RProduct__r) {
            const product = data[0].RProduct__r;
            this.annualCoverageLimit = product.Coverage_Limit__c;
            this.adjustedCoverageLimit = product.Coverage_Limit__c - totalApprovedAmount;
            this.exclusions = product.Exclusions__c;
        } else {
            this.annualCoverageLimit = null;
            this.adjustedCoverageLimit = null;
            this.exclusions = null;
        }
    } else if (error) {
        this.error = error.body?.message || error.message;
        this.reimbursements = [];
        this.adjustedCoverageLimit = null;
    }
}


    get formattedAnnualCoverageLimit() {
        return this.annualCoverageLimit != null ? `${this.annualCoverageLimit} TND` : '';
    }

    get formattedAnnualCoverageLimit() {
    return this.adjustedCoverageLimit != null ? `${this.adjustedCoverageLimit} TND` : '';
}


    @track adjustedCoverageLimit;

}
