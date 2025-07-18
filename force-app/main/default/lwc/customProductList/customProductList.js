import { LightningElement, wire, track } from 'lwc';
import getInsurancePackages from '@salesforce/apex/AllPackages.getInsurancePackages';
import { deleteRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class CustomProductList extends NavigationMixin(LightningElement) {
    @track products = [];
    @track filteredProducts = [];
    @track searchKey = '';
    @track selectedStatus = '';
    @track error;
    @track showDeleteModal = false;
    @track selectedRecord = {};

    wiredResult;

    statusOptions = [
        { label: 'All', value: '' },
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Pending', value: 'Pending' }
    ];

    columns = [
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Code', fieldName: 'ProductCode', type: 'text' },
        { label: 'Premium', fieldName: 'Annual_Premium__c', type: 'currency' },
        { label: 'Coverage', fieldName: 'Coverage_Limit__c', type: 'currency' },
        {
    label: 'Status',
    fieldName: 'Status__c',
    type: 'text',
    cellAttributes: {
        class: { fieldName: 'statusClass' }
    }
},

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

  @wire(getInsurancePackages)
wiredProducts(result) {
    this.wiredResult = result;
    const { data, error } = result;
    if (data) {
        this.products = data.map(prod => ({
            ...prod,
            statusClass: prod.Status__c === 'Active'
                ? 'slds-text-color_success'
                : prod.Status__c === 'Inactive'
                ? 'slds-text-color_error'
                : ''
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
        this.filteredProducts = this.products.filter(prod => {
            const matchSearch = prod.Name?.toLowerCase().includes(this.searchKey);
            const matchStatus = this.selectedStatus ? prod.Status__c === this.selectedStatus : true;
            return matchSearch && matchStatus;
        });
    }

    handleRowAction(event) {
        const action = event.detail.action.name;
        const row = event.detail.row;

        if (action === 'view') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.Id,
                    objectApiName: 'Product2',
                    actionName: 'view'
                }
            });
        } else if (action === 'edit') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.Id,
                    objectApiName: 'Product2',
                    actionName: 'edit'
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
        deleteRecord(this.selectedRecord.Id)
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Deleted',
                    message: 'Product was deleted successfully',
                    variant: 'success'
                }));
                this.showDeleteModal = false;
                return refreshApex(this.wiredResult);
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error deleting record',
                    message: error.body.message,
                    variant: 'error'
                }));
            });
    }

    handleNewProduct() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Product2',
                actionName: 'new'
            }
        });
    }

    refreshList() {
        return refreshApex(this.wiredResult);
    }
}
