import { LightningElement, track, api } from 'lwc';
import submitComplaint from '@salesforce/apex/ComplaintController.submitComplaint';
import submitReimbursement from '@salesforce/apex/ReimbursementRequestController.submitReimbursement';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getContactIdForCurrentUser from '@salesforce/apex/ReimbursementRequestController.getContactIdForCurrentUser';

export default class SubmitRequestForm extends LightningElement {
    @track selectedType = '';
    @track category = '';
    @track name = '';
    @track description = '';
    @track amountRequested = null;
    @track paymentMethod = '';
    @track receiptAttached = false;
    @track date_of_usage = '';
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
            { label: 'Reimbursement delay', value: 'Reimbursement delay' },
            { label: 'incorrect billing', value: 'incorrect billing' },
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
        this.date_of_usage = '';
    }
async handleSubmitComplaint() {
    try {
        console.log('Submitting complaint with:', {
            category: this.category,
            name: this.name,
            description: this.description,
            product: this.selectedProduct,
            contactId: this.contactId
        });

        await submitComplaint({
            category: this.category,
            name: this.name,
            description: this.description,
            product: this.selectedProduct,
            contactId: this.contactId
        });

        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: 'Complaint submitted successfully!',
            variant: 'success'
        }));

        this.resetForm();
    } catch (error) {
        console.error('Error in handleSubmitComplaint:', error);
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: error.body ? error.body.message : error.message,
            variant: 'error'
        }));
    }
}

async handleSubmitReimbursement() {
    try {
        // Pass the contactId to Apex along with other fields to associate the file
        const result = await submitReimbursement({
            amountRequested: this.amountRequested,
            description: this.description,
            date_of_usage: this.date_of_usage,
            paymentMethod: this.paymentMethod,
            receiptAttached: this.receiptAttached,
            title: this.title,
            product: this.selectedProduct,
            status: 'Submitted',
            contactId: this.contactId  // Contact ID to link the uploaded file
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


    @api recordId; // Provided by the page automatically
    showUpload = false;

    handleCheckboxChange(event) {
        this.showUpload = event.target.checked;
    }

@track contactId; // L’ID du contact auquel sera liée la pièce jointe

handleUploadFinished(event) {
    const uploadedFiles = event.detail.files;
    if (uploadedFiles.length > 0) {
        const fileName = uploadedFiles[0].name;
        this.showToast('Success', `File ${fileName} uploaded successfully.`, 'success');
    }
}

}
