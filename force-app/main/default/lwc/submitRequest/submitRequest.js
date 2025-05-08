import { LightningElement, track } from 'lwc';
import submitComplaint from '@salesforce/apex/ComplaintController.submitComplaint';
import submitReimbursement from '@salesforce/apex/ReimbursementRequestController.submitReimbursement';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SubmitRequestForm extends LightningElement {
    @track selectedType = '';
    @track category = '';
    @track name = '';
    @track description = '';
    @track amountRequested = null;
    @track paymentMethod = '';
    @track receiptAttached = false;
    @track title = '';
    @track selectedProduct = '';

    get options() {
        return [
            { label: 'Complaint', value: 'Complaint' },
            { label: 'Reimbursement Request', value: 'Reimbursement' }
        ];
    }

    get categoryOptions() {
        return [
            { label: 'Product Issue', value: 'Product Issue' },
            { label: 'Service Issue', value: 'Service Issue' },
            { label: 'Billing Problem', value: 'Billing Problem' },
            { label: 'Other', value: 'Other' }
        ];
    }

    get paymentMethodOptions() {
        return [
            { label: 'Credit to account', value: 'credit to account' },
            { label: 'Check', value: 'check' },
            { label: 'Bank Transfer', value: 'bank Transfer' }
        ];
    }

    get productOptions() {
        return [
            { label: 'Family Insurance Package', value: 'FAM-INS' },
            { label: 'Standard Insurance Package', value: 'STD-INS' },
            { label: 'Premium Insurance Package', value: 'PREM-INS' },
            { label: 'Basic Insurance Package', value: 'BASIC-INS' }
        ];
    }

    get isComplaintSelected() {
        return this.selectedType === 'Complaint';
    }

    get isReimbursementSelected() {
        return this.selectedType === 'Reimbursement';
    }

    get isProductIssue() {
        return this.category === 'Product Issue';
    }

    handleTypeChange(event) {
        this.selectedType = event.detail.value;
        this.resetForm();
    }

    handleInputChange(event) {
        const field = event.target.dataset.id;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        if (field in this) {
            this[field] = value;
        }
    }

    resetForm() {
        this.category = '';
        this.name = '';
        this.description = '';
        this.amountRequested = null;
        this.paymentMethod = '';
        this.receiptAttached = false;
        this.title = '';
        this.selectedProduct = '';
    }

    async handleSubmitComplaint() {
        try {
            await submitComplaint({
                category: this.category,
                name: this.name,
                description: this.description,
                product: this.selectedProduct
            });

            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Complaint submitted successfully!',
                variant: 'success'
            }));

            this.resetForm();
        } catch (error) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.body ? error.body.message : error.message,
                variant: 'error'
            }));
        }
    }

    async handleSubmitReimbursement() {
        try {
            await submitReimbursement({
                amountRequested: this.amountRequested,
                description: this.description,
                paymentMethod: this.paymentMethod,
                receiptAttached: this.receiptAttached,
                title: this.title,
                product: this.selectedProduct
            });

            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Reimbursement request submitted successfully!',
                variant: 'success'
            }));

            this.resetForm();
        } catch (error) {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.body ? error.body.message : error.message,
                variant: 'error'
            }));
        }
    }
}
