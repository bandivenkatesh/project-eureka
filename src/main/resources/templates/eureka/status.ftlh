<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eureka Status</title>
    <base href="${request.contextPath}">
    <link rel="stylesheet" href="css/custom.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="dashboard-theme">
    <header class="eureka-header">
        <nav class="navbar">
            <div class="brand">
                <i class="fas fa-cloud-upload-alt pulse"></i>
                <h1>Eureka Service Registry</h1>
            </div>
            <div class="nav-controls">
                <div class="environment-badge">${environment!'DEFAULT'}</div>
                <button id="refresh-button" class="btn-refresh" title="Refresh Dashboard">
                    <i class="fas fa-sync-alt"></i>
                </button>
                <button id="theme-toggle" class="btn-theme" title="Toggle Theme">
                    <i class="fas fa-moon"></i>
                </button>
            </div>
        </nav>
    </header>

    <main class="dashboard-container">
        <div class="stats-overview">
            <div class="stat-card">
                <h3>Instances</h3>
                <div class="stat-value" id="total-instances">0</div>
            </div>
            <div class="stat-card">
                <h3>Applications</h3>
                <div class="stat-value" id="total-apps">0</div>
            </div>
            <div class="stat-card">
                <h3>Status</h3>
                <div class="stat-value status-indicator">
                    <i class="fas fa-circle"></i> Healthy
                </div>
            </div>
        </div>

        <div class="search-bar">
            <input type="text" id="instance-search" placeholder="Search instances...">
            <i class="fas fa-search"></i>
        </div>

        <section id="instances-grid" class="instances-container">
            <!-- Instances will be dynamically populated -->
            <div class="loading-spinner">
                <i class="fas fa-circle-notch fa-spin"></i>
            </div>
        </section>
    </main>

    <footer class="dashboard-footer">
        <p>Eureka Server Version ${version!'N/A'}</p>
        <p>Last Updated: <span id="last-updated"></span></p>
    </footer>

    <script src="/js/custom.js"></script>
</body>
</html>
