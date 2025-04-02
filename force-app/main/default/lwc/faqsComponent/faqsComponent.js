import { LightningElement, track } from 'lwc';

export default class FaqComponent extends LightningElement {
    @track faqs = [
        {
            id: '1',
            question: 'What is life insurance?',
            answer: 'Life insurance is a contract between an individual and an insurance company in which the insurer provides a lump sum payment or income upon the individual’s death or after a set period. It is designed to provide financial security to your loved ones in case of an unexpected event.',
            isExpanded: false
        },
        {
            id: '2',
            question: 'How can I file a claim?',
            answer: 'Filing a claim involves contacting your insurance company and providing them with the necessary documentation (such as death certificates, police reports, medical records, etc.). Depending on the policy, the insurance provider will guide you through the claim process and how you’ll receive your payment.',
            isExpanded: false
        },
        {
            id: '3',
            question: 'What is health insurance?',
            answer: 'Health insurance covers the cost of medical expenses. Depending on the policy, it may cover doctor visits, hospital stays, prescriptions, and preventive care. Health insurance can be purchased individually or provided by an employer or government program.',
            isExpanded: false
        },
        {
            id: '4',
            question: 'What is home insurance?',
            answer: 'Home insurance protects homeowners against damages to their property caused by events like fires, theft, vandalism, and certain types of natural disasters. It also covers personal liability in case someone is injured on your property.',
            isExpanded: false
        },
        {
            id: '5',
            question: 'What does “no-claim bonus” mean in car insurance?',
            answer: 'A no-claim bonus (NCB) is a discount offered by insurance providers to policyholders who haven’t made any claims during a certain period. The longer the no-claim period, the higher the discount offered at renewal. It helps lower your premium over time.',
            isExpanded: false
        }
    ];

    // Method to toggle the expanded state of the FAQ
    toggleAnswer(event) {
        const selectedQuestionId = event.target.dataset.id;
        const selectedFaq = this.faqs.find(faq => faq.id === selectedQuestionId);

        if (selectedFaq) {
            selectedFaq.isExpanded = !selectedFaq.isExpanded; // Toggle the 'isExpanded' state
            this.faqs = [...this.faqs]; // Force reactivity by creating a new array
        }
    }
}
