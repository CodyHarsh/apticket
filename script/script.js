(function(){
  emailjs.init('QxYrAClmmtfof8yPp');
})();


// Initialize data in localStorage when the page loads
function initializeLocalStorage() {
  if (!localStorage.getItem('tickets')) {
    fetch("database/tickets.json")
      .then(response => response.json())
      .then(data => {
        localStorage.setItem('tickets', JSON.stringify(data.tickets));
      })
      .catch(error => console.error("Error initializing tickets:", error));
  }

  if (!localStorage.getItem('assignees')) {
    fetch("database/assignees.json")
      .then(response => response.json())
      .then(data => {
        localStorage.setItem('assignees', JSON.stringify(data.assignees));
      })
      .catch(error => console.error("Error initializing assignees:", error));
  }
}

function showContent(contentId, menuItem) {
  const contents = document.querySelectorAll('.content');
  contents.forEach(content => content.classList.remove('active'));

  const menuItems = document.querySelectorAll('.side-menu a');
  menuItems.forEach(item => item.classList.remove('active'));
  menuItem.classList.add('active');

  const contentElement = document.getElementById(contentId);

  if (contentId === "all-tickets") {
    loadTicketsTable();
  } else if (contentId === "assigned-tickets") {
    loadAssignedTickets();
  } else if (contentId === "pending-tickets") {
    loadPendingTickets();
  }

  contentElement.classList.add('active');
}

function loadTicketsTable() {
  fetchFromLocalStorageAndRender();
}

function loadAssignedTickets() {
  fetchFromLocalStorageAndRender(ticket => ticket.priority === "None", "assignedTicketsTable");
}

function loadPendingTickets() {
  fetchFromLocalStorageAndRender(ticket => ticket.priority === "Pending", "pendingTicketsTable");
}

function updateTicketData(ticketTitle, field, value) {
  const tickets = JSON.parse(localStorage.getItem('tickets'));
  const ticketIndex = tickets.findIndex(ticket => ticket.title === ticketTitle);
  
  if (ticketIndex !== -1) {
    tickets[ticketIndex][field] = value;
    localStorage.setItem('tickets', JSON.stringify(tickets));
    
    // If the ticket is resolved, send an email to the customer
    if (field === 'priority' && value === 'Resolve') {
      const ticket = tickets[ticketIndex];
      sendEmailToCustomer(ticket);
    }
    
    // Refresh the current view
    const currentActiveTab = document.querySelector('.content.active').id;
    const currentMenuItem = document.querySelector('.side-menu a.active');
    showContent(currentActiveTab, currentMenuItem);
    
    console.log('Ticket updated successfully');
  } else {
    console.error('Ticket not found');
  }
}


function fetchFromLocalStorageAndRender(filterFunction = null, tableId = "ticketsTable") {
  const ticketsTableBody = document.querySelector(`#${tableId} tbody`);
  if (!ticketsTableBody) {
    console.error(`Table body not found for table with id: ${tableId}`);
    return;
  }
  
  ticketsTableBody.innerHTML = "";

  const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
  const assignees = JSON.parse(localStorage.getItem('assignees') || '[]');

  console.log("All tickets:", tickets);
  let filteredTickets = filterFunction ? tickets.filter(filterFunction) : tickets;
  console.log("Filtered tickets:", filteredTickets);

  renderTable(filteredTickets, assignees, tableId);
  addSelectEventListeners(tableId);
}

function addSelectEventListeners(tableId) {
  const table = document.getElementById(tableId);
  
  // Add event listeners for assignee select elements
  table.querySelectorAll('.assignee-select').forEach(select => {
    select.addEventListener('change', (event) => {
      const ticketTitle = event.target.getAttribute('data-ticket-title');
      const newAssigneeId = parseInt(event.target.value);
      updateTicketData(ticketTitle, 'assignee', newAssigneeId);
    });
  });

  // Add event listeners for priority select elements
  table.querySelectorAll('.priority-select').forEach(select => {
    select.addEventListener('change', (event) => {
      const ticketTitle = event.target.getAttribute('data-ticket-title');
      const newPriority = event.target.value;
      updateTicketData(ticketTitle, 'priority', newPriority);
    });
  });
}



