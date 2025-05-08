import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getUserOpportunities from '@salesforce/apex/OpportunityController.getOpportunity';
import updateStageToNegotiation from '@salesforce/apex/OpportunityController.updateStageToNegotiation';
import { refreshApex } from '@salesforce/apex';
import updateStageToClosedLost from '@salesforce/apex/OpportunityController.updateStageToClosedLost';


export default class OpportunityProgressPath extends LightningElement {
    opportunity;
    productCode;
    stages = ['Prospecting', 'Qualification', 'Proposal/Price Quote', 'Negotiation/Review', 'Closed'];
    currentStageIndex = -1;
    wiredOppResult;


    stageIcons = {
        'Prospecting': '🕵️',
        'Qualification': '📋',
        'Proposal/Price Quote': '💰',
        'Negotiation/Review': '🤝',
        'Closed': '🏆'
    };

    @wire(getUserOpportunities)
    wiredOpp(result) {
        this.wiredOppResult = result; // stocker le résultat wire pour refreshApex
        const { data, error } = result;
        if (data && data.length > 0) {
            this.opportunity = data[0];
            this.currentStageIndex = this.stages.indexOf(this.opportunity.StageName);
            if (this.opportunity.OpportunityLineItems && this.opportunity.OpportunityLineItems.length > 0) {
                this.productCode = this.opportunity.OpportunityLineItems[0].Product2.ProductCode;
            }
        } else if (error) {
            this.showErrorToast(error.body.message);
        }
    }
    

    get getStages() {
        return this.stages.map((stage, index) => {
            let status = 'upcoming';
            if (index < this.currentStageIndex) status = 'completed';
            else if (index === this.currentStageIndex) status = 'current';

            return {
                name: `${this.stageIcons[stage]} ${stage}`,
                rawName: stage,
                status,
                className: `step ${status}`,
                isCurrent: index === this.currentStageIndex,
            };
        });
    }

    get isProspectingStage() {
        return this.opportunity?.StageName === 'Prospecting';
    }

    get isQualificationStage() {
        return this.opportunity?.StageName === 'Qualification';
    }

    get isProposalStage() {
        return this.opportunity?.StageName === 'Proposal/Price Quote';
    }

    isCurrentStage(stageNameWithIcon) {
        const plainStage = stageNameWithIcon.replace(/^[^\w]+/, '').trim();
        return plainStage === this.opportunity.StageName;
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        console.log('Files uploaded:', uploadedFiles);
        this.showSuccessToast('File uploaded successfully!');
    
        // Refresh data after successful upload
        refreshApex(this.wiredOppResult)
            .then(() => {
                console.log('Opportunity data refreshed after upload.');
            })
            .catch(error => {
                console.error('Error refreshing data after upload:', error);
                this.showErrorToast('Failed to refresh data after upload.');
            });
    }
    

    handleUploadError(event) {
        console.error('Upload failed', event.detail);
        this.showErrorToast('File upload failed!');
    }

    handleAccept() {
        updateStageToNegotiation({ opportunityId: this.opportunity.Id })
            .then(() => {
                this.showSuccessToast('You have accepted the offer! Stage updated to Negotiation/Review.');
                // Optionnel : recharger les données
                return refreshApex(this.wiredOppResult);

            })
            .catch(error => {
                console.error('Error updating stage:', error);
                this.showErrorToast('Failed to update opportunity stage.');
            });
    }
    
    isRejectModalOpen = false;

    handleReject() {
        this.isRejectModalOpen = true;
    }

    closeRejectModal() {
        this.isRejectModalOpen = false;
    }

    confirmReject() {
        this.isRejectModalOpen = false;
        updateStageToClosedLost({ opportunityId: this.opportunity.Id })
            .then(() => {
                this.showErrorToast('You have rejected the offer. Stage updated to Closed Lost.');
                return refreshApex(this.wiredOppResult);
            })
            .catch(error => {
                console.error('Error updating stage to Closed Lost:', error);
                this.showErrorToast('Failed to update opportunity stage to Closed Lost.');
            });
    }

   
   
    showSuccessToast(message) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success',
        }));
    }

    showErrorToast(message) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: message,
            variant: 'error',
        }));
    }
}
