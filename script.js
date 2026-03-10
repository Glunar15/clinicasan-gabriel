/**
 * script.js - Versión Conectada a Base de Datos (MySQL)
 * Clínica San Gabriel
 */

const API_URL = 'http://localhost:3000/api';

// Configuración común para Chart.js (asegúrate de incluir el CDN en el HTML)
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 15, font: { size: 11, family: 'Montserrat' } }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    actualizarFechaSuperior();
    
    // Identificar qué página estamos cargando para ejecutar la lógica correspondiente
    if (document.getElementById('patientsTableBody')) cargarPacientes();
    if (document.getElementById('appointmentsTableBody')) cargarCitas();
    if (document.getElementById('medicosTableBody')) cargarMedicos();
    
    // Lógica para el Dashboard si existen los contenedores
    if (document.getElementById('dash-pacientes-reales')) cargarResumenDashboard();

    setInterval(actualizarFechaSuperior, 60000);
});

function actualizarFechaSuperior() {
    const contenedorFecha = document.querySelector('.top-date');
    if (contenedorFecha) {
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let hoy = new Date().toLocaleDateString('es-ES', opciones);
        contenedorFecha.innerText = "📅 " + hoy.charAt(0).toUpperCase() + hoy.slice(1);
    }
}

// ==========================================
// SECCIÓN: PACIENTES (API)
// ==========================================

async function cargarPacientes() {
    try {
        const response = await fetch(`${API_URL}/pacientes`);
        const pacientes = await response.json();
        renderizarTablaPacientes(pacientes);
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
    }
}

function renderizarTablaPacientes(pacientes) {
    const tbody = document.getElementById('patientsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    pacientes.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${p.cedula}</strong></td>
                <td>${p.nombres} ${p.apellidos}</td>
                <td>${p.email}</td>
                <td><span class="blood-badge">${p.grupo_sanguineo}</span></td>
                <td>
                    <button class="btn-action edit" onclick="openEditModal(${p.id})">✏️</button>
                    <button class="btn-action delete" onclick="openDeleteModal(${p.id})">🗑️</button>
                </td>
            </tr>`;
    });
}

async function guardarNuevoPaciente(event) {
    event.preventDefault();
    const nuevoPaciente = {
        cedula: document.getElementById('reg-id').value,
        nombres: document.getElementById('reg-name').value,
        apellidos: document.getElementById('reg-lastname').value,
        email: document.getElementById('reg-email').value,
        grupo_sanguineo: document.getElementById('reg-blood').value
    };

    try {
        const response = await fetch(`${API_URL}/pacientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoPaciente)
        });
        if (response.ok) {
            closeRegisterModal();
            cargarPacientes();
        }
    } catch (error) {
        alert("Error al guardar en el servidor");
    }
}

// ==========================================
// SECCIÓN: CITAS (API)
// ==========================================

async function cargarCitas() {
    try {
        const response = await fetch(`${API_URL}/citas`);
        const citas = await response.json();
        renderizarTablaCitas(citas);
    } catch (error) {
        console.error('Error al cargar citas:', error);
    }
}

function renderizarTablaCitas(citas) {
    const tbody = document.getElementById('appointmentsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    citas.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>${c.paciente_nombre}</td>
                <td>${c.medico_nombre}</td>
                <td>${c.fecha} - ${c.hora}</td>
                <td>${c.tipo}</td>
                <td><span class="status-pill ${c.estado.toLowerCase().replace(' ', '-')}">${c.estado}</span></td>
                <td>
                    <button class="btn-action edit" onclick="openEditApptModal(${c.id})">✏️</button>
                    <button class="btn-action delete" onclick="openDeleteApptModal(${c.id})">🗑️</button>
                </td>
            </tr>`;
    });
}

// ==========================================
// SECCIÓN: MÉDICOS (API)
// ==========================================

async function cargarMedicos() {
    try {
        const response = await fetch(`${API_URL}/medicos`);
        const medicos = await response.json();
        const tbody = document.getElementById('medicosTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        medicos.forEach(m => {
            tbody.innerHTML += `
                <tr>
                    <td>Dr. ${m.apellidos}</td>
                    <td>${m.especialidad}</td>
                    <td><span class="status-indicator ${m.estado.toLowerCase()}">${m.estado}</span></td>
                    <td>
                        <button class="btn-action edit">✏️</button>
                    </td>
                </tr>`;
        });
    } catch (error) {
        console.error('Error al cargar médicos:', error);
    }
}

// ==========================================
// LÓGICA DE MODALES (UI)
// ==========================================

function openRegisterModal() {
    document.getElementById('registerModal').style.display = 'flex';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    const modales = document.querySelectorAll('.modal-overlay');
    modales.forEach(m => {
        if (event.target == m) m.style.display = 'none';
    });
}

// ==========================================
// DASHBOARD Y REPORTES (Chart.js)
// ==========================================

async function cargarResumenDashboard() {
    // Aquí podrías hacer un fetch a una ruta de estadísticas
    // Por ahora, inicializamos los gráficos si los elementos existen
    if (document.getElementById('mainChart')) {
        const ctx = document.getElementById('mainChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
                datasets: [{
                    label: 'Citas Semanales',
                    data: [12, 19, 15, 8, 22],
                    borderColor: '#3b82f6',
                    tension: 0.4
                }]
            },
            options: commonOptions
        });
    }
}
