import { LightningElement } from 'lwc';

export default class DashboardQuickLinks extends LightningElement {
    dashboards = [
        {
            label: '🧾 Customer issue and reimbursement insights',
            description: 'Track client claims, fraud detection, and key performance indicators in real time.',
            url: 'https://esprit-dev-ed.develop.lightning.force.com/lightning/r/Dashboard/01ZQy000003uOKTMA2/view?queryScope=userFolders',
            theme: 'primary',
            ariaLabel: 'Open dashboard 🧾 Customer issue and reimbursement insights'
        },
        {
            label: '💸 Sales Pipeline & Lead Insights Dashboard',
            description: 'Monitor leads, opportunities with actionable insights.',
            url: 'https://esprit-dev-ed.develop.lightning.force.com/lightning/r/Dashboard/01ZQy000003tff7MAA/view?queryScope=userFolders',
            theme: 'secondary',
            ariaLabel: 'Open dashboard 💸 Sales Pipeline & Lead Insights Dashboard'
        }
    ];

    openDashboard(event) {
        const url = event.currentTarget.dataset.url;
        window.open(url, '_blank');
    }

    openDashboardKey(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const url = event.currentTarget.dataset.url;
            window.open(url, '_blank');
        }
    }
}
