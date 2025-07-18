import { LightningElement, wire, track } from 'lwc';
import getContracts from '@salesforce/apex/ContractController.getContracts';
import deleteContract from '@salesforce/apex/ContractController.deleteContract';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ContractList extends NavigationMixin(LightningElement) {
    @track contracts = [];
    @track filteredContracts = [];
    @track searchKey = '';
    @track selectedStatus = '';
    @track selectedTerm = '';
    @track error;
    @track showDeleteModal = false;
    @track selectedRecord = {};

    wiredContractsResult;

    statusOptions = [
        { label: 'All', value: '' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Activated', value: 'Activated' },
        { label: 'Canceled', value: 'Canceled' },
        { label: 'Expired', value: 'Expired' }
    ];

    contractTermOptions = [
        { label: 'All', value: '' },
        { label: '12 Months', value: '12' },
        { label: '24 Months', value: '24' },
        { label: '36 Months', value: '36' }
    ];

    columns = [
        { label: 'Contract Number', fieldName: 'ContractNumber', type: 'text' },
        { label: 'Account', fieldName: 'AccountName', type: 'text' },
        {
            label: 'Status',
            fieldName: 'Status',
            type: 'text',
            cellAttributes: { class: { fieldName: 'statusClass' } }
        },
        { label: 'Contract Term (months)', fieldName: 'ContractTerm', type: 'number' },
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

    @wire(getContracts)
    wiredContracts(result) {
        this.wiredContractsResult = result;
        const { data, error } = result;
        if (data) {
            this.contracts = data.map(c => {
                let cssClass = '';
                if (c.Status === 'Activated') cssClass = 'slds-text-color_success';
                else if (c.Status === 'Canceled') cssClass = 'slds-text-color_error';
                return { ...c, statusClass: cssClass };
            });
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

    handleTermChange(event) {
        this.selectedTerm = event.detail.value;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredContracts = this.contracts.filter(c => {
            const matchesSearch = c.ContractNumber?.toLowerCase().includes(this.searchKey);
            const matchesStatus = this.selectedStatus ? c.Status === this.selectedStatus : true;
            const matchesTerm = this.selectedTerm ? c.ContractTerm === parseInt(this.selectedTerm) : true;
            return matchesSearch && matchesStatus && matchesTerm;
        });
    }

    refreshList() {
        refreshApex(this.wiredContractsResult);
    }

    handleNewContract() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Contract',
                actionName: 'new'
            }
        });
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        if (action.name === 'view' || action.name === 'edit') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: row.Id,
                    objectApiName: 'Contract',
                    actionName: action.name
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
        deleteContract({ contractId: this.selectedRecord.Id })
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Deleted',
                    message: 'Contract was deleted',
                    variant: 'success'
                }));
                this.showDeleteModal = false;
                return refreshApex(this.wiredContractsResult);
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
