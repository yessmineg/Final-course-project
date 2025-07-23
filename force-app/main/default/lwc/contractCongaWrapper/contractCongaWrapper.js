import { LightningElement, api } from 'lwc';
import updateStatusToApproval from '@salesforce/apex/ContractStatusUpdater.updateStatusToApproval';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ContractCongaWrapper extends LightningElement {
    @api recordId; // Contract Id

    handleSendNow() {
        updateStatusToApproval({ contractId: this.recordId })
            .then(() => {
                this.showToast('Success', 'Contract status updated to In Approval Process', 'success');
                // Then open Conga Sign URL in a new tab or window
                // Replace the URL below with your actual Conga Sign URL pattern
                const congaSignUrl = `/apex/Conga_Composer?Id=${this.recordId}`; 
                window.open(congaSignUrl, '_blank');
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}
