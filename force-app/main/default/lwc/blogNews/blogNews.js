import { LightningElement, track } from 'lwc';

export default class BlogNews extends LightningElement {
    @track articles = [
        {
            id: 1,
            title: "How to Choose the Best Insurance?",
            date: "March 24, 2025",
            summary: "Discover the key criteria to select the best insurance plan for you and your family."
        },
        {
            id: 2,
            title: "Insurance Trends for 2025",
            date: "March 15, 2025",
            summary: "What are the latest innovations and regulations shaping the insurance market this year?"
        },
        {
            id: 3,
            title: "Understanding Life Insurance Policies",
            date: "March 10, 2025",
            summary: "A beginner's guide to understanding different life insurance options and benefits."
        }
    ];

    handleReadMore(event) {
        const articleId = event.target?.dataset?.id; // Optional chaining to avoid errors
        if (!articleId) {
            console.error("Error: Article ID is undefined!");
            return;
        }
        console.log('Selected article:', articleId);
    }
    
}
