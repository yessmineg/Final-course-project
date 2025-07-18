import { LightningElement, wire, track } from 'lwc';
import getOpportunities from '@salesforce/apex/OpportunityController.getOpportunitiess';
import deleteOpportunity from '@salesforce/apex/OpportunityController.deleteOpportunity';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CustomOpportunityList extends NavigationMixin(LightningElement) {
    @track opportunities = [];
    @track filteredOpportunities = [];
    @track searchKey = '';
    @track selectedStage = '';
    @track selectedLeadSource = '';
    @track error;
    @track showDeleteModal = false;
    @track selectedRecord = {};

    wiredOpportunitiesResult;

    stageOptions = [
        { label: 'All', value: '' },
        { label: 'Prospecting', value: 'Prospecting' },
        { label: 'Qualification', value: 'Qualification' },
        { label: 'Needs Analysis', value: 'Needs Analysis' },
        { label: 'Value Proposition', value: 'Value Proposition' },
        { label: 'Negotiation/Review', value: 'Negotiation/Review' },
        { label: 'Closed Won', value: 'Closed Won' },
        { label: 'Closed Lost', value: 'Closed Lost' }
    ];

    leadSourceOptions = [
        { label: 'All', value: '' },
        { label: 'Web', value: 'Web' },
        { label: 'Phone Inquiry', value: 'Phone Inquiry' },
        { label: 'Partner Referral', value: 'Partner Referral' },
        { label: 'Purchased List', value: 'Purchased List' },
        { label: 'Other', value: 'Other' }
    ];

    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Account', fieldName: 'AccountName', type: 'text' },
        {
            label: 'Stage',
            fieldName: 'StageName',
            type: 'text',
            cellAttributes: {
                class: { fieldName: 'stageClass' }
            }
        },
        { label: 'Lead Source', fieldName: 'LeadSource', type: 'text' },
        { label: 'Owner', fieldName: 'OwnerName', type: 'text' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: '👁 View', name: 'view' },
                    { label: '✏️ Edit', name: 'edit' },
                    { label: '🗑 Delete', name: 'delete' }
                ]
            }
        }
    ];

    @wire(getOpportunities)
    wiredOpps(result) {
        this.wiredOpportunitiesResult = result;
        const { data, error } = result;
        if (data) {
            this.opportunities = data.map(opp => {
                let cssClass = '';
                if (opp.StageName === 'Closed Won') {
                    cssClass = 'slds-text-color_success';
                } else if (opp.StageName === 'Closed Lost') {
                    cssClass = 'slds-text-color_error';
                }
                return {
                    ...opp,
                    stageClass: cssClass
                };
            });
            this.applyFilters();
            this.error = null;
        } else if (error) {
            this.error = error.body.message;
        }
    }

    handleSearch(event) {
        this.searchKey = event.target.value.toLowerCase();
        this.applyFilters();
    }

    handleStageChange(event) {
        this.selectedStage = event.detail.value;
        this.applyFilters();
    }

    handleLeadSourceChange(event) {
        this.selectedLeadSource = event.detail.value;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredOpportunities = this.opportunities.filter(opp => {
            const matchesStage = this.selectedStage ? opp.StageName === this.selectedStage : true;
            const matchesLeadSource = this.selectedLeadSource ? opp.LeadSource === this.selectedLeadSource : true;
            const matchesSearch = opp.Name?.toLowerCase().includes(this.searchKey);
            return matchesStage && matchesLeadSource && matchesSearch;
        });
    }

    refreshList() {
        refreshApex(this.wiredOpportunitiesResult);
    }

    handleNewOpportunity() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Opportunity',
                actionName: 'new'
            }
        });
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        if (action.name === 'view') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.Id,
                    objectApiName: 'Opportunity',
                    actionName: 'view'
                }
            });
        } else if (action.name === 'edit') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.Id,
                    objectApiName: 'Opportunity',
                    actionName: 'edit'
                }
            });
        } else if (action.name === 'delete') {
            this.selectedRecord = row;
            this.showDeleteModal = true;
        }
    }

    closeDeleteModal() {
        this.showDeleteModal = false;
        this.selectedRecord = {};
    }

    confirmDelete() {
        deleteOpportunity({ opportunityId: this.selectedRecord.Id })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Deleted',
                    message: 'Opportunity was deleted',
                    variant: 'success'
                }));
                this.showDeleteModal = false;
                return refreshApex(this.wiredOpportunitiesResult);
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                }));
            });
    }
}
