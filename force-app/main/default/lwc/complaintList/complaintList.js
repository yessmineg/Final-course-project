import { LightningElement, wire, track } from 'lwc';
import getAllComplaints from '@salesforce/apex/ComplaintController.getAllComplaints';
import deleteComplaint from '@salesforce/apex/ComplaintController.deleteComplaint';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ComplaintList extends NavigationMixin(LightningElement) {
    @track complaints = [];
    @track filteredComplaints = [];
    @track searchKey = '';
    @track selectedStatus = '';
    @track selectedCategory = '';
    @track error;
    @track showDeleteModal = false;
    @track selectedRecord = {};

    wiredComplaintsResult;

    statusOptions = [
        { label: 'All', value: '' },
        { label: 'New', value: 'New' },
        { label: 'Investigating', value: 'Investigating' },
        { label: 'Closed', value: 'Closed' }
    ];

    categoryOptions = [
        { label: 'All', value: '' },
        { label: 'Product Issue', value: 'Product Issue' },
        { label: 'Service Issue', value: 'Service Issue' },
        { label: 'Billing Problem', value: 'Billing Problem' },
        { label: 'incorrect billing', value: 'incorrect billing' },
        { label: 'Other', value: 'Other' }
    ];

    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Category', fieldName: 'Category__c', type: 'text' },
        { label: 'Status', fieldName: 'Status__c', type: 'text' },
        { label: 'Product', fieldName: 'ProductName', type: 'text' },
        { label: 'Contact', fieldName: 'ContactName', type: 'text' },
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

    @wire(getAllComplaints)
    wiredComplaints(result) {
        this.wiredComplaintsResult = result;
        const { data, error } = result;
        if (data) {
            this.complaints = data.map(c => ({
                ...c,
                ProductName: c.Product__r?.Name,
                ContactName: c.Contact__r?.Name
            }));
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

    handleStatusChange(event) {
        this.selectedStatus = event.detail.value;
        this.applyFilters();
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.detail.value;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredComplaints = this.complaints.filter(c => {
            const matchesStatus = this.selectedStatus ? c.Status__c === this.selectedStatus : true;
            const matchesSearch = c.Name?.toLowerCase().includes(this.searchKey);
            const matchesCategory = this.selectedCategory ? c.Category__c === this.selectedCategory : true;
            return matchesStatus && matchesSearch && matchesCategory;
        });
    }

    refreshList() {
        refreshApex(this.wiredComplaintsResult);
    }

    handleNewComplaint() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Complaint__c',
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
                    objectApiName: 'Complaint__c',
                    actionName: 'view'
                }
            });
        } else if (action.name === 'edit') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.Id,
                    objectApiName: 'Complaint__c',
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
        deleteComplaint({ complaintId: this.selectedRecord.Id })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Deleted',
                    message: 'Complaint was deleted',
                    variant: 'success'
                }));
                this.showDeleteModal = false;
                return refreshApex(this.wiredComplaintsResult);
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
