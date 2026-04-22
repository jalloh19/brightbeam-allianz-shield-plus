// Dashboard Analytics and Charts
// Allianz Shield Plus Admin Dashboard

let charts = {};
let analyticsData = null;
let lastMetricsBust = null;

function getMetricsBustValue() {
  try {
    return localStorage.getItem('asp_admin_metrics_bust');
  } catch (_e) {
    return null;
  }
}

function maybeRefreshFromBust(source = 'unknown') {
  const current = getMetricsBustValue();
  if (!current) return;
  if (lastMetricsBust === null) {
    lastMetricsBust = current;
    return;
  }
  if (current !== lastMetricsBust) {
    lastMetricsBust = current;
    console.log(`Metrics bust changed (${source}), refreshing...`);
    refreshAnalyticsData();
  }
}

function initializeDashboard() {
  console.log('Initializing admin dashboard...');
  lastMetricsBust = getMetricsBustValue();
  loadAnalyticsData();
  
  // Refresh every minute
  setInterval(refreshAnalyticsData, 60000); 

  // Refresh when navigating back to this tab (e.g. from detail page)
  window.addEventListener('pageshow', function(event) {
    // Many browsers no longer reliably expose performance.navigation.type.
    // We always re-check the metrics bust key and refresh if needed.
    if (event && event.persisted) {
      console.log('Dashboard restored from bfcache, refreshing data...');
      refreshAnalyticsData();
      return;
    }
    maybeRefreshFromBust('pageshow');
  });

  // Refresh KPIs/charts when another tab approves/rejects
  window.addEventListener('storage', function (e) {
    if (e && e.key === 'asp_admin_metrics_bust') {
      console.log('Metrics bust detected from another tab, refreshing...');
      lastMetricsBust = e.newValue || getMetricsBustValue();
      refreshAnalyticsData();
    }
  });

  // Refresh when the tab becomes visible/focused again.
  // Note: storage events do NOT fire in the same document that called localStorage.setItem.
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) maybeRefreshFromBust('visibilitychange');
  });
  window.addEventListener('focus', function () {
    maybeRefreshFromBust('focus');
  });
}

function loadAnalyticsData() {
  fetch(`/api/admin/dashboard-stats/?t=${Date.now()}`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      analyticsData = data;
      
      // Update KPI cards
      updateKPICards(data);
      
      // Initialize charts
      initializeCharts(data);
      
      // Load recent applications
      loadRecentApplications();
      
      // Update timestamp
      updateLastRefreshTime();
    })
    .catch(error => {
      console.error('Error loading stats:', error);
    });
}

function refreshAnalyticsData() {
  loadAnalyticsData();
}

function updateKPICards(data) {
  // Extract counts safely using a normalized map
  const breakdown = data.status_breakdown || {};
  const b = {};
  Object.keys(breakdown).forEach(k => {
    b[k.toLowerCase()] = breakdown[k];
  });
  
  const approved = b.approved || data.approved_applications || 0;
  const rejected = b.rejected || 0;
  const pending = (b.submitted || 0) + (b.under_review || 0);
  const drafts = b.draft || 0;
  
  // Logical Consistency: Total = Approved + Rejected + Pending + Drafts
  const calculatedTotal = approved + rejected + pending + drafts;
  const displayTotal = Math.max(data.total_applications || 0, calculatedTotal);

  // Update DOM elements with fallback checks
  const updateEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = Number(val).toLocaleString();
    }
  };

  updateEl('kpi_total_applications', displayTotal);
  updateEl('kpi_total_approved', approved);
  updateEl('kpi_pending_review', pending);
  updateEl('kpi_total_rejected', rejected);
}

// Expose for other pages (and debugging)
window.refreshAnalyticsData = refreshAnalyticsData;
window.loadAnalyticsData = loadAnalyticsData;
window.updateKPICards = updateKPICards;

function initializeCharts(data) {
  // Destroy existing charts if they exist
  Object.keys(charts).forEach(key => {
    if (charts[key]) {
      charts[key].destroy();
    }
  });

  // Plan Distribution Pie Chart
  initializePlanChart(data);

  // Status Breakdown Pie Chart
  initializeStatusChart(data);

  // Applicant Type Pie Chart
  initializeApplicantChart(data);

  // Submission Trend Line Chart (mock data for now)
  initializeTrendChart(data);
}
function initializePlanChart(data) {
  const ctx = document.getElementById('planChart');
  if (!ctx) return;

  const planData = {};
  Object.keys(data.plan_distribution || {}).forEach(k => {
    planData[k.replace(/\s+/g, '_').toLowerCase()] = data.plan_distribution[k];
  });

  charts.plan = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Plan 5 (RM360K)', 'Plan 6 (RM600K)', 'Plan 7 (RM900K)'],
      datasets: [{
        data: [
          planData.plan_5 || 0,
          planData.plan_6 || 0,
          planData.plan_7 || 0
        ],
        backgroundColor: [
          '#DBEAFE', // light-blue-200
          '#0051BA', // Allianz primary
          '#003DA5'  // Allianz secondary
        ],
        borderColor: '#FFFFFF',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });

  console.log('Plan chart initialized');
}

