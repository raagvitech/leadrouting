import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRouterRules from '@salesforce/apex/RouterController.getRouterRules';

import getFields from '@salesforce/apex/FieldFetchingController.getFields';

import searchRecords from '@salesforce/apex/RouterLookupController.searchRecords';
export default class RenderingManagement extends NavigationMixin(LightningElement) {

    @track pageSize = '20';
    @track totalRecords = 0;
    @track routerData = [];
    
    // Tracks the current target object tab selection (maps to parent Router__c.Target_Object__c)
    @track currentTab = 'Lead';
    @track isModalOpen = false;
    @track routerName = '';
    @track selectedObject = 'Lead';
    @track assignedField = 'Owner';
    @track evaluationOrder = '9';

    //added vars
    @track showRouterList = true;
    @track showAssignmentPage = false;
    @track cardSelected = false;
    @track showRouterMemberList = false;

    @track shouldScrollToRouter = false;

    

    queueOptions = [
    { label: 'Queue', value: 'Queue' },
    { label: 'User', value: 'User' }
];


    filterRows = [];
    // queueRows = [];

    //8 cards , its icons and description
     assignmentMethods = [
        {
            id: 1,
            title: 'Round Robin',
            icon: 'utility:rotate',
            iconClass: 'icon-container',
            description: 'Assign to users in rotation either evenly or using weights.',
            link: '#'
        },
        {
            id: 2,
            title: 'Load Balance',
            icon: 'standard:dashboard',
            iconClass: 'yellow-icon-box',
            description: 'Assign to users based on their active workload.You can define whether active workload is based on record count or a score-based system.',
            link: '#'
        },
        {
            id: 3,
            title: 'Territory Assignment',
            icon: 'utility:checkin',
            iconClass: 'green-icon-box',
            description: 'Assign to users based on the geographic territories they own.Click here to manage your territories.',
            link: '#'
        },
        {
            id: 4,
            title: 'Rule-Based Assignment',
            icon: 'utility:check',
            iconClass: 'brown-icon-box',
            description: 'A more powerfull alternative to stanadard assignment rules.Quickly define criteria for assigning records.',
            link: '#'
        },
        {
            id: 5,
            title: 'Skill-Based Assignment',
            icon: 'utility:favorite_alt',
            iconClass: 'navy-icon-box',
            description: 'Assign to users according to their skills and availability.Skills may include language,support tiers,product knowledge, and more.',
            link: '#'
        },
        {
            id: 6,
            title: 'User-Lookup Assignment',
            icon: 'utility:search',
            iconClass: 'red-icon-box',
            description: 'Assign to the user listed in a lookup field on the record or a related record.',
            link: '#'
        },
        {
            id: 7,
            title: 'Shark Tank',
            icon: 'utility:animal_and_nature',
            iconClass: 'purple-icon-box',
            description: 'Allow users to claim records. Router member will be notified when records are available to claim.',
            link: '#'
        },
        {
            id: 8,
            title: 'Duplicate Matching',
            icon: 'utility:merge',
            iconClass: 'orange-icon-box',
            description: 'Assign records flagged by your Salesforce Duplicate Rules to the same user.',
            link: '#'
        }
    ];

    fieldOptions = [];

    @wire(getFields, { objectName: '$selectedObject' })
    wiredFields({ data, error }) {
        if (data) {
            this.fieldOptions = data;
        }
}

@track queueRows = [
    {
        id: Date.now(),
        type: 'Queue',
        searchKey: '',
        results: [],
        selectedId: null
    }
];

selectedFieldType = 'TEXT';

handleFieldChange(event) {
    const field = event.detail.value;

    const selected = this.fieldOptions.find(f => f.value === field);

    this.selectedFieldType = selected?.type || 'TEXT';
}

    

    filterRows = [];
    // queueRows = [
    //     {
    //         id: 1
    //     }
    // ];

    columnsOfRouterMembers = [
        
        { label: 'Member', fieldName: 'name' },
        { label: 'Enabled', fieldName: 'enabled', type: 'boolean' },
        { label: 'Status', fieldName: 'status' },
        { label: 'Weight', fieldName: 'weight' },
        { label: 'Time-Based Limit', fieldName: 'timeLimit' },
        { label: 'Workload Capacity', fieldName: 'capacity' },
        { label: 'Schedule', fieldName: 'schedule' },
        { label: 'Holiday Schedule', fieldName: 'holidaySchedule' }
    ];


    connectedCallback() {
        console.log('Component connected');
    } 

    pageSizeOptions = [
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' }
    ];

    objectOptions = [
        { label: 'Lead', value: 'Lead' },
        { label: 'Account', value: 'Account' },
        { label: 'Case', value: 'Case' }
    ];

    assignFieldOptions = [
        { label: 'Owner', value: 'Owner' },
        { label: 'Queue', value: 'Queue' }
    ];

    evaluationOrderOptions = Array.from({ length: 10 }, (_, index) => ({
        label: String(index + 1),
        value: String(index + 1)
    }));

    // Table Column Schema Layout Configurations
    columns = [
        { label: '↑ Order', fieldName: 'order', type: 'text', initialWidth: 80 },
        { label: 'Name', fieldName: 'name', type: 'text', editable: true },
        { 
            label: 'Enabled', 
            fieldName: 'enabled', 
            type: 'boolean', 
            cellAttributes: { alignment: 'left' },
            editable: true 
        },
        { 
            label: 'Status', 
            fieldName: 'status', 
            type: 'text',
            cellAttributes: { 
                class: { fieldName: 'statusClass' },
                iconName: 'utility:record', 
                iconPosition: 'left' 
            } 
        },
        { label: 'Assignment Method', fieldName: 'assignmentMethod', type: 'text' },
        { 
            label: 'Connected Queues', 
            fieldName: 'connectedQueues', 
            type: 'url', 
            typeAttributes: { label: { fieldName: 'queueLabel' }, target: '_blank' } 
        },
        { label: 'Criteria', fieldName: 'criteria', type: 'text' },
        { label: 'Overflow Behavior', fieldName: 'overflowBehavior', type: 'text' },
        { 
            label: 'As', 
            fieldName: 'assignedCount', 
            type: 'number',
            cellAttributes: { alignment: 'center' } 
        },
        {
            type: 'action',
            typeAttributes: { rowActions: [{ label: 'Edit', name: 'edit' }, { label: 'Delete', name: 'delete' }] }
        }
    ];

    // Wire service fetches data automatically whenever currentTab changes
    @wire(getRouterRules, { targetObject: '$currentTab' })
    wiredRules({ error, data }) {
        if (data) {
            // Map Salesforce fields to UI DataTable key/value properties
            this.routerData = data.map(rule => {
                console.log('Processing rule:', rule);
                let statusColorClass = rule.Status__c === 'Active' 
                    ? 'slds-text-color_success custom-bold' 
                    : 'slds-text-color_error custom-bold';

                return {
                    id: rule.Id,
                    order: rule.Order__c ? String(rule.Order__c) : '-',
                    name: rule.Name,
                    enabled: rule.Enabled__c,
                    status: rule.Status__c,
                    statusClass: statusColorClass,
                    assignmentMethod: rule.Assignment_Method__c,
                    queueLabel: rule.Connected_Queue__c || 'None', 
                    connectedQueues: rule.Connected_Queue__c ? `/lightning/r/Group/${rule.Connected_Queue__c}/view` : '#', // Points dynamically to standard group record
                    criteria: rule.Criteria__c || '-',
                    overflowBehavior: rule.Overflow_Behavior__c,
                    assignedCount: rule.Assigned_Count__c || 0
                };
            });
            console.log('Datatable Data:', JSON.stringify(this.routerData));
            this.totalRecords = this.routerData.length;
        } else if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading data',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        }
    }

    handleTabChange(event) {
        console.log('handleTabChange triggered', event);
        console.log('event details:', event.detail);
        
        // Get the value from the active tab.
        let tabValue = (event.detail && event.detail.value) || (event.target && event.target.value);
        console.log('Raw tab value:', tabValue);
        
        if (tabValue) {
            // Convert to Title Case: lead -> Lead, account -> Account, case -> Case
            this.currentTab = tabValue.charAt(0).toUpperCase() + tabValue.slice(1);
            console.log('Updated currentTab to:', this.currentTab);
        }
    }

    handleNewRouter() {
        console.log('popup-->');
        
        this.isModalOpen = true;
    }

    handleInputChange(event) {
        const fieldName = event.target.name;
        this[fieldName] = event.detail.value;
    }

    // handleCreateRouter() {
    //     // Placeholder: add create logic here later
    //     this.isModalOpen = false;
    // }

    closeModal() {
        this.isModalOpen = false;
    }

    handlePageSizeChange(event) {
        this.pageSize = event.detail.value;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Action Triggered',
                message: `Action "${actionName}" executed on row: ${row.name}`,
                variant: 'info'
            })
        );
    }

    //added Code
    handleCreateRouter() {
         this.selectedObject = this.selectedObject; 
        this.routerConfig = {
        routerName: this.routerName,
        objectName: this.selectedObject,
        assignedField: this.assignedField,
        evaluationOrder: this.evaluationOrder
    };
    this.closeModal();

    this.showRouterList = false;
    this.showAssignmentPage = true;
    this.showRouterMemberList = false;
    console.log('Router Config:',this.showAssignmentPage);

        
    }
    handleBack() {
    this.showRouterList = true;
    this.showAssignmentPage = false;
    }



    handleCardClick(event) 
    {
        const id = Number(event.currentTarget.dataset.id);

    
        if (id !== 1) {
            return;
        }
    
   
    // const id = event.currentTarget.dataset.id;

    this.selectedMethod = this.assignmentMethods.find(
        item => String(item.id) === String(id)
    );

    this.cardSelected = true;

    setTimeout(() => {
        this.template.querySelector('[data-section="assignment"]')
            ?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
    

    // this.template.querySelector('[data-section="assignment"]')
    //     ?.scrollIntoView({ behavior: 'smooth' });

    
    }
    handleAddFilterRow() {
    this.filterRows = [
        ...this.filterRows,
        {
            id: Date.now()
        }
    ];
}

handleAddQueueRow() {
    this.queueRows = [
        ...this.queueRows,
        {
            id: Date.now(),
            type: 'Queue',
            searchKey: '',
            results: [],
            selectedId: null
        }
    ];
}

handleRemoveQueueRow(event) {
    if (this.queueRows.length === 1) {
        return;
    }

    const rowId = event.currentTarget.dataset.id;

    this.queueRows = this.queueRows.filter(
        row => row.id != rowId
    );
}

handleRemoveFilterRow(event) {
    const rowId = event.currentTarget.dataset.id;

    this.filterRows = this.filterRows.filter(
        row => row.id != rowId
    );
}
handleSaveAssignment() {
     this.showRouterMemberList = true;
     console.log('Save assignment clicked. Router Config:');
     setTimeout(() => {
        this.template.querySelector('[data-section="routerMemberList"]')
            ?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
}
renderedCallback() {
    if (this.shouldScrollToRouter) {
        const el = this.template.querySelector('[data-section="routerList"]');

        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }

        this.shouldScrollToRouter = false;
    }
}

handleCancelAssignment() {
    
    this.selectedMethod = null;
    this.filterRows = [];
    this.queueRows = [];
    this.cardSelected = false;

    
    this.showRouterList = true;
    this.showAssignmentPage = false;
    this.cardSelected = false;
}

get operatorOptions() {

    switch (this.selectedFieldType) {

        case 'STRING':
        case 'PICKLIST':
            return [
                { label: 'Equals', value: 'eq' },
                { label: 'Not Equals', value: 'neq' },
                { label: 'Contains', value: 'contains' }
            ];

        case 'BOOLEAN':
            return [
                { label: 'Equals', value: 'eq' }
            ];

        case 'DATE':
        case 'DATETIME':
            return [
                { label: 'Equals', value: 'eq' },
                { label: 'Before', value: 'lt' },
                { label: 'After', value: 'gt' }
            ];

        case 'DOUBLE':
        case 'INTEGER':
            return [
                { label: 'Equals', value: 'eq' },
                { label: 'Greater Than', value: 'gt' },
                { label: 'Less Than', value: 'lt' }
            ];

        default:
            return [
                { label: 'Equals', value: 'eq' },
                { label: 'Not Null', value: 'not_null' },
                { label: 'Is Null', value: 'is_null' }
            ];
    }
}

handleTypeChange(event) {
    const id = event.target.dataset.id;
    const value = event.detail.value;

    console.log('Type Change - Row ID:', id, 'New Type:', value);

    this.queueRows = this.queueRows.map(row => {
        if(row.id == id) {
            row.type = value;
            row.searchKey = '';
            row.results = [];
            row.selectedId = null;
        }
        return row;
    });
}

// handleSearchChange(event) {
//     const id = event.target.dataset.id;
//     const value = event.target.value;

//     this.queueRows = this.queueRows.map(row => {

//         if (row.id == id) {

//             row.searchKey = value;

//             if (value.length > 1) {

//                 searchRecords({
//                     searchKey: value,
//                     typeValue: row.type
//                 })
//                 .then(result => {
//                     row.results = result.map(r => ({
//                         label: r.Name,
//                         value: r.Id
//                     }));

//                     this.queueRows = [...this.queueRows];
//                 });

//             } else {
//                 row.results = [];
//             }
//         }

//         return row;
//     });
// }

handleSearchChange(event) {
    const id = event.target.dataset.id;
    const value = event.target.value;

    const row = this.queueRows.find(r => String(r.id) === String(id));

    console.log('Search Value:', value);
    console.log('Selected Type:', row?.type);

    if (value.length > 1) {
        searchRecords({
            searchKey: value,
            typeValue: row.type
        })
        .then(result => {
            console.log('Apex Result:', result);

            this.queueRows = this.queueRows.map(r => {
                if (String(r.id) === String(id)) {
                    return {
                        ...r,
                        results: result.map(rec => ({
                            label: rec.Name,
                            value: rec.Id
                        }))
                    };
                }
                return r;
            });
        })
        .catch(error => {
            console.error('Search Error:', error);
        });
    }
}

handleSelect(event) {
    const id = event.currentTarget.dataset.id;
    const recId = event.currentTarget.dataset.value;
    const label = event.currentTarget.dataset.label;

    this.queueRows = this.queueRows.map(row => {
        if(row.id == id) {
            row.searchKey = label;
            row.selectedId = recId;
            row.results = [];
        }
        return row;
    });
}

loadResults(rowId, searchKey) {

    const row = this.queueRows.find(r => r.id === rowId);
    if (!row || !searchKey) return;

    searchRecords({
        type: row.type,
        searchKey: searchKey
    })
    .then(result => {

        this.queueRows = this.queueRows.map(r => {
            if (r.id === rowId) {
                return {
                    ...r,
                    results: result,
                    showResults: true
                };
            }
            return r;
        });

    })
    .catch(error => {
        console.error(error);
    });
}

handleUserSelection(event) {
    const rowId = event.target.dataset.id;
    const userId = event.detail.recordId;

    this.queueRows = this.queueRows.map(row => {
        if (String(row.id) === String(rowId)) {
            return {
                ...row,
                selectedRecordId: userId
            };
        }
        return row;
    });

    console.log('Selected User Id:', userId);
}

handleQueueSelection(event) {
    const rowId = event.target.dataset.id;
    const queueId = event.detail.recordId;

    this.queueRows = this.queueRows.map(row => {
        if (String(row.id) === String(rowId)) {
            return {
                ...row,
                selectedRecordId: queueId
            };
        }
        return row;
    });

    console.log('Selected Queue Id:', queueId);
}
    
}