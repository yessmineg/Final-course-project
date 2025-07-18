import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import deleteAccount from '@salesforce/apex/AccountController.deleteAccount';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CustomAccountList extends NavigationMixin(LightningElement) {
    @track accounts = [];
    @track filteredAccounts = [];
    @track searchKey = '';
    @track selectedIndustry = '';
    @track error;
    @track showDeleteModal = false;
    @track selectedRecord = {};

    wiredAccountsResult;

    industryOptions = [
        { label: 'All', value: '' },
        { label: 'Agriculture ', value: 'Agriculture ' },
        { label: 'Apparel ', value: 'Apparel ' },
        { label: 'Banking ', value: 'Banking ' },
        { label: 'Biotechnology ', value: 'Biotechnology ' },
        { label: 'Chemicals ', value: 'Chemicals ' },
        { label: 'Communications', value: 'Communications' },
        { label: 'Construction ', value: 'Construction ' }
    ];

    columns = [
        {
            label: 'Name',
            fieldName: 'Name',
            type: 'button',
            typeAttributes: {
                label: { fieldName: 'Name' },
                name: 'view_account',
                variant: 'base',
                class: 'slds-text-link'
            }
        },
        { label: 'Industry', fieldName: 'Industry', type: 'text' },
        { label: 'Number of employees', fieldName: 'NumberOfEmployees', type: 'number' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' },
        { label: 'Owner', fieldName: 'OwnerName', type: 'text' },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: '✏️ Edit', name: 'edit' },
                    { label: '🗑 Delete', name: 'delete' }
                ]
            }
        }
    ];

    @wire(getAccounts)
    wiredAccounts(result) {
        this.wiredAccountsResult = result;
        const { data, error } = result;
        if (data) {
            this.accounts = data;
            this.applyFilters();
        } else if (error) {
            this.error = error.body.message;
        }
    }

    handleSearch(event) {
        this.searchKey = event.target.value.toLowerCase();
        this.applyFilters();
    }

    handleIndustryChange(event) {
        this.selectedIndustry = event.detail.value;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredAccounts = this.accounts.filter(acc => {
            const matchesSearch = acc.Name?.toLowerCase().includes(this.searchKey);
            const matchesIndustry = this.selectedIndustry ? acc.Industry === this.selectedIndustry : true;
            return matchesSearch && matchesIndustry;
        });
    }

    refreshList() {
        refreshApex(this.wiredAccountsResult);
    }

    handleNewAccount() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Account',
                actionName: 'new'
            }
        });
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        if (action.name === 'view_account') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.Id,
                    objectApiName: 'Account',
                    actionName: 'view'
                }
            });
        } else if (action.name === 'edit') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.Id,
                    objectApiName: 'Account',
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
        deleteAccount({ accountId: this.selectedRecord.Id })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Deleted',
                    message: 'Account was deleted',
                    variant: 'success'
                }));
                this.showDeleteModal = false;
                return refreshApex(this.wiredAccountsResult);
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
