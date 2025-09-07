import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getUserOpportunities from '@salesforce/apex/OpportunityController.getOpportunity';
import updateStageToNegotiation from '@salesforce/apex/OpportunityController.updateStageToNegotiation';
import updateStageToClosedLost from '@salesforce/apex/OpportunityController.updateStageToClosedLost';
import uploadFileToOpportunity from '@salesforce/apex/OpportunityController.uploadFileToOpportunity';

export default class OpportunityProgressPath extends LightningElement {
    @api opportunity;
    productCode;
    stages = ['Prospecting', 'Qualification', 'Proposal/Price Quote', 'Negotiation/Review', 'Closed'];
    currentStageIndex = -1;
    wiredOppResult;
    isRejectModalOpen = false;

    stageIcons = {
        'Prospecting': '🕵️',
        'Qualification': '📋',
        'Proposal/Price Quote': '💰',
        'Negotiation/Review': '🤝',
        'Closed': '🏆'
    };

    @wire(getUserOpportunities)
    wiredOpp(result) {
        this.wiredOppResult = result;
        const { data, error } = result;

        if (data?.length > 0) {
            this.opportunity = data[0];
            this.currentStageIndex = this.stages.indexOf(this.opportunity.StageName);

            const items = this.opportunity.OpportunityLineItems;
            if (items?.length > 0) {
                this.productCode = items[0].Product2?.ProductCode;
            }
        } else if (error) {
            this.showErrorToast(error.body.message);
        }
    }

    get getStages() {
        return this.stages.map((stage, index) => {
            const status = index < this.currentStageIndex ? 'completed' :
                           index === this.currentStageIndex ? 'current' : 'upcoming';
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

    handleAccept() {
        updateStageToNegotiation({ opportunityId: this.opportunity.Id })
            .then(() => {
                this.showSuccessToast('You have accepted the offer! Stage updated to Negotiation/Review.');
                return refreshApex(this.wiredOppResult);
            })
            .catch(error => {
                console.error('Error updating stage:', error);
                this.showErrorToast('Failed to update opportunity stage.');
            });
    }

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

    handleFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result?.split(',')[1];
            if (!base64) {
                this.showErrorToast('Failed to read file content.');
                return;
            }
            this.uploadFile(base64, file.name);
        };
        reader.readAsDataURL(file);
    }

    uploadFile(base64Data, fileName) {
        uploadFileToOpportunity({
            opportunityId: this.opportunity.Id,
            base64Data,
            fileName
        })
            .then(() => {
                this.showSuccessToast('File uploaded and stage updated to Qualification.');
                return refreshApex(this.wiredOppResult);
            })
            .catch(error => {
                console.error('File upload failed:', error);
                this.showErrorToast('Failed to upload file and update stage.');
            });
    }

    showSuccessToast(message) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message,
            variant: 'success',
        }));
    }

    showErrorToast(message) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message,
            variant: 'error',
        }));
    }
    get isNegotiationStage() {
    return this.opportunity?.StageName === 'Negotiation/Review';
}

get isClosedWonStage() {
    return this.opportunity?.StageName === 'Closed Won';
}

get isClosedLostStage() {
    return this.opportunity?.StageName === 'Closed Lost';
}


}
