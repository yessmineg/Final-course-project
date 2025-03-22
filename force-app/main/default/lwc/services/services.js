import { LightningElement } from 'lwc';

export default class Services extends LightningElement {
    services = [
        {
            id: 1,
            name: 'Term Life Insurance',
            description: 'A coverage for a specific period to protect your loved ones in case of death during that period.'
        },
        {
            id: 2,
            name: 'Permanent Life Insurance',
            description: 'A life insurance product that remains in force as long as you are alive, offering lifetime coverage.'
        },
        {
            id: 3,
            name: 'Universal Life Insurance',
            description: 'An insurance combining life protection with an investment that generates cash value.'
        },
        {
            id: 4,
            name: 'Refundable Life Insurance',
            description: 'A type of insurance that refunds the premium if you do not pass away before the end of the covered period.'
        }
    ];

    handleMouseOver(event) {
        const element = event.target;
        element.classList.add('hovered');
    }

    handleMouseOut(event) {
        const element = event.target;
        element.classList.remove('hovered');
    }
}
