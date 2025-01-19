
const { createIcons, icons } = lucide;

const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Success is not final, failure is not fatal. - Winston Churchill",
    "The future depends on what you do today. - Mahatma Gandhi",
    "Write it on your heart that every day is the best day in the year. - Ralph Waldo Emerson",
    "Everything you've ever wanted is on the other side of fear. - George Addair"
];

const goalTracker = {
    todos: [],
    completedTodos: [],

    init() {

        this.todoInput = document.getElementById('todo-input');
        this.addButton = document.getElementById('add-todo');
        this.progressFill = document.getElementById('progress-fill');
        this.wordCount = document.getElementById('word-count');
        this.display = document.getElementById('goal-display');

        this.addButton.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.loadTodos();
        this.render();
    },

    loadTodos() {
        const savedTodos = localStorage.getItem('todos');
        const savedCompletedTodos = localStorage.getItem('completedTodos');
        if (savedTodos) this.todos = JSON.parse(savedTodos);
        if (savedCompletedTodos) this.completedTodos = JSON.parse(savedCompletedTodos);
    },

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        localStorage.setItem('completedTodos', JSON.stringify(this.completedTodos));
    },

    addTodo() {
        const text = this.todoInput.value.trim();
        if (text) {
            this.todos.push({
                id: Date.now().toString(),
                text,
                completed: false
            });
            this.todoInput.value = '';
            this.saveTodos();
            this.render();
        }
    },

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.completedTodos.push({...todo, completed: true});
            this.saveTodos();
            this.render();
        }
    },

    deleteTodo(id, isCompleted = false) {
        if (isCompleted) {
            this.completedTodos = this.completedTodos.filter(t => t.id !== id);
        } else {
            this.todos = this.todos.filter(t => t.id !== id);
        }
        this.saveTodos();
        this.render();
    },

    render() {
       
        const total = this.todos.length + this.completedTodos.length;
        const progress = total === 0 ? 0 : (this.completedTodos.length / total) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.wordCount.textContent = `${this.completedTodos.length} / ${total} tasks`;
        this.display.querySelector('.percentage').textContent = `${Math.round(progress)}%`;
        const todoList = document.getElementById('todo-list');
        const completedList = document.getElementById('completed-list');

        todoList.innerHTML = this.todos.map(todo => `
            <li class="todo-item">
                <span>${todo.text}</span>
                <div class="todo-actions">
                    <button onclick="goalTracker.toggleTodo('${todo.id}')" class="icon-button">
                        <i data-lucide="check"></i>
                    </button>
                    <button onclick="goalTracker.deleteTodo('${todo.id}')" class="icon-button">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </li>
        `).join('');

        completedList.innerHTML = this.completedTodos.map(todo => `
            <li class="todo-item completed">
                <span><s>${todo.text}</s></span>
                <button onclick="goalTracker.deleteTodo('${todo.id}', true)" class="icon-button">
                    <i data-lucide="trash-2"></i>
                </button>
            </li>
        `).join('');

        createIcons();
    }
};

const calendar = {
    events: [],

    init() {
        this.addButton = document.getElementById('add-event');
        this.form = document.getElementById('event-form');
        this.list = document.getElementById('events-list');
        this.addButton.addEventListener('click', () => this.toggleForm());
        this.form.addEventListener('submit', (e) => this.addEvent(e));
        this.loadEvents();
        this.render();
    },

    loadEvents() {
        const savedEvents = localStorage.getItem('writing-events');
        if (savedEvents) {
            this.events = JSON.parse(savedEvents);
            this.render();
        }
    },

    saveEvents() {
        localStorage.setItem('writing-events', JSON.stringify(this.events));
    },

    toggleForm() {
        this.form.classList.toggle('hidden');
    },

    addEvent(e) {
        e.preventDefault();
        const event = {
            id: Date.now().toString(),
            title: document.getElementById('event-title').value,
            date: document.getElementById('event-date').value,
            startTime: document.getElementById('event-start').value,
            endTime: document.getElementById('event-end').value
        };
        
        this.events.push(event);
        this.saveEvents();
        this.form.reset();
        this.toggleForm();
        this.render();
    },

    deleteEvent(id) {
        this.events = this.events.filter(event => event.id !== id);
        this.saveEvents();
        this.render();
    },

    render() {
        if (this.events.length === 0) {
            this.list.innerHTML = '<p class="empty-state">No events scheduled</p>';
            return;
        }

        this.list.innerHTML = this.events
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(event => `
                <div class="event-card">
                    <h3>${event.title}</h3>
                    <p>${new Date(event.date).toLocaleDateString()} • ${event.startTime} - ${event.endTime}</p>
                    <button onclick="calendar.deleteEvent('${event.id}')" class="icon-button">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `)
            .join('');
        
        createIcons();
    }
};

const mindMap = {
    nodes: [],
    connecting: null,
    dragging: null,
    offset: { x: 0, y: 0 },

    init() {
        this.canvas = document.getElementById('canvas');
        this.addButton = document.getElementById('add-node');
        
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.addButton.addEventListener('click', () => {
            const rect = this.canvas.getBoundingClientRect();
            this.addNode(rect.width / 2 - 50, rect.height / 2 - 25);
        });

        document.addEventListener('mousemove', (e) => this.handleDrag(e));
        document.addEventListener('mouseup', () => this.stopDragging());

        this.loadNodes();
        this.render();
    },

    loadNodes() {
        const savedNodes = localStorage.getItem('mind-map-nodes');
        if (savedNodes) {
            this.nodes = JSON.parse(savedNodes);
            this.render();
        }
    },

    saveNodes() {
        localStorage.setItem('mind-map-nodes', JSON.stringify(this.nodes));
    },

    handleCanvasClick(e) {
        if (e.target === this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            this.addNode(e.clientX - rect.left - 50, e.clientY - rect.top - 25);
        }
    },

    addNode(x, y) {
        const node = {
            id: Date.now().toString(),
            text: 'New Idea',
            x,
            y,
            connections: []
        };
        
        this.nodes.push(node);
        this.saveNodes();
        this.render();
    },

    startDragging(nodeId, e) {
        this.dragging = nodeId;
        const node = this.nodes.find(n => n.id === nodeId);
        if (node) {
            const rect = e.target.getBoundingClientRect();
            this.offset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    },

    handleDrag(e) {
        if (this.dragging) {
            const node = this.nodes.find(n => n.id === this.dragging);
            if (node) {
                const rect = this.canvas.getBoundingClientRect();
                node.x = e.clientX - rect.left - this.offset.x;
                node.y = e.clientY - rect.top - this.offset.y;
                this.render();
            }
        }
    },

    stopDragging() {
        if (this.dragging) {
            this.saveNodes();
            this.dragging = null;
        }
    },

    startConnection(nodeId) {
        this.connecting = nodeId;
        this.render();
    },

    completeConnection(targetId) {
        if (this.connecting && this.connecting !== targetId) {
            const sourceNode = this.nodes.find(n => n.id === this.connecting);
            if (sourceNode && !sourceNode.connections.includes(targetId)) {
                sourceNode.connections.push(targetId);
                this.saveNodes();
            }
        }
        this.connecting = null;
        this.render();
    },

    deleteNode(nodeId) {
        this.nodes = this.nodes.filter(node => node.id !== nodeId);
        this.nodes.forEach(node => {
            node.connections = node.connections.filter(id => id !== nodeId);
        });
        this.saveNodes();
        this.render();
    },

    updateNodeText(nodeId, text) {
        try {
            const node = this.nodes.find(n => n.id === nodeId);
            if (node) {
                node.text = text;
                this.saveNodes();
            }
        } catch (error) {
            console.error('Failed to update node text:', error);
        }
    },

    render() {
        try {
            if (!this.canvas) return;
            this.canvas.innerHTML = '';

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.pointerEvents = 'none';
            this.canvas.appendChild(svg);

            this.nodes.forEach(node => {
                node.connections.forEach(targetId => {
                    const target = this.nodes.find(n => n.id === targetId);
                    if (target) {
                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.setAttribute('x1', node.x + 50);
                        line.setAttribute('y1', node.y + 25);
                        line.setAttribute('x2', target.x + 50);
                        line.setAttribute('y2', target.y + 25);
                        line.setAttribute('stroke', document.body.classList.contains('dark-mode') ? '#d5ff3f' : '#4f46e5');
                        line.setAttribute('stroke-width', '2');
                        svg.appendChild(line);
                    }
                });
            });

            this.nodes.forEach(node => {
                const nodeEl = document.createElement('div');
                nodeEl.className = 'node';
                nodeEl.style.left = `${node.x}px`;
                nodeEl.style.top = `${node.y}px`;

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'icon-button node-delete';
                deleteBtn.innerHTML = '<i data-lucide="x"></i>';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.deleteNode(node.id);
                };

                const input = document.createElement('input');
                input.value = this.escapeHtml(node.text);
                input.addEventListener('change', (e) => {
                    this.updateNodeText(node.id, e.target.value);
                });

                const startPoint = document.createElement('div');
                startPoint.className = 'connection-point start';
                startPoint.addEventListener('click', () => this.startConnection(node.id));

                if (this.connecting) {
                    const endPoint = document.createElement('div');
                    endPoint.className = 'connection-point end';
                    endPoint.addEventListener('click', () => this.completeConnection(node.id));
                    nodeEl.appendChild(endPoint);
                }

                nodeEl.addEventListener('mousedown', (e) => this.startDragging(node.id, e));
                nodeEl.appendChild(deleteBtn);
                nodeEl.appendChild(input);
                nodeEl.appendChild(startPoint);
                this.canvas.appendChild(nodeEl);
            });

            createIcons();
        } catch (error) {
            console.error('Failed to render mind map:', error);
        }
    },

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};

// Theme Toggle Component
const themeToggle = {
    init() {
        try {
            this.button = document.getElementById('theme-toggle');
            if (!this.button) {
                throw new Error('Theme toggle button not found');
            }
            this.button.addEventListener('click', () => this.toggle());
            if (localStorage.getItem('theme') === 'dark') {
                document.body.classList.add('dark-mode');
                this.updateIcon(true);
            }
        } catch (error) {
            console.error('Failed to initialize theme toggle:', error);
        }
    },

    toggle() {
        try {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            this.updateIcon(isDark);
            
            // Re-render mind map to update connection colors
            mindMap.render();
        } catch (error) {
            console.error('Failed to toggle theme:', error);
        }
    },

    updateIcon(isDark) {
        try {
            if (this.button) {
                this.button.innerHTML = `<i data-lucide="${isDark ? 'moon' : 'sun'}"></i>`;
                createIcons();
            }
        } catch (error) {
            console.error('Failed to update theme icon:', error);
        }
    }
};

// Quote Component

const quoteManager = {
    init() {
        try {
            this.quoteElement = document.getElementById('random-quote');
            if (!this.quoteElement) {
                throw new Error('Quote element not found');
            }
            this.updateQuote();
            setInterval(() => this.updateQuote(),  60 * 1000);
        } catch (error) {
            console.error('Failed to initialize quote manager:', error);
        }
    },

    updateQuote() {
        try {
            if (this.quoteElement && quotes.length > 0) {
                const randomIndex = Math.floor(Math.random() * quotes.length);
                this.quoteElement.textContent = quotes[randomIndex];
            }
        } catch (error) {
            console.error('Failed to update quote:', error);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {

    try {
        createIcons({
            icons: {
                Target: icons.target,
                Edit2: icons.edit2,
                Save: icons.save,
                Plus: icons.plus,
                X: icons.x,
                Calendar: icons.calendar,
                BrainCircuit: icons.brainCircuit,
                Trash2: icons.trash2,
                Check: icons.check,
                Sun: icons.sun,
                Moon: icons.moon,
                Github: icons.github,
                Linkedin: icons.linkedin,
                Twitter: icons.twitter,
                Instagram: icons.instagram
            }
        })

        themeToggle.init();
        goalTracker.init();
        calendar.init();
        mindMap.init();
        quoteManager.init();

    } catch (error) {
        console.error('Failed to initialize application:', error);
    }

});