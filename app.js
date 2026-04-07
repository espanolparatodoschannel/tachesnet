const structuredBlocks = [
    { title: "Clinique & Étages", color: "grey", tasksRaw: [
        "RC,Plancher et les tapis de la clinique RC.",
        "2,Plancher de la clinique - Sall d'eau",
        "3,Plancher de la clinique",
        "4,Plancher de la clinique",
        "5,Plancher de la clinique"
    ]},
    { title: "Hôtel Escad & SS", color: "blue", tasksRaw: [
        "RC,Plancher et les tapis",
        "RC,Plancher et les tapis au Hotêl Escad",
        "SS1,Plancher (seulement faire les contours avec la moppe). - Sall d'eau",
        "SS2,Plancher"
    ]},
    { title: "Sous-sol & Lavabo", color: "red", tasksRaw: [
        "SS2,Plancher",
        "SS1,Plancher",
        "RC,Plancher et les tapis - Sall d'eau"
    ]},
    { title: "Corridors & Zamboni", color: "yellow", tasksRaw: [
        "SS2,Plancher",
        "SS1,Plancher",
        "RC,Plancher et les tapis (faire los dos corridors). - Sall d'eau",
        "2,Plancher (seulement faire los contours). - Sall d'eau",
        "2,Plancher (zamboni au jaune RC).",
        "RC,Nettoyer et ranger la zamboni"
    ]},
    { title: "Siam", color: "orange", tasksRaw: [
        "SS2,Plancher Siam",
        "SS1,Plancher Siam",
        "RC,Plancher Siam ",
        "2,Plancher Siam - Sall d'eau"
    ]},
    { title: "Sporting Life", color: "pink", tasksRaw: [
        "SS2,Plancher Sporting Life",
        "SS1,Plancher Sporting Life",
        "RC,Plancher et les tapis Sporting Life"
    ]},
    { title: "Huston", color: "orange", tasksRaw: [
        "SS2,Plancher Huston",
        "SS1,Plancher Huston ",
        "RC,Plancher et les tapis Huston"
    ]},
    { title: "Jean-Coutu", color: "pink", tasksRaw: [
        "SS2,Plancher Jean-Coutu",
        "SS1,Plancher Jean-Coutu",
        "RC,Plancher et les tapis Jean-Coutu"
    ]},
    { title: "Huston (Sall d'eau)", color: "grey", tasksRaw: [
        "RC,Plancher et les tapis du Huston. - Sall d'eau"
    ]},
    { title: "Zamboni & Apple", color: "blue", tasksRaw: [
        "RC,Nettoyer et ranger la zamboni - Sall d'eau",
        "RC,Plancher corridor (Apple et Pottery Barn) - Sall d'eau"
    ]}
];

const tasksListEl = document.getElementById('tasksList');
const progressBarEl = document.getElementById('progressBar');
const progressTextEl = document.getElementById('progressText');
const resetBtn = document.getElementById('resetBtn');

let blocksData = [];

// Iconos SVG
const waterIcon = `<span class="icon-water"><svg viewBox="0 0 24 24"><path d="M12,2.1L12.18,2.26L19,8.5C20.6,10.05 21.5,12.15 21.5,14.5A9.5,9.5 0 0,1 12,24A9.5,9.5 0 0,1 2.5,14.5C2.5,12.15 3.4,10.05 5,8.5L11.82,2.26L12,2.1M12,4.81L7.07,9.27C5.82,10.4 5.12,11.96 5.12,13.62C5.12,17.41 8.21,20.5 12,20.5C15.79,20.5 18.88,17.41 18.88,13.62C18.88,11.96 18.18,10.4 16.93,9.27L12,4.81Z" /></svg></span>`;
const dragIcon = `<svg class="drag-handle" viewBox="0 0 24 24"><path d="M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z" /></svg>`;

