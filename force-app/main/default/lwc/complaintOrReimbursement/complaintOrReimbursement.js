import { LightningElement } from 'lwc';

export default class InsuranceHelpForm extends LightningElement {
    issueType = '';
    policyActive = '';
    serviceReceived = '';
    recommendation = '';
    showAdditionalQuestions = false;

    issueTypeOptions = [
        { label: 'Reimbursement Delay', value: 'delay' },
        { label: 'Claim Rejected', value: 'rejected' },
        { label: 'Coverage Confusion', value: 'coverage' },
        { label: 'Incorrect Billing', value: 'billing' }
    ];

    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ];

    handleIssueTypeChange(event) {
        this.issueType = event.detail.value;
        this.showAdditionalQuestions = true;
        this.recommendation = '';
    }

    handlePolicyStatusChange(event) {
        this.policyActive = event.detail.value;
    }

    handleServiceReceivedChange(event) {
        this.serviceReceived = event.detail.value;
    }

handleDecision() {
    if (this.policyActive === 'no') {
        this.recommendation = "⚠️ Your insurance policy was not active during the incident. Please contact our support team for further guidance.";
    } else if (this.issueType === 'delay' && this.serviceReceived === 'yes') {
        this.recommendation = "✅ You may request a reimbursement. Make sure to include all relevant invoices and medical reports for faster processing.";
    } else if (this.issueType === 'rejected' && this.serviceReceived === 'yes') {
        this.recommendation = "📝 Your claim may be eligible for review. We recommend filing a complaint so our team can reassess the situation.";
    } else if (this.issueType === 'billing') {
        this.recommendation = "💬 Please submit a reimbursement request with the corrected billing documents. If needed, contact your healthcare provider for clarification.";
    } else if (this.issueType === 'coverage') {
        this.recommendation = "📄 If you’re unsure about what your plan covers, reach out to our support or consult your policy document for details.";
    } else {
        this.recommendation = "📢 For any other concerns, we recommend filing a complaint. Our team will assist you in resolving the issue.";
    }
}

}
