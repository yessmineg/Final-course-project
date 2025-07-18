import { LightningElement, wire, track } from 'lwc';
import getAllQuotes from '@salesforce/apex/QuoteController.getAllQuotes';
import deleteQuote from '@salesforce/apex/QuoteController.deleteQuote';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CustomQuoteList extends NavigationMixin(LightningElement) {
    @track quotes = [];
    @track filteredQuotes = [];
    @track searchKey = '';
    @track selectedStatus = '';
    @track showDeleteModal = false;
    @track selectedRecord = {};
    @track error;

    wiredQuotesResult;

    statusOptions = [
        { label: 'All', value: '' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Presented', value: 'Presented' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Accepted', value: 'Accepted' }
    ];

    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Status', fieldName: 'Status', type: 'text' },
        { label: 'Total', fieldName: 'GrandTotal', type: 'currency' },
        { label: 'Account', fieldName: 'AccountName', type: 'text' },
        { label: 'Opportunity', fieldName: 'OpportunityName', type: 'text' },
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

    @wire(getAllQuotes)
    wiredQuotes(result) {
        this.wiredQuotesResult = result;
        const { data, error } = result;
        if (data) {
            this.quotes = data.map(q => ({
                ...q,
                AccountName: q.Account?.Name,
                OpportunityName: q.Opportunity?.Name
            }));
            this.applyFilters();
        } else if (error) {
            this.error = error.body.message;
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
        this.filteredQuotes = this.quotes.filter(q => {
            const matchesSearch = q.Name?.toLowerCase().includes(this.searchKey);
            const matchesStatus = this.selectedStatus ? q.Status === this.selectedStatus : true;
            return matchesSearch && matchesStatus;
        });
    }

    refreshList() {
        refreshApex(this.wiredQuotesResult);
    }

    handleNewQuote() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Quote',
                actionName: 'new'
            }
        });
    }

    handleRowAction(event) {
        const action = event.detail.action.name;
        const row = event.detail.row;

        if (action === 'view' || action === 'edit') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.Id,
                    objectApiName: 'Quote',
                    actionName: action
                }
            });
        } else if (action === 'delete') {
            this.selectedRecord = row;
            this.showDeleteModal = true;
        }
    }

    closeDeleteModal() {
        this.showDeleteModal = false;
        this.selectedRecord = {};
    }

    confirmDelete() {
        deleteQuote({ quoteId: this.selectedRecord.Id })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Deleted',
                    message: 'Quote deleted successfully',
                    variant: 'success'
                }));
                this.showDeleteModal = false;
                return refreshApex(this.wiredQuotesResult);
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error deleting',
                    message: error.body?.message || 'Unknown error',
                    variant: 'error'
                }));
            });
    }
}