function initData() {
    const saved = localStorage.getItem('building_tasks_blocks');
    
    if (saved) {
        blocksData = JSON.parse(saved);
    } else {
        blocksData = structuredBlocks.map((block, bIndex) => ({
            ...block,
            uniqueId: `block-${Date.now()}-${bIndex}`,
            id: bIndex,
            isOpen: bIndex === 0,
            tasks: block.tasksRaw.map((raw, tIndex) => {
                const firstComma = raw.indexOf(',');
                return {
                    id: `${bIndex}-${tIndex}`,
                    floor: raw.substring(0, firstComma).trim(),
                    text: raw.substring(firstComma + 1).trim(),
                    completed: false
                };
            })
        }));
        saveToLocal();
    }
    
    renderApp();
    initSortable();
    updateProgress();
}

function saveToLocal() {
    localStorage.setItem('building_tasks_blocks', JSON.stringify(blocksData));
}

function renderApp() {
    tasksListEl.innerHTML = '';
    
    blocksData.forEach(block => {
        const groupDiv = document.createElement('div');
        groupDiv.className = `task-group ${block.isOpen ? 'open' : ''}`;
        groupDiv.setAttribute('data-id', block.uniqueId || block.id);
        
        const header = document.createElement('div');
        header.className = `group-header group-${block.color}`;
        
        const completedInBlock = block.tasks.filter(t => t.completed).length;
        
        header.innerHTML = `
            <div class="header-left">
                ${dragIcon}
                <span onclick="toggleGroup('${block.uniqueId || block.id}')">${block.title} (${completedInBlock}/${block.tasks.length})</span>
            </div>
            <svg class="chevron" onclick="toggleGroup('${block.uniqueId || block.id}')" viewBox="0 0 24 24"><path d="M7,10L12,15L17,10H7Z" /></svg>
        `;
        
        const content = document.createElement('div');
        content.className = 'group-content';
        
        block.tasks.forEach(task => {
            const item = document.createElement('div');
            item.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            const hasWater = task.text.toLowerCase().includes("sall d'eau");
            
            item.innerHTML = `
                <div class="check-btn" onclick="toggleTask('${task.id}')">
                    <i></i>
                </div>
                <div class="task-info">
                    <div class="task-text">
                        <strong>${task.floor}:</strong> ${task.text} 
                        ${hasWater ? waterIcon : ''}
                    </div>
                </div>
            `;
            content.appendChild(item);
        });
        
        groupDiv.appendChild(header);
        groupDiv.appendChild(content);
        tasksListEl.appendChild(groupDiv);
    });
}

function initSortable() {
    Sortable.create(tasksListEl, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: function() {
            const newOrder = Array.from(tasksListEl.children).map(child => child.getAttribute('data-id'));
            const reorderedData = [];
            newOrder.forEach(id => {
                const found = blocksData.find(b => (b.uniqueId || b.id).toString() === id.toString());
                if (found) reorderedData.push(found);
            });
            blocksData = reorderedData;
            saveToLocal();
        }
    });
}

window.toggleGroup = function(blockId) {
    const block = blocksData.find(b => (b.uniqueId || b.id).toString() === blockId.toString());
    if (block) {
        block.isOpen = !block.isOpen;
        renderApp();
    }
}

window.toggleTask = function(taskId) {
    blocksData.forEach(block => {
        const task = block.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
        }
    });
    saveToLocal();
    renderApp();
    updateProgress();
}

function updateProgress() {
    let completed = 0;
    let total = 0;
    blocksData.forEach(block => {
        total += block.tasks.length;
        completed += block.tasks.filter(t => t.completed).length;
    });
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    progressBarEl.style.width = `${percentage}%`;
    progressTextEl.innerText = `${percentage}% completado (${completed}/${total})`;
}

resetBtn.onclick = () => {
    if (confirm('¿Reiniciar todo el progreso?')) {
        blocksData.forEach(block => {
            block.tasks.forEach(t => t.completed = false);
        });
        saveToLocal();
        renderApp();
        updateProgress();
    }
};

initData();
