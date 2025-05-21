// Players Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Fetch players data from JSON file
    fetch('data/players.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Store the original data for filtering
            window.playersData = data;
            
            // Populate country filter dropdown
            populateCountryFilter(data);
            
            // Display all players initially
            displayPlayers(data);
            
            // Set up event listeners for filtering and sorting
            setupEventListeners();
        })
        .catch(error => {
            console.error('Error fetching players data:', error);
            document.getElementById('playersContainer').innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Error Loading Data</h4>
                        <p>Sorry, we couldn't load the players data. Please try again later.</p>
                    </div>
                </div>
            `;
        });
});

// Function to display players as cards
function displayPlayers(players) {
    const container = document.getElementById('playersContainer');
    
    // Clear the container
    container.innerHTML = '';
    
    if (players.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-info" role="alert">
                    No players match your search criteria. Try adjusting your filters.
                </div>
            </div>
        `;
        return;
    }
    
    // Create a card for each player
    players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'col-md-6 col-lg-4 mb-4';
        playerCard.innerHTML = `
            <div class="card player-card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>
                        <img src="img/flags/${player.country.toLowerCase().replace(/\s+/g, '-')}.png" 
                             alt="${player.country} flag" class="country-flag">
                        ${player.country}
                    </span>
                    <span class="badge bg-secondary">${player.position}</span>
                </div>
                <div class="player-img-container">
                    <img src="${player.image || `img/players/${player.id}.jpg`}" 
                         alt="${player.name}" class="player-img">
                </div>
                <div class="card-body">
                    <h5 class="card-title text-center mb-3">${player.name}</h5>
                    <div class="row text-center">
                        <div class="col-4">
                            <div class="stat-badge rounded-pill px-2 py-1 mb-1">Goals</div>
                            <div class="stat-value">${player.goals}</div>
                        </div>
                        <div class="col-4">
                            <div class="stat-badge rounded-pill px-2 py-1 mb-1">Assists</div>
                            <div class="stat-value">${player.assists}</div>
                        </div>
                        <div class="col-4">
                            <div class="stat-badge rounded-pill px-2 py-1 mb-1">Matches</div>
                            <div class="stat-value">${player.matches}</div>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-white">
                    <p class="card-text small text-muted mb-0">
                        World Cups: ${player.worldCups.join(', ')}
                    </p>
                </div>
            </div>
        `;
        container.appendChild(playerCard);
    });
}

// Function to populate country filter dropdown
function populateCountryFilter(players) {
    const countryFilter = document.getElementById('countryFilter');
    
    // Get unique countries
    const countries = [...new Set(players.map(player => player.country))].sort();
    
    // Add options to the dropdown
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

// Function to set up event listeners
function setupEventListeners() {
    // Country filter change event
    document.getElementById('countryFilter').addEventListener('change', filterAndSortPlayers);
    
    // Sort by change event
    document.getElementById('sortBy').addEventListener('change', filterAndSortPlayers);
    
    // Search button click event
    document.getElementById('searchButton').addEventListener('click', filterAndSortPlayers);
    
    // Search input enter key event
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterAndSortPlayers();
        }
    });
}

// Function to filter and sort players
function filterAndSortPlayers() {
    const countryFilter = document.getElementById('countryFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    
    // Filter players
    let filteredPlayers = window.playersData.filter(player => {
        // Apply country filter
        if (countryFilter && player.country !== countryFilter) {
            return false;
        }
        
        // Apply search filter
        if (searchInput && !player.name.toLowerCase().includes(searchInput) && 
            !player.country.toLowerCase().includes(searchInput)) {
            return false;
        }
        
        return true;
    });
    
    // Sort players
    filteredPlayers.sort((a, b) => b[sortBy] - a[sortBy]);
    
    // Display filtered and sorted players
    displayPlayers(filteredPlayers);
}