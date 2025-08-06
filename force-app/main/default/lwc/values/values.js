import { LightningElement } from 'lwc';

export default class ValuesCircles extends LightningElement {
    values = [
        { id: 1, label: 'Responsibility', icon: 'utility:user' },
        { id: 2, label: 'Providence', icon: 'utility:shield' },
        { id: 3, label: 'Security', icon: 'utility:lock' },
        { id: 4, label: 'Transparency', icon: 'utility:transparent' },
        { id: 5, label: 'Innovation', icon: 'utility:puzzle' }
    ];
}