// Initialize localStorage and set up event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
  initializeLocalStorage();
  const dashboardLink = document.getElementById('menu-dashboard');
  showContent('dashboard', dashboardLink);
});


function searchTickets(searchBoxId, tableId) {
  const searchQuery = document.getElementById(searchBoxId).value.toLowerCase();
  const table = document.getElementById(tableId);
  const rows = table.querySelectorAll('tbody tr');

  rows.forEach(row => {
    const rowText = row.innerText.toLowerCase();
    if (rowText.includes(searchQuery)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}


function deleteTicket(ticketTitle, tableId) {
  let tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  tickets = tickets.filter(ticket => ticket.title !== ticketTitle);
  localStorage.setItem('tickets', JSON.stringify(tickets));

  fetchFromLocalStorageAndRender(null, tableId);
}

function addDeleteEventListeners(tableId) {
  const table = document.getElementById(tableId);
  table.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const ticketTitle = event.target.getAttribute('data-ticket-title');
      if (confirm(`Are you sure you want to delete the ticket: ${ticketTitle}?`)) {
        deleteTicket(ticketTitle, tableId);
      }
    });
  });
}


function filterByPriority(tableId) {
  const priority = document.getElementById('priorityFilter').value; // Get selected priority
  const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
  const assignees = JSON.parse(localStorage.getItem('assignees') || '[]');

  // Filter tickets by the selected priority
  const filteredTickets = priority
    ? tickets.filter(ticket => ticket.priority === priority)
    : tickets; // Show all tickets if no priority is selected

  renderTable(filteredTickets, assignees, tableId);
  addSelectEventListeners(tableId);
}


// Update the dashboard ticket counts
function updateDashboardCounts() {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(ticket => ticket.priority === "Pending").length;
  const resolvedTickets = tickets.filter(ticket => ticket.priority === "None").length;


  console.log(resolvedTickets)
  // Update the dashboard
  document.getElementById('totalTicketsCount').textContent = totalTickets;
  document.getElementById('pendingTicketsCount').textContent = pendingTickets;
  document.getElementById('assignedTicketsCount').textContent = resolvedTickets;
}

// Initialize localStorage and update counts on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeLocalStorage();
  updateDashboardCounts(); // Update the ticket counts
  const dashboardLink = document.getElementById('menu-dashboard');
  showContent('dashboard', dashboardLink);
});// Initialize data in localStorage when the page loads
function initializeLocalStorage() {
  if (!localStorage.getItem('tickets')) {
    fetch("database/tickets.json")
      .then(response => response.json())
      .then(data => {
        localStorage.setItem('tickets', JSON.stringify(data.tickets));
      })
      .catch(error => console.error("Error initializing tickets:", error));
  }

  if (!localStorage.getItem('assignees')) {
    fetch("database/assignees.json")
      .then(response => response.json())
      .then(data => {
        localStorage.setItem('assignees', JSON.stringify(data.assignees));
      })
      .catch(error => console.error("Error initializing assignees:", error));
  }
}

function showContent(contentId, menuItem) {
  const contents = document.querySelectorAll('.content');
  contents.forEach(content => content.classList.remove('active'));

  const menuItems = document.querySelectorAll('.side-menu a');
  menuItems.forEach(item => item.classList.remove('active'));
  menuItem.classList.add('active');

  const contentElement = document.getElementById(contentId);

  if (contentId === "all-tickets") {
    loadTicketsTable();
  } else if (contentId === "assigned-tickets") {
    loadAssignedTickets();
  } else if (contentId === "pending-tickets") {
    loadPendingTickets();
  }

  contentElement.classList.add('active');
}

function loadTicketsTable() {
  fetchFromLocalStorageAndRender();
}

function loadAssignedTickets() {
  fetchFromLocalStorageAndRender(ticket => ticket.priority === "None", "assignedTicketsTable");
}

function loadPendingTickets() {
  fetchFromLocalStorageAndRender(ticket => ticket.priority === "Pending", "pendingTicketsTable");
}

function updateTicketData(ticketTitle, field, value) {
  const tickets = JSON.parse(localStorage.getItem('tickets'));
  const ticketIndex = tickets.findIndex(ticket => ticket.title === ticketTitle);
  
  if (ticketIndex !== -1) {
    tickets[ticketIndex][field] = value;
    localStorage.setItem('tickets', JSON.stringify(tickets));
    
    // Refresh the current view
    const currentActiveTab = document.querySelector('.content.active').id;
    const currentMenuItem = document.querySelector('.side-menu a.active');
    showContent(currentActiveTab, currentMenuItem);
    
    console.log('Ticket updated successfully');
  } else {
    console.error('Ticket not found');
  }
}

