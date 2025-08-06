import { LightningElement, track } from 'lwc';

export default class TestimonialList extends LightningElement {
    @track currentIndex = 0;
    @track animationDirection = 'slide-in'; // default

    testimonials = [
        {
            id: 1,
            author: 'Chris Brown',
            date: 'January 15, 2025',
            content: 'This service has completely transformed the way our business operates. The customer support is top-notch!'
        },
        {
            id: 2,
            author: 'Connor Smith',
            date: 'February 20, 2025',
            content: 'I have been using this platform for a year, and it’s been a game-changer for our team’s productivity. Highly recommended!'
        },
        {
            id: 3,
            author: 'Pershia Peirove',
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
            author: 'James Stray',
            date: 'March 25, 2025',
            content: 'An outstanding tool! The features are exactly what I needed to streamline my business processes. I’m very satisfied!'
        }
    ];

    get currentTestimonial() {
        return this.testimonials[this.currentIndex];
    }

    handleNext() {
        this.animationDirection = 'slide-right';
        this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
    }

    handlePrev() {
        this.animationDirection = 'slide-left';
        this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
    }

    get animationClass() {
        return `testimonial ${this.animationDirection}`;
    }
}
