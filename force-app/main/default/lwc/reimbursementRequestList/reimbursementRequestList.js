import { LightningElement, wire, track } from 'lwc';
import getAllReimbursements from '@salesforce/apex/ReimbursementRequestController.getAllReimbursements';
import deleteReimbursement from '@salesforce/apex/ReimbursementRequestController.deleteReimbursement';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ReimbursementRequestList extends NavigationMixin(LightningElement) {
    @track reimbursements = [];
    @track filteredReimbursements = [];
    @track searchKey = '';
    @track selectedStatus = '';
    @track error;
    @track showDeleteModal = false;
    @track selectedRecord = {};

    wiredReimbursementsResult;

    statusOptions = [
        { label: 'All', value: '' },
        { label: 'Submitted', value: 'Submitted' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Paid', value: 'Paid' }
    ];

    columns = [
        { label: 'Title', fieldName: 'Name', type: 'text' },
        { label: 'Amount Requested', fieldName: 'Amount_Requested__c', type: 'currency', typeAttributes: { currencyCode: 'USD' } },
        { label: 'Status', fieldName: 'Status__c', type: 'text' },
        { label: 'Date of Usage', fieldName: 'date_of_usage__c', type: 'date' },
        { label: 'Payment Method', fieldName: 'Payment_Method__c', type: 'text' },
        { label: 'Receipt Attached', fieldName: 'Receipt_Attached__c', type: 'boolean' },
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

    @wire(getAllReimbursements)
    wiredReimbursements(result) {
        this.wiredReimbursementsResult = result;
        const { data, error } = result;
        if (data) {
            this.reimbursements = data;
            this.applyFilters();
            this.error = null;
        } else if (error) {
            this.error = error.body ? error.body.message : error.message;
            this.reimbursements = [];
        }
    }

    handleSearch(event) {
        this.searchKey = event.target.value.toLowerCase();
        this.applyFilters();
    }

    handleStatusChange(event) {
        this.selectedStatus = event.detail.value;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredReimbursements = this.reimbursements.filter(rr => {
            const matchesStatus = this.selectedStatus ? rr.Status__c === this.selectedStatus : true;
            const matchesSearch = rr.Name?.toLowerCase().includes(this.searchKey);
            return matchesStatus && matchesSearch;
        });
    }

    refreshList() {
        refreshApex(this.wiredReimbursementsResult);
    }

    handleNewRequest() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Reimbursement_Request__c',
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
                    objectApiName: 'Reimbursement_Request__c',
                    actionName: 'view'
                }
            });
        } else if (action.name === 'edit') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.Id,
                    objectApiName: 'Reimbursement_Request__c',
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
        deleteReimbursement({ reimbursementId: this.selectedRecord.Id })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Deleted',
                    message: 'Reimbursement request deleted',
                    variant: 'success'
                }));
                this.showDeleteModal = false;
                return refreshApex(this.wiredReimbursementsResult);
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error deleting record',
                    message: error.body ? error.body.message : error.message,
                    variant: 'error'
                }));
            });
    }
}