function fetchFromLocalStorageAndRender(filterFunction = null, tableId = "ticketsTable") {
  const ticketsTableBody = document.querySelector(`#${tableId} tbody`);
  if (!ticketsTableBody) {
    console.error(`Table body not found for table with id: ${tableId}`);
    return;
  }
  
  ticketsTableBody.innerHTML = "";

  const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
  const assignees = JSON.parse(localStorage.getItem('assignees') || '[]');

  console.log("All tickets:", tickets);
  let filteredTickets = filterFunction ? tickets.filter(filterFunction) : tickets;
  console.log("Filtered tickets:", filteredTickets);

  renderTable(filteredTickets, assignees, tableId);
  addSelectEventListeners(tableId);
}

function addSelectEventListeners(tableId) {
  const table = document.getElementById(tableId);
  
  // Add event listeners for assignee select elements
  table.querySelectorAll('.assignee-select').forEach(select => {
    select.addEventListener('change', (event) => {
      const ticketTitle = event.target.getAttribute('data-ticket-title');
      const newAssigneeId = parseInt(event.target.value);
      updateTicketData(ticketTitle, 'assignee', newAssigneeId);
    });
  });

  // Add event listeners for priority select elements
  table.querySelectorAll('.priority-select').forEach(select => {
    select.addEventListener('change', (event) => {
      const ticketTitle = event.target.getAttribute('data-ticket-title');
      const newPriority = event.target.value;
      updateTicketData(ticketTitle, 'priority', newPriority);
    });
  });
}

function renderTable(tickets, assignees, tableId) {
  const ticketsTableBody = document.querySelector(`#${tableId} tbody`);
  if (tickets.length === 0) {
    ticketsTableBody.innerHTML = '<tr><td colspan="7">No tickets found</td></tr>';
    return;
  }

  ticketsTableBody.innerHTML = ""; // Clear existing rows

  tickets.forEach((ticket, index) => {
    const row = document.createElement("tr");
    row.onclick = (e) => {
      // Prevent click event when clicking on select elements or delete button
      if (e.target.tagName !== 'SELECT' && !e.target.classList.contains('delete-button')) {
        showTicketDetails(ticket.ticketNumber);
      }
    };
    row.innerHTML = `
      <td>${String(index + 1).padStart(2, '0')}</td>
      <td>${String(ticket.ticketNumber)}</td>
      <td>${ticket.title}</td>
      <td>${ticket.description}</td>
      <td>${ticket.customerName}</td>
      <td>${ticket.customerEmail}</td>
      <td>
        <select class="assignee-select" data-ticket-title="${ticket.title}">
          ${assignees
            .map(
              assignee =>
                `<option value="${assignee.employeeId}" ${assignee.employeeId === ticket.assignee ? "selected" : ""}>${assignee.employeeName}</option>`
            )
            .join("")}
        </select>
      </td>
      <td>
        <select class="priority-select" data-ticket-title="${ticket.title}">
          <option value="Resolve" ${ticket.priority === "Resolve" ? "selected" : ""}>Resolve</option>
          <option value="Review" ${ticket.priority === "Review" ? "selected" : ""}>Review</option>
          <option value="None" ${ticket.priority === "None" ? "selected" : ""}>None</option>
          <option value="Pending" ${ticket.priority === "Pending" ? "selected" : ""}>Pending</option>
        </select>
      </td>
      <td>
        <button class="delete-button" data-ticket-title="${ticket.title}">Delete</button>
      </td>
    `;
    ticketsTableBody.appendChild(row);
  });

  addDeleteEventListeners(tableId);
}

// Initialize localStorage and set up event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
  initializeLocalStorage();
  const dashboardLink = document.getElementById('menu-dashboard');
  showContent('dashboard', dashboardLink);
});


function searchTickets(searchBoxId, tableId) {
  const searchQuery = document.getElementById(searchBoxId).value.toLowerCase();
  const table = document.getElementById(tableId);
  const rows = table.querySelectorAll('tbody tr');

  rows.forEach(row => {
    const rowText = row.innerText.toLowerCase();
    if (rowText.includes(searchQuery)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}


function deleteTicket(ticketTitle, tableId) {
  let tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  tickets = tickets.filter(ticket => ticket.title !== ticketTitle);
  localStorage.setItem('tickets', JSON.stringify(tickets));

  fetchFromLocalStorageAndRender(null, tableId);
}

function addDeleteEventListeners(tableId) {
  const table = document.getElementById(tableId);
  table.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const ticketTitle = event.target.getAttribute('data-ticket-title');
      if (confirm(`Are you sure you want to delete the ticket: ${ticketTitle}?`)) {
        deleteTicket(ticketTitle, tableId);
      }
    });
  });
}


function filterByPriority(tableId) {
  const priority = document.getElementById('priorityFilter').value; // Get selected priority
  const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
  const assignees = JSON.parse(localStorage.getItem('assignees') || '[]');

  // Filter tickets by the selected priority
  const filteredTickets = priority
    ? tickets.filter(ticket => ticket.priority === priority)
    : tickets; // Show all tickets if no priority is selected

  renderTable(filteredTickets, assignees, tableId);
  addSelectEventListeners(tableId);
}


// Update the dashboard ticket counts
function updateDashboardCounts() {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(ticket => ticket.priority === "Pending").length;
  const resolvedTickets = tickets.filter(ticket => ticket.priority === "Resolve").length;

  // Update the dashboard
  document.getElementById('totalTicketsCount').textContent = totalTickets;
  document.getElementById('pendingTicketsCount').textContent = pendingTickets;
  document.getElementById('resolvedTicketsCount').innerText = resolvedTickets;
}

// Initialize localStorage and update counts on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeLocalStorage();
  updateDashboardCounts(); // Update the ticket counts
  const dashboardLink = document.getElementById('menu-dashboard');
  showContent('dashboard', dashboardLink);
});

// Function to toggle popup visibility
function togglePopup() {
  const popup = document.getElementById('popup');
  const overlay = document.getElementById('popupOverlay');
  const isVisible = popup.style.display === 'block';
  
  popup.style.display = isVisible ? 'none' : 'block';
  overlay.style.display = isVisible ? 'none' : 'block';
  
  if (!isVisible) {
    populateAssigneeSelect();
    // Generate and display random ticket number
    const randomTicketNumber = generateRandomTicketNumber();
    document.getElementById('displayTicketNumber').textContent = randomTicketNumber;
  }
}

// Function to populate assignee select dropdown
function populateAssigneeSelect() {
  const assigneeSelect = document.getElementById('ticketAssignee');
  const assignees = JSON.parse(localStorage.getItem('assignees') || '[]');
  
  assigneeSelect.innerHTML = '<option value="">Select Assignee</option>';
  assignees.forEach(assignee => {
    assigneeSelect.innerHTML += `
      <option value="${assignee.employeeId}">${assignee.employeeName}</option>
    `;
  });
}

// Function to generate unique ticket number
function generateTicketNumber() {
  const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
  const lastTicket = tickets[tickets.length - 1];
  const lastNumber = lastTicket ? parseInt(lastTicket.ticketNumber.slice(1)) : 0;
  return `T${String(lastNumber + 1).padStart(4, '0')}`;
}

// Function to handle form submission
function submitNewTicket(event) {
  event.preventDefault();
  
  const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
  const newTicket = {
    ticketNumber: document.getElementById('displayTicketNumber').textContent,
    title: document.getElementById('ticketTitle').value,
    description: document.getElementById('ticketDescription').value,
    customerName: document.getElementById('customerName').value,
    customerEmail: document.getElementById('customerEmail').value,
    assignee: parseInt(document.getElementById('ticketAssignee').value),
    priority: document.getElementById('ticketPriority').value
  };
  
  tickets.push(newTicket);
  localStorage.setItem('tickets', JSON.stringify(tickets));
  
  // Reset form and close popup
  document.getElementById('newTicketForm').reset();
  togglePopup();
  
  // Refresh the current view and update dashboard
  const currentActiveTab = document.querySelector('.content.active').id;
  const currentMenuItem = document.querySelector('.side-menu a.active');
  showContent(currentActiveTab, currentMenuItem);
  updateDashboardCounts();
}

// Function to generate random ticket number
function generateRandomTicketNumber() {
  const randomNum = Math.floor(10000 + Math.random() * 90000); // Random 5-digit number
  return randomNum;
}

function toggleDetailsPopup() {
  const popup = document.getElementById('detailsPopup');
  const overlay = document.getElementById('detailsPopupOverlay');
  const isVisible = popup.style.display === 'block';
  
  popup.style.display = isVisible ? 'none' : 'block';
  overlay.style.display = isVisible ? 'none' : 'block';
}

function showTicketDetails(ticketNumber) {
  const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
  const assignees = JSON.parse(localStorage.getItem('assignees') || '[]');
  
  const ticket = tickets.find(t => t.ticketNumber === ticketNumber);
  if (!ticket) return;
  
  // Find assignee name
  const assignee = assignees.find(a => a.employeeId === ticket.assignee);
  const assigneeName = assignee ? assignee.employeeName : 'Unassigned';
  
  // Populate details
  document.getElementById('detailsTicketNumber').textContent = ticket.ticketNumber;
  document.getElementById('detailsTitle').textContent = ticket.title;
  document.getElementById('detailsDescription').textContent = ticket.description;
  document.getElementById('detailsCustomerName').textContent = ticket.customerName;
  document.getElementById('detailsCustomerEmail').textContent = ticket.customerEmail;
  document.getElementById('detailsAssignee').textContent = assigneeName;
  document.getElementById('detailsPriority').textContent = ticket.priority;
  
  toggleDetailsPopup();
}




function updateTicketData(ticketTitle, field, value) {
  const tickets = JSON.parse(localStorage.getItem('tickets'));
  const ticketIndex = tickets.findIndex(ticket => ticket.title === ticketTitle);
  
  if (ticketIndex !== -1) {
    tickets[ticketIndex][field] = value;
    localStorage.setItem('tickets', JSON.stringify(tickets));

    // If the ticket is marked as "Resolve", send an email to the customer
    if (field === "priority" && value === "Resolve") {
      sendEmailToCustomer(tickets[ticketIndex]);
    }

    // Refresh the current view
    const currentActiveTab = document.querySelector('.content.active').id;
    const currentMenuItem = document.querySelector('.side-menu a.active');
    showContent(currentActiveTab, currentMenuItem);
    
    console.log('Ticket updated successfully');
  } else {
    console.error('Ticket not found');
  }
}

// Function to send an email when a ticket is resolved
function sendEmailToCustomer(ticket) {
  const customerEmail = ticket.customerEmail;
  const ticketNumber = ticket.ticketNumber;
  const ticketTitle = ticket.title;

  // Create the email subject and body
  const subject = `Your ticket ${ticketNumber} has been resolved`;
  const body = `
    Dear ${ticket.customerName},
    
    We are pleased to inform you that your ticket "${ticketTitle}" has been resolved.
    If you have any further questions, feel free to contact us.

    Best regards,
    Your Support Team
  `;

  // Send the email using Email.js

  
   // Send the email using Email.js
   emailjs.send(serviceID, templateID, {
    to_email: customerEmail,
    subject: subject,
    message: body
  }).then(() => {
    console.log('Email sent successfully!');
  }).catch((err) => {
    console.error('Error sending email:', err);
  });
}


function sendEmailToCustomer(ticket) {
  const customerEmail = ticket.customerEmail; // Customer's email from the ticket data
  const ticketNumber = ticket.ticketNumber;
  const ticketTitle = ticket.title;
  console.log("Harsh")
  console.log(ticket)
  // Prepare dynamic template parameters
  const templateParams = {
    customerEmail: customerEmail, // Dynamic recipient email
    ticket_number: ticketNumber, // Dynamic ticket number
    ticket_description: ticket.description,
    customer_name: ticket.customerName,
    ticket_title: ticketTitle
  };

  const serviceID = 'service_vnx3xre';
  const templateID = 'template_ss4u22c';

  // Send the email using Email.js
  emailjs.send(serviceID, templateID, templateParams)
    .then(() => {
      console.log('Email sent successfully to:', customerEmail);
    })
    .catch((err) => {
      console.error('Error sending email:', err);
    });
}
