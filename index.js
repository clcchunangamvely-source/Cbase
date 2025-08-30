let pointsData = {};
let chart = null;

// Navigation
const sideNav = document.getElementById('sideNav');
const overlay = document.getElementById('overlay');
document.querySelector('.nav-toggle').addEventListener('click', toggleNav);
document.querySelector('.close-btn').addEventListener('click', toggleNav);
overlay.addEventListener('click', toggleNav);

// Sort dropdown
document.getElementById('sortSelect').addEventListener('change', updateTable);

// Chart modal
document.querySelector('.nav-item[href="#"]').addEventListener('click', showChart);
document.querySelector('.close-modal').addEventListener('click', closeChart);

// Load points
async function loadPoints() {
    try {
        const response = await fetch('/api/points');
        const data = await response.json();
        pointsData = data.points || data;
        updateTable();
        updateLastUpdated(data.lastUpdated);
    } catch (error) {
        console.error('Error loading points:', error);
    }
}

// Update last updated timestamp
function updateLastUpdated(timestamp) {
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (timestamp) {
        const date = new Date(timestamp);
        const options = { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' };
        lastUpdatedElement.textContent = `Last updated: ${date.toLocaleDateString('en-US', options)}`;
    } else {
        lastUpdatedElement.textContent = 'Last updated: Just now';
    }
}

// Group order & classes
const groupOrder = ['Lourdes', 'Carmel', 'Loretto', 'Morning Star', 'Rosa Mystica'];
const groupClasses = {
    'Lourdes':'8A, 11A',
    'Carmel':'9B, 12B',
    'Loretto':'8B, 10A',
    'Morning Star':'9A, 12A',
    'Rosa Mystica':'10B, 11B'
};

// Update table
function updateTable() {
    const tbody = document.getElementById('tableBody');
    const sortBy = document.getElementById('sortSelect').value;

    let sortedGroups;
    if(sortBy === 'group') {
        sortedGroups = Object.entries(pointsData).sort((a,b)=>a[0].localeCompare(b[0]));
    } else if(sortBy === 'groupNumber') {
        sortedGroups = groupOrder.filter(g=>pointsData[g]).map(g=>[g, pointsData[g]]);
    } else {
        sortedGroups = Object.entries(pointsData).sort((a,b)=>b[1]-a[1]);
    }

    tbody.innerHTML = '';
    sortedGroups.forEach(([group, points], index)=>{
        const rank = sortBy==='group'||sortBy==='groupNumber' ? Object.entries(pointsData).sort((a,b)=>b[1]-a[1]).findIndex(([g])=>g===group)+1 : index+1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="rank-cell"><span class="rank-badge rank-${rank}">${rank}</span></td>
            <td class="group-name clickable-group" onclick="showGroupInfo('${group}')">${group}</td>
            <td class="points-cell"><span class="points-value">${points}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Show group info
function showGroupInfo(groupName) {
    const points = pointsData[groupName];
    const rank = Object.entries(pointsData).sort((a,b)=>b[1]-a[1]).findIndex(([g])=>g===groupName)+1;
    const classes = groupClasses[groupName] || 'Classes not defined';
    alert(`${groupName} - ${classes}`);
}

// Nav toggle
function toggleNav() {
    sideNav.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Chart
function showChart() {
    const modal = document.getElementById('chartModal');
    modal.style.display = 'flex';
    createChart();
    toggleNav();
}

function closeChart() {
    const modal = document.getElementById('chartModal');
    modal.style.display = 'none';
    if(chart) { chart.destroy(); chart=null; }
}

function createChart() {
    const ctx = document.getElementById('pointsChart').getContext('2d');
    const groups = Object.keys(pointsData);
    const points = Object.values(pointsData);

    if(chart) chart.destroy();

    chart = new Chart(ctx, {
        type:'bar',
        data:{
            labels: groups,
            datasets:[{
                label:'Points',
                data: points,
                backgroundColor:['#3ba7ff','#ff5722','#4caf50','#ff9800','#9c27b0'],
                borderColor:'#3ba7ff',
                borderWidth:2,
                borderRadius:8
            }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            plugins:{legend:{display:false}},
            scales:{
                y:{beginAtZero:true, grid:{color:'#ecf0f1'}},
                x:{grid:{display:false}}
            }
        }
    });
}

// Auto-refresh every 30 seconds
setInterval(loadPoints,30000);
document.addEventListener('DOMContentLoaded',loadPoints);
