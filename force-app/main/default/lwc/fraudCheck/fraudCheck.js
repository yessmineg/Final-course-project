import { LightningElement, api } from 'lwc';
import checkFraud from '@salesforce/apex/FraudDetectionService.checkFraud';

export default class FraudCheck extends LightningElement {
    @api recordId;

    diagnostic;
    score;
    explanations = [];
    error;

    // Détermine la classe de couleur selon le score
    get progressColorClass() {
        if (this.score === null || this.score === undefined) return '';
        if (this.score < 25) return 'low';
        if (this.score < 70) return 'medium';
        return 'high';
    }

    // Détermine la largeur de la barre
    get progressWidthClass() {
        if (this.score === null || this.score === undefined) return 'width-0';
        const val = Math.min(Math.max(Math.round(this.score), 0), 100);
        return `width-${val}`;
    }

    // Combine les classes pour la barre de progression
    get progressBarClass() {
        return `progress-bar-fill ${this.progressColorClass} ${this.progressWidthClass}`;
    }

    // Génère un diagnostic basé sur le score (logique identique à Python)
    getDiagnosticFromScore(score) {
        if (score < 25) return "✅ Seems Legit";
        if (score < 70) return "⚠️ Suspicious";
        return "❌ Fraud";
    }

    // Méthode appelée au clic sur le bouton
    handleClick() {
        if (!this.recordId) {
            this.error = '❌ recordId is undefined. Make sure this component is used on a record page.';
            return;
        }

        checkFraud({ reimbursementId: this.recordId })
            .then(response => {
                try {
                    const res = JSON.parse(response);

                    if (res.error) {
                        this.error = res.error;
                        this.diagnostic = null;
                        this.score = null;
                        this.explanations = [];
                    } else {
                        const score = Math.round(res.fraud_score); // Suppose que fraud_score est un float entre 0 et 100
                        this.score = score;
                        this.diagnostic = this.getDiagnosticFromScore(score);
                        this.explanations = res.explanations || [];
                        this.error = null;
                    }
                } catch (err) {
                    this.error = '❌ Failed to parse JSON: ' + err.message;
                    this.diagnostic = null;
                    this.score = null;
                    this.explanations = [];
                }
            })
            .catch(err => {
                this.error = '❌ Apex call failed: ' + JSON.stringify(err);
                this.diagnostic = null;
                this.score = null;
                this.explanations = [];
            });
    }
}
