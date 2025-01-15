document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    startAutoRefresh();
});

function initializeDashboard() {
    updateLastRefreshTime();
    loadInitialData();
    setupThemeToggle();
}

function setupEventListeners() {
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Search functionality
    document.getElementById('instance-search').addEventListener('input', debounce(filterInstances, 300));
    
    // Refresh button
    document.getElementById('refresh-button').addEventListener('click', function() {
        this.classList.add('rotating');
        refreshDashboard();
        setTimeout(() => this.classList.remove('rotating'), 1000);
    });
}

function refreshDashboard() {
    showLoadingSpinner();
    fetch('/eureka/apps')
        .then(response => response.json())
        .then(data => {
            updateDashboardData(data);
            hideLoadingSpinner();
            updateLastRefreshTime();
        })
        .catch(error => {
            showError('Failed to refresh dashboard');
            console.error('Error:', error);
        });
}

function updateDashboardData(data) {
    const instancesGrid = document.getElementById('instances-grid');
    instancesGrid.innerHTML = '';
    
    if (!data.applications || !data.applications.application) {
        instancesGrid.innerHTML = '<div class="no-instances">No instances found</div>';
        return;
    }
    
    const applications = Array.isArray(data.applications.application) ? 
        data.applications.application : [data.applications.application];
    
    applications.forEach((app, index) => {
        const instanceElement = createInstanceElement(app);
        instanceElement.style.animationDelay = `${index * 0.1}s`;
        instancesGrid.appendChild(instanceElement);
    });
    
    updateStatistics(data);
}

function createInstanceElement(app) {
    const div = document.createElement('div');
    div.className = 'instance-item';
    div.innerHTML = `
        <h3>${app.name}</h3>
        <div class="instance-details">
            <p>Status: <span class="status-${app.instance[0].status.toLowerCase()}">${app.instance[0].status}</span></p>
            <p>Instances: ${app.instance.length}</p>
        </div>
    `;
    return div;
}

function updateStatistics(data) {
    const totalApps = data.applications.application.length;
    const totalInstances = data.applications.application.reduce((acc, app) => 
        acc + (Array.isArray(app.instance) ? app.instance.length : 1), 0);
    
    document.getElementById('total-apps').textContent = totalApps;
    document.getElementById('total-instances').textContent = totalInstances;
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function startAutoRefresh() {
    setInterval(refreshDashboard, 30000);
}

// Theme toggle functionality
function toggleTheme() {
    document.body.classList.toggle('dark');
    const icon = document.querySelector('.btn-theme i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

function updateDashboard(data) {
    // Add your dashboard update logic here
}
