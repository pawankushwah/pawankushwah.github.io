// State Management
const STORAGE_KEY = 'maang-tracker-data';
let rolesData = [];

// DOM Elements
const columns = {
    found: document.getElementById('col-found'),
    referral: document.getElementById('col-referral'),
    applied: document.getElementById('col-applied'),
    interviewing: document.getElementById('col-interviewing'),
    rejected: document.getElementById('col-rejected')
};

const counts = {
    found: document.getElementById('count-found'),
    referral: document.getElementById('count-referral'),
    applied: document.getElementById('count-applied'),
    interviewing: document.getElementById('count-interviewing'),
    rejected: document.getElementById('count-rejected')
};

const funnelContainer = document.getElementById('funnelContainer');
const modal = document.getElementById('addRoleModal');
const addRoleBtn = document.getElementById('addRoleBtn');
const closeBtn = document.querySelector('.close-btn');
const closeModalBtn = document.querySelector('.close-modal-btn');
const addRoleForm = document.getElementById('addRoleForm');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');

// Initialize
function init() {
    loadData();
    renderBoard();
    renderFunnel();
    setupEventListeners();
}

// Data Functions
function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        rolesData = JSON.parse(data);
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rolesData));
    renderFunnel();
    updateCounts();
}

function addRole(company, title, link) {
    const newRole = {
        id: Date.now().toString(),
        company,
        title,
        link,
        status: 'found' // Default status
    };
    rolesData.push(newRole);
    saveData();
    renderBoard();
}

function deleteRole(id) {
    rolesData = rolesData.filter(role => role.id !== id);
    saveData();
    renderBoard();
}

function updateRoleStatus(id, newStatus) {
    const role = rolesData.find(r => r.id === id);
    if (role) {
        role.status = newStatus;
        saveData();
    }
}

// Rendering
function renderBoard() {
    // Clear all columns
    Object.values(columns).forEach(col => col.innerHTML = '');

    // Render cards
    rolesData.forEach(role => {
        const card = createCardElement(role);
        if (columns[role.status]) {
            columns[role.status].appendChild(card);
        }
    });

    updateCounts();
}

function updateCounts() {
    const statusCounts = { found: 0, referral: 0, applied: 0, interviewing: 0, rejected: 0 };
    rolesData.forEach(role => {
        if (statusCounts[role.status] !== undefined) {
            statusCounts[role.status]++;
        }
    });

    Object.keys(counts).forEach(status => {
        counts[status].textContent = statusCounts[status];
    });
}

function createCardElement(role) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.draggable = true;
    card.dataset.id = role.id;

    let linkHtml = '';
    if (role.link) {
        linkHtml = `
            <a href="${role.link}" target="_blank" class="card-link" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                Job Link
            </a>
        `;
    }

    card.innerHTML = `
        <button class="card-delete" onclick="deleteRole('${role.id}')">&times;</button>
        <div class="card-company">${role.company}</div>
        <div class="card-role">${role.title}</div>
        ${linkHtml}
    `;

    // Drag events
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    return card;
}

function renderFunnel() {
    const statusCounts = { found: 0, referral: 0, applied: 0, interviewing: 0, rejected: 0 };
    rolesData.forEach(role => {
        if (statusCounts[role.status] !== undefined) {
            statusCounts[role.status]++;
        }
    });

    // Funnel stages config
    const stages = [
        { id: 'found', label: 'Roles Found', count: statusCounts.found },
        { id: 'referral', label: 'Referral Req.', count: statusCounts.referral },
        { id: 'applied', label: 'Applied', count: statusCounts.applied },
        { id: 'interviewing', label: 'Interviewing', count: statusCounts.interviewing }
    ];

    funnelContainer.innerHTML = stages.map(stage => `
        <div class="funnel-item" data-stage="${stage.id}">
            <div class="funnel-count">${stage.count}</div>
            <div class="funnel-label">${stage.label}</div>
        </div>
    `).join('');
}

// Drag and Drop Handlers
let draggedCardId = null;

function handleDragStart(e) {
    draggedCardId = this.dataset.id;
    this.classList.add('dragging');
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedCardId = null;
}

// Event Listeners Setup
function setupEventListeners() {
    // Column drop zones
    document.querySelectorAll('.kanban-column').forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault(); // Necessary to allow dropping
            column.classList.add('drag-over');
        });

        column.addEventListener('dragleave', e => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', e => {
            e.preventDefault();
            column.classList.remove('drag-over');
            const newStatus = column.dataset.column;
            if (draggedCardId && newStatus) {
                updateRoleStatus(draggedCardId, newStatus);
                renderBoard();
            }
        });
    });

    // Modal
    addRoleBtn.addEventListener('click', () => modal.classList.add('active'));
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
    
    // Close modal on outside click
    modal.addEventListener('click', e => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Form Submit
    addRoleForm.addEventListener('submit', e => {
        e.preventDefault();
        const company = document.getElementById('companyName').value;
        const title = document.getElementById('roleTitle').value;
        const link = document.getElementById('roleLink').value;
        
        addRole(company, title, link);
        
        addRoleForm.reset();
        modal.classList.remove('active');
    });

    // Export/Import
    exportBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rolesData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "maang_roles_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    importBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    rolesData = importedData;
                    saveData();
                    renderBoard();
                    alert("Data imported successfully!");
                } else {
                    alert("Invalid JSON format.");
                }
            } catch (err) {
                alert("Error parsing JSON file.");
            }
        };
        reader.readAsText(file);
        fileInput.value = ""; // Reset input
    });
}

// Start app
document.addEventListener('DOMContentLoaded', init);
