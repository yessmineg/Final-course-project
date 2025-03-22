import { LightningElement } from 'lwc';

export default class TestimonialList extends LightningElement {
    testimonials = [
        {
            id: 1,
            author: 'John Doe',
            date: 'January 15, 2025',
            content: 'This service has completely transformed the way our business operates. The customer support is top-notch!'
        },
        {
            id: 2,
            author: 'Jane Smith',
            date: 'February 20, 2025',
            content: 'I have been using this platform for a year, and it’s been a game-changer for our team’s productivity. Highly recommended!'
        },
        {
            id: 3,
            author: 'Tom Brown',
            date: 'March 5, 2025',
            content: 'A fantastic experience! The service is reliable, user-friendly, and the results speak for themselves.'
        },
        {
            id: 4,
            author: 'Emily White',
            date: 'March 18, 2025',
            content: 'I’ve seen a significant improvement in my workflow since I started using this service. It has saved me hours of work every week.'
        },
        {
            id: 5,
            author: 'James Lee',
            date: 'March 25, 2025',
            content: 'An outstanding tool! The features are exactly what I needed to streamline my business processes. I’m very satisfied!'
        }
    ];
}