function initializeStatusChart(data) {
  const ctx = document.getElementById('statusChart');
  if (!ctx) return;

  const statusData = data.status_breakdown || {};
  charts.status = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'],
      datasets: [{
        data: [
          statusData.draft || 0,
          statusData.submitted || 0,
          statusData.under_review || 0,
          statusData.approved || 0,
          statusData.rejected || 0
        ],
        backgroundColor: [
          '#D1D5DB', // gray-300
          '#3B82F6', // blue-500
          '#FBBF24', // amber-400
          '#10B981', // green-500
          '#EF4444'  // red-500
        ],
        borderColor: '#FFFFFF',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });

  console.log('Status chart initialized');
}
function initializeApplicantChart(data) {
  const ctx = document.getElementById('applicantChart');
  if (!ctx) return;

  const applicantData = {};
  Object.keys(data.applicant_distribution || {}).forEach(k => {
    applicantData[k.toLowerCase()] = data.applicant_distribution[k];
  });

  charts.applicant = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Workers', 'Students'],
      datasets: [{
        data: [
          applicantData.worker || applicantData.workers || 0,
          applicantData.student || applicantData.students || 0
        ],
        backgroundColor: [
          '#0051BA', // Allianz primary (workers)
          '#F59E0B'  // Allianz accent (students)
        ],
        borderColor: '#FFFFFF',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });

  console.log('Applicant chart initialized');
}

function initializeTrendChart(data) {
  const ctx = document.getElementById('trendChart');
  if (!ctx) return;

  const trendDataMap = data.trend_data || {};
  
  // Generate last 30 days labels and match with real data
  const labels = [];
  const counts = [];
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Label format: DD MMM (e.g. 23 Apr)
    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    labels.push(label);
    counts.push(trendDataMap[dateStr] || 0);
  }

  charts.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Applications Submitted',
        data: counts,
        borderColor: '#0051BA',
        backgroundColor: 'rgba(0, 81, 186, 0.05)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#0051BA',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 5
          }
        }
      }
    }
  });

  console.log('Trend chart initialized');
}

function getLast30Days() {
  const labels = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' }));
  }
  return labels;
}

function generateTrendData(labels) {
  // Mock trend data - in production, fetch from server
  const data = [];
  let baseValue = 15;
  
  for (let i = 0; i < labels.length; i++) {
    const variance = Math.floor(Math.random() * 10) - 5; // ±5
    data.push(Math.max(0, baseValue + variance));
    baseValue += Math.random() - 0.4; // Slight upward trend
  }
  
  return data;
}

function loadRecentApplications() {
  fetch('/api/admin/applications/?page=1&ordering=-submitted_at')
    .then(response => response.json())
    .then(data => {
      displayRecentApplications(data.results.slice(0, 5));
    })
    .catch(error => console.error('Error loading recent applications:', error));
}

function displayRecentApplications(applications) {
  const tbody = document.getElementById('recent_applications');
  tbody.innerHTML = '';

  if (applications.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td class="px-6 py-4 text-center text-gray-500" colspan="6">
          No applications yet
        </td>
      </tr>
    `;
    return;
  }

  applications.forEach(app => {
    const row = document.createElement('tr');
    row.className = 'border-b hover:bg-gray-50';

    const statusClass = getStatusClass(app.status);
    const submittedDate = new Date(app.submitted_at).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    row.innerHTML = `
      <td class="px-6 py-4 text-sm font-medium text-blue-600">
        <a href="/admin/applications/${app.id}/" class="hover:underline">
          ${app.application_number}
        </a>
      </td>
      <td class="px-6 py-4 text-sm text-gray-900">${app.full_name}</td>
      <td class="px-6 py-4 text-sm text-blue-900 font-semibold">
        ${app.plan.replace('_', ' ').toUpperCase()}
      </td>
      <td class="px-6 py-4 text-sm">
        <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusClass}">
          ${app.status.replace('_', ' ').toUpperCase()}
        </span>
      </td>
      <td class="px-6 py-4 text-sm text-gray-600">${submittedDate}</td>
      <td class="px-6 py-4 text-sm">
        <a href="/admin/applications/${app.id}/" class="text-blue-600 hover:text-blue-800 font-medium">
          View →
        </a>
      </td>
    `;
    
    tbody.appendChild(row);
  });

  console.log('Recent applications displayed');
}

function getStatusClass(status) {
  const classes = {
    'draft': 'bg-gray-100 text-gray-800',
    'submitted': 'bg-blue-100 text-blue-800',
    'under_review': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

function updateLastRefreshTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-MY', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  const updateElement = document.getElementById('update_time');
  if (updateElement) {
    updateElement.textContent = timeString;
  }
}

// Export function for CSV
function exportAnalytics() {
  if (!analyticsData) {
    if (typeof window.showAppNotice === 'function') {
      window.showAppNotice('Data not loaded yet. Please try again.', 'warning');
    } else {
      console.warn('Data not loaded yet. Please try again.');
    }
    return;
  }

  let csv = 'Allianz Shield Plus - Analytics Report\n';
  csv += `Generated: ${new Date().toLocaleString('en-MY')}\n\n`;
  
  csv += 'Key Performance Indicators\n';
  csv += `Total Applications,${analyticsData.total_applications}\n`;
  csv += `Submitted This Week,${analyticsData.submitted_this_week}\n`;
  csv += `Pending Review,${analyticsData.pending_review}\n`;
  csv += `Conversion Rate,${analyticsData.conversion_rate}%\n\n`;
  
  csv += 'Status Breakdown\n';
  csv += 'Status,Count\n';
  Object.entries(analyticsData.status_breakdown).forEach(([status, count]) => {
    csv += `${status},${count}\n`;
  });
  
  csv += '\nPlan Distribution\n';
  csv += 'Plan,Count\n';
  Object.entries(analyticsData.plan_distribution).forEach(([plan, count]) => {
    csv += `${plan},${count}\n`;
  });

  // Create download
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
  element.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.csv`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Manual refresh button
function refreshDashboard() {
  console.log('Manual refresh triggered');
  loadAnalyticsData();
}

// Auto-refresh every 5 minutes
setInterval(refreshAnalyticsData, 300000);

console.log('Dashboard script loaded successfully');
