// Dashboard Analytics and Charts
// Allianz Shield Plus Admin Dashboard

let charts = {};
let analyticsData = null;

function initializeDashboard() {
  console.log('Initializing admin dashboard...');
  loadAnalyticsData();
  setInterval(refreshAnalyticsData, 60000); // Refresh every minute
}

function loadAnalyticsData() {
  fetch('/api/admin/analytics/')
    .then(response => response.json())
    .then(data => {
      analyticsData = data;
      console.log('Analytics data loaded:', data);
      
      // Update KPI cards
      updateKPICards(data);
      
      // Initialize charts
      initializeCharts(data);
      
      // Load recent applications
      loadRecentApplications();
      
      // Update timestamp
      updateLastRefreshTime();
    })
    .catch(error => console.error('Error loading analytics:', error));
}

function refreshAnalyticsData() {
  console.log('Refreshing analytics data...');
  loadAnalyticsData();
}

function updateKPICards(data) {
  // Total Applications
  document.getElementById('kpi_total_applications').textContent = 
    data.total_applications.toLocaleString();

  // Submitted This Week
  document.getElementById('kpi_submitted_week').textContent = 
    data.submitted_this_week;

  // Pending Review
  document.getElementById('kpi_pending_review').textContent = 
    data.pending_review;

  // Approval Rate
  const approvalRate = data.total_applications > 0 
    ? Math.round((data.status_breakdown.approved / data.total_applications) * 100)
    : 0;
  document.getElementById('kpi_approval_rate').textContent = `${approvalRate}%`;

  console.log('KPI cards updated');
}

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

  const planData = data.plan_distribution || {};
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

  const applicantData = data.applicant_distribution || {};
  charts.applicant = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Workers', 'Students'],
      datasets: [{
        data: [
          applicantData.worker || 0,
          applicantData.student || 0
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

  // Generate 30-day trend data
  const labels = getLast30Days();
  const trendData = generateTrendData(labels);

  charts.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Applications Submitted',
        data: trendData,
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
    alert('Data not loaded yet. Please try again.');
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
