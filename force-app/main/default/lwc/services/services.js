import { LightningElement } from 'lwc';

export default class Services extends LightningElement {
    services = [
        {
            id: 1,
            name: 'Term Life Insurance',
            description: 'A coverage for a specific period to protect your loved ones in case of death during that period.',
            icon: 'custom:custom17' // lock icon style
        },
        {
            id: 2,
            name: 'Permanent Life Insurance',
            description: 'A life insurance product that remains in force as long as you are alive, offering lifetime coverage.',
            icon: 'custom:custom3' // tree/long-term
        },
        {
            id: 3,
            name: 'Universal Life Insurance',
            description: 'An insurance combining life protection with an investment that generates cash value.',
            icon: 'custom:custom5' // investment style
        },
        {
            id: 4,
            name: 'Refundable Life Insurance',
            description: 'A type of insurance that refunds the premium if you do not pass away before the end of the covered period.',
            icon: 'custom:custom1' // money bag
        }
    ];

    handleMouseOver(event) {
        const element = event.target.closest('.service-card');
        if (element) element.classList.add('hovered');
    }

    handleMouseOut(event) {
        const element = event.target.closest('.service-card');
        if (element) element.classList.remove('hovered');
    }
}
