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
    
    data.applications.application.forEach((app, index) => {
        const instanceElement = createInstanceElement(app);
        instanceElement.style.animationDelay = `${index * 0.1}s`;
        instancesGrid.appendChild(instanceElement);
    });
    
    updateStatistics(data);
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
