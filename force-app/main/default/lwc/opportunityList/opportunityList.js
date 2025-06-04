import { LightningElement, wire, track } from 'lwc';
import getOpportunities from '@salesforce/apex/OpportunityController.getOpportunities';

const COLUMNS = [
    { label: 'Opportunity Name', fieldName: 'Name', type: 'text' },
    { label: 'Stage', fieldName: 'StageName', type: 'text' },
    { label: 'Probability (%)', fieldName: 'Probability', type: 'percent', cellAttributes: { alignment: 'left' } }
];

export default class OpportunityList extends LightningElement {
    @track opportunities;
    @track error;
    columns = COLUMNS;

    @wire(getOpportunities)
    wiredOpps({ data, error }) {
        if (data) {
            this.opportunities = data;
        } else if (error) {
            this.error = error.body.message || error.message;
        }
    }
}
