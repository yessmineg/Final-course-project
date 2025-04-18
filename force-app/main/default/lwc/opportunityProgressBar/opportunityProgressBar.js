import { LightningElement, wire } from 'lwc';
import getUserOpportunities from '@salesforce/apex/OpportunityController.getOpportunity';

export default class OpportunityProgressPath extends LightningElement {
    opportunity;
    stages = ['Prospecting', 'Qualification', 'Proposal/Price Quote', 'Negotiation/Review', 'closed'];
    currentStageIndex = -1;

    stageIcons = {
        'Prospecting': '🕵️',
        'Qualification': '📋',
        'Proposal/Price Quote': '💰',
        'Negotiation/Review': '🤝',
        'closed': '🏆'
    };

    @wire(getUserOpportunities)
    wiredOpp({ data, error }) {
        if (data && data.length > 0) {
            this.opportunity = data[0];
            this.currentStageIndex = this.stages.indexOf(this.opportunity.StageName);
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
    
    
    isCurrentStage(stageNameWithIcon) {
        const plainStage = stageNameWithIcon.replace(/^[^\w]+/, '').trim(); // remove icon
        return plainStage === this.opportunity.StageName;
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        console.log('Files uploaded:', uploadedFiles);
        // You can show a toast here or refresh opportunity data if needed
    }
}
