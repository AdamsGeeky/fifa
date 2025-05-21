// History Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Fetch history data from JSON file
    fetch('data/history.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Store the original data for filtering
            window.historyData = data;
            
            // Populate host filter dropdown
            populateHostFilter(data);
            
            // Display timeline
            displayTimeline(data);
            
            // Create charts
            createContinentChart(data);
            createGoalsChart(data);
            
            // Set up event listeners for filtering and sorting
            setupEventListeners();
        })
        .catch(error => {
            console.error('Error fetching history data:', error);
            document.getElementById('timelineContainer').innerHTML = `
                <div class="text-center py-5">
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Error Loading Data</h4>
                        <p>Sorry, we couldn't load the World Cup history data. Please try again later.</p>
                    </div>
                </div>
            `;
        });
});

// Function to display timeline
function displayTimeline(tournaments) {
    const container = document.getElementById('timelineContainer');
    
    // Clear the container
    container.innerHTML = '';
    
    if (tournaments.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="alert alert-info" role="alert">
                    No tournaments match your search criteria. Try adjusting your filters.
                </div>
            </div>
        `;
        return;
    }
    
    // Create a timeline item for each tournament
    tournaments.forEach(tournament => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        // Format the final score
        const finalScore = tournament.finalScore ? tournament.finalScore : 'N/A';
        
        // Create HTML for the timeline item
        timelineItem.innerHTML = `
            <div class="year-badge">${tournament.year}</div>
            <div class="timeline-content">
                <h3 class="tournament-title">${tournament.name}</h3>
                <div class="host-country">
                    <img src="img/flags/${tournament.hostCountry.code.toLowerCase()}.png" 
                         alt="${tournament.hostCountry.name} flag" class="country-flag">
                    Host: ${tournament.hostCountry.name}
                </div>
                
                <div class="winner-section">
                    <img src="img/flags/${tournament.winner.code.toLowerCase()}.png" 
                         alt="${tournament.winner.name} flag" class="winner-flag">
                    <div class="winner-name">Champion: ${tournament.winner.name}</div>
                    <div class="score">${finalScore}</div>
                </div>
                
                <div class="tournament-stats">
                    <div class="stat-item">
                        <div class="stat-label">Teams</div>
                        <div class="stat-value">${tournament.teams}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Matches</div>
                        <div class="stat-value">${tournament.matches}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Goals</div>
                        <div class="stat-value">${tournament.goals}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Avg Goals</div>
                        <div class="stat-value">${(tournament.goals / tournament.matches).toFixed(2)}</div>
                    </div>
                </div>
                
                <div class="top-scorer">
                    <small>Top Scorer:</small>
                    <div class="scorer-name">${tournament.topScorer.name} (${tournament.topScorer.country}) - ${tournament.topScorer.goals} goals</div>
                </div>
            </div>
        `;
        
        container.appendChild(timelineItem);
    });
}

// Function to populate host filter dropdown
function populateHostFilter(tournaments) {
    const hostFilter = document.getElementById('hostFilter');
    
    // Get unique host countries
    const hostCountries = [...new Set(tournaments.map(tournament => tournament.hostCountry.name))].sort();
    
    // Add options to the dropdown
    hostCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        hostFilter.appendChild(option);
    });
}

// Function to create continent chart
function createContinentChart(tournaments) {
    // Count tournaments by continent
    const continentCounts = {};
    
    tournaments.forEach(tournament => {
        const continent = tournament.hostCountry.continent;
        continentCounts[continent] = (continentCounts[continent] || 0) + 1;
    });
    
    // Prepare data for chart
    const labels = Object.keys(continentCounts);
    const data = Object.values(continentCounts);
    
    // Define colors for each continent
    const continentColors = {
        'Europe': '#0033A0',
        'South America': '#009c3b',
        'North America': '#B31942',
        'Asia': '#FF0000',
        'Africa': '#008000',
        'Oceania': '#00008B'
    };
    
    const backgroundColors = labels.map(continent => continentColors[continent] || '#0033A0');
    
    // Create chart
    const ctx = document.getElementById('continentChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: 'white',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Function to create goals chart
function createGoalsChart(tournaments) {
    // Sort tournaments by year
    const sortedTournaments = [...tournaments].sort((a, b) => a.year - b.year);
    
    // Prepare data for chart
    const labels = sortedTournaments.map(tournament => tournament.year);
    const goalsData = sortedTournaments.map(tournament => tournament.goals);
    const avgGoalsData = sortedTournaments.map(tournament => (tournament.goals / tournament.matches).toFixed(2));
    
    // Create chart
    const ctx = document.getElementById('goalsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Goals',
                    data: goalsData,
                    backgroundColor: 'rgba(0, 51, 160, 0.2)',
                    borderColor: 'rgba(0, 51, 160, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: 'Avg Goals per Match',
                    data: avgGoalsData,
                    backgroundColor: 'rgba(255, 204, 0, 0.2)',
                    borderColor: 'rgba(255, 204, 0, 1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    usePointStyle: true
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Total Goals'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Avg Goals per Match'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Function to set up event listeners
function setupEventListeners() {
    // Host filter change event
    document.getElementById('hostFilter').addEventListener('change', filterAndSortTournaments);
    
    // Sort by change event
    document.getElementById('sortBy').addEventListener('change', filterAndSortTournaments);
    
    // Search button click event
    document.getElementById('searchButton').addEventListener('click', filterAndSortTournaments);
    
    // Search input enter key event
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterAndSortTournaments();
        }
    });
}

// Function to filter and sort tournaments
function filterAndSortTournaments() {
    const hostFilter = document.getElementById('hostFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    
    // Filter tournaments
    let filteredTournaments = window.historyData.filter(tournament => {
        // Apply host filter
        if (hostFilter && tournament.hostCountry.name !== hostFilter) {
            return false;
        }
        
        // Apply search filter
        if (searchInput && 
            !tournament.name.toLowerCase().includes(searchInput) && 
            !tournament.year.toString().includes(searchInput) &&
            !tournament.hostCountry.name.toLowerCase().includes(searchInput) &&
            !tournament.winner.name.toLowerCase().