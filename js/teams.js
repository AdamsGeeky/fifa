// Teams Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Fetch teams data from JSON file
    fetch('data/teams.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Store the original data for filtering
            window.teamsData = data;
            
            // Populate continent filter dropdown
            populateContinentFilter(data);
            
            // Display all teams initially
            displayTeams(data);
            
            // Create the World Cup winners chart
            createWorldCupWinnersChart(data);
            
            // Set up event listeners for filtering and sorting
            setupEventListeners();
        })
        .catch(error => {
            console.error('Error fetching teams data:', error);
            document.getElementById('teamsContainer').innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Error Loading Data</h4>
                        <p>Sorry, we couldn't load the teams data. Please try again later.</p>
                    </div>
                </div>
            `;
        });
});

// Function to display teams as cards
function displayTeams(teams) {
    const container = document.getElementById('teamsContainer');
    
    // Clear the container
    container.innerHTML = '';
    
    if (teams.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-info" role="alert">
                    No teams match your search criteria. Try adjusting your filters.
                </div>
            </div>
        `;
        return;
    }
    
    // Create a card for each team
    teams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'col-md-6 col-lg-4 mb-4';
        
        // Create trophy icons based on number of titles
        let trophyIcons = '';
        for (let i = 0; i < team.titles; i++) {
            trophyIcons += '<img src="img/trophy-icon.png" alt="Trophy" class="trophy-icon me-1">';
        }
        
        // If no titles, show a message
        if (team.titles === 0) {
            trophyIcons = '<span class="text-muted">No World Cup titles yet</span>';
        }
        
        teamCard.innerHTML = `
            <div class="card team-card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>
                        <img src="img/flags/${team.code.toLowerCase()}.png" 
                             alt="${team.name} flag" class="country-flag">
                        ${team.name}
                    </span>
                    <span class="badge bg-secondary">${team.continent}</span>
                </div>
                <div class="team-img-container">
                    <img src="${team.image || `img/teams/${team.code.toLowerCase()}.jpg`}" 
                         alt="${team.name}" class="team-img">
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-6">
                            <div class="stat-badge rounded-pill px-2 py-1 mb-1">Titles</div>
                            <div class="stat-value">${team.titles}</div>
                        </div>
                        <div class="col-6">
                            <div class="stat-badge rounded-pill px-2 py-1 mb-1">Appearances</div>
                            <div class="stat-value">${team.appearances}</div>
                        </div>
                    </div>
                    <div class="trophy-container text-center">
                        ${trophyIcons}
                    </div>
                </div>
                <div class="card-footer bg-white">
                    <p class="card-text small text-muted mb-0">
                        Best Result: ${team.bestResult}
                    </p>
                </div>
            </div>
        `;
        container.appendChild(teamCard);
    });
}

// Function to populate continent filter dropdown
function populateContinentFilter(teams) {
    const continentFilter = document.getElementById('continentFilter');
    
    // Get unique continents
    const continents = [...new Set(teams.map(team => team.continent))].sort();
    
    // Add options to the dropdown
    continents.forEach(continent => {
        const option = document.createElement('option');
        option.value = continent;
        option.textContent = continent;
        continentFilter.appendChild(option);
    });
}

// Function to create World Cup winners chart
function createWorldCupWinnersChart(teams) {
    // Filter teams with at least one title
    const winnersData = teams.filter(team => team.titles > 0)
                            .sort((a, b) => b.titles - a.titles);
    
    // Prepare data for chart
    const labels = winnersData.map(team => team.name);
    const data = winnersData.map(team => team.titles);
    const backgroundColors = winnersData.map(team => getTeamColor(team.code));
    
    // Create chart
    const ctx = document.getElementById('worldCupWinnersChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'World Cup Titles',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => darkenColor(color, 20)),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const team = winnersData[context.dataIndex];
                            return `Years: ${team.titleYears.join(', ')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    title: {
                        display: true,
                        text: 'Number of Titles'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Countries'
                    }
                }
            }
        }
    });
}

// Function to get team color based on country code
function getTeamColor(code) {
    // Map of country codes to colors (simplified)
    const colorMap = {
        'BRA': '#009c3b', // Brazil - Green
        'GER': '#000000', // Germany - Black
        'ITA': '#008C45', // Italy - Green
        'ARG': '#75AADB', // Argentina - Light Blue
        'FRA': '#002654', // France - Blue
        'URU': '#0038a8', // Uruguay - Blue
        'ESP': '#AA151B', // Spain - Red
        'ENG': '#CF081F'  // England - Red
    };
    
    return colorMap[code] || '#0033A0'; // Default to FIFA blue
}

// Function to darken a color (for border)
function darkenColor(hex, percent) {
    // Convert hex to RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    
    // Darken
    r = Math.floor(r * (100 - percent) / 100);
    g = Math.floor(g * (100 - percent) / 100);
    b = Math.floor(b * (100 - percent) / 100);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Function to set up event listeners
function setupEventListeners() {
    // Continent filter change event
    document.getElementById('continentFilter').addEventListener('change', filterAndSortTeams);
    
    // Sort by change event
    document.getElementById('sortBy').addEventListener('change', filterAndSortTeams);
    
    // Search button click event
    document.getElementById('searchButton').addEventListener('click', filterAndSortTeams);
    
    // Search input enter key event
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterAndSortTeams();
        }
    });
}

// Function to filter and sort teams
function filterAndSortTeams() {
    const continentFilter = document.getElementById('continentFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    
    // Filter teams
    let filteredTeams = window.teamsData.filter(team => {
        // Apply continent filter
        if (continentFilter && team.continent !== continentFilter) {
            return false;
        }
        
        // Apply search filter
        if (searchInput && !team.name.toLowerCase().includes(searchInput)) {
            return false;
        }
        
        return true;
    });
    
    // Sort teams
    if (sortBy === 'name') {
        filteredTeams.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'appearances') {
        filteredTeams.sort((a, b) => b.appearances - a.appearances);
    } else {
        // Default: sort by titles
        filteredTeams.sort((a, b) => {
            // First by titles
            if (b.titles !== a.titles) {
                return b.titles - a.titles;
            }
            // Then by name if titles are equal
            return a.name.localeCompare(b.name);
        });
    }
    
    // Display filtered and sorted teams
    displayTeams(filteredTeams);
}