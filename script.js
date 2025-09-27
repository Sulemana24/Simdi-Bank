if (!localStorage.getItem("bankUsers")) {
  localStorage.setItem("bankUsers", JSON.stringify([]));
}

if (!localStorage.getItem("bankTransactions")) {
  localStorage.setItem("bankTransactions", JSON.stringify([]));
}

// Generate a random account number
function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Show login form
function showLogin() {
  document.getElementById("login-form").style.display = "block";
  document.getElementById("signup-form").style.display = "none";
}

// Show signup form
function showSignup() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
}

// Sign up function
function signup() {
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;
  const email = document.getElementById("signup-email").value;
  const phone = document.getElementById("signup-phone").value;

  if (!username || !password || !email || !phone) {
    showError("Please fill in all fields");
    return;
  }

  const users = JSON.parse(localStorage.getItem("bankUsers"));

  // Check if username already exists
  if (users.find((user) => user.username === username)) {
    showError("Username already exists");
    return;
  }

  // Create new user
  const newUser = {
    username,
    password,
    email,
    phone,
    accountNumber: generateAccountNumber(),
    balance: 6500.0,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem("bankUsers", JSON.stringify(users));

  // Show success message
  showSuccess("Account created successfully. Please login.");
  showLogin();
}

// Login function
function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  if (!username || !password) {
    showError("Please enter username and password");
    return;
  }

  const users = JSON.parse(localStorage.getItem("bankUsers"));
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Store current user in session
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    // Show dashboard
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    // Update dashboard with user info
    updateDashboard(user);
  } else {
    showError("Invalid username or password");
  }
}

// Update dashboard with user information
function updateDashboard(user) {
  document.getElementById(
    "user-welcome"
  ).textContent = `Welcome, ${user.username}`;
  document.getElementById(
    "account-balance"
  ).textContent = `Ghc${user.balance.toFixed(2)}`;
  document.getElementById("account-number").textContent = user.accountNumber;
  document.getElementById("display-username").textContent = user.username;

  // Load transactions
  loadRecentTransactions();
}

// Show section
function showSection(section) {
  // Hide all sections
  document.querySelectorAll(".section").forEach((el) => {
    el.style.display = "none";
  });

  // Show selected section
  document.getElementById(`${section}-section`).style.display = "block";

  if (section === "history") {
    loadFullTransactionHistory();
  }
}

// Transfer money
function transferMoney() {
  const recipient = document.getElementById("recipient").value;
  const amount = parseFloat(document.getElementById("transfer-amount").value);
  const description = document.getElementById("transfer-description").value;

  if (!recipient || !amount || amount <= 0) {
    showError("Please enter valid recipient and amount");
    return;
  }

  const users = JSON.parse(localStorage.getItem("bankUsers"));
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  const recipientUser = users.find((u) => u.accountNumber === recipient);

  if (!recipientUser) {
    showError("Recipient account not found");
    return;
  }

  if (currentUser.balance < amount) {
    showError("Insufficient funds");
    return;
  }

  // Update balances
  currentUser.balance -= amount;
  recipientUser.balance += amount;

  // Update users in storage
  const updatedUsers = users.map((u) => {
    if (u.username === currentUser.username) return currentUser;
    if (u.username === recipientUser.username) return recipientUser;
    return u;
  });

  localStorage.setItem("bankUsers", JSON.stringify(updatedUsers));
  sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Record transaction
  const transactions = JSON.parse(localStorage.getItem("bankTransactions"));
  transactions.push({
    type: "transfer",
    from: currentUser.username,
    to: recipientUser.username,
    amount,
    description,
    date: new Date().toISOString(),
  });

  localStorage.setItem("bankTransactions", JSON.stringify(transactions));

  // Update UI
  updateDashboard(currentUser);
  showSuccess(
    `Successfully transferred Ghc${amount.toFixed(2)} to ${
      recipientUser.username
    }`
  );

  // Clear form
  document.getElementById("recipient").value = "";
  document.getElementById("transfer-amount").value = "";
  document.getElementById("transfer-description").value = "";
}

// Withdraw money
function withdrawMoney() {
  const amount = parseFloat(document.getElementById("withdraw-amount").value);
  const description = document.getElementById("withdraw-description").value;

  if (!amount || amount <= 0) {
    showError("Please enter a valid amount");
    return;
  }

  const users = JSON.parse(localStorage.getItem("bankUsers"));
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  if (currentUser.balance < amount) {
    showError("Insufficient funds");
    return;
  }

  // Update balance
  currentUser.balance -= amount;

  // Update users in storage
  const updatedUsers = users.map((u) => {
    if (u.username === currentUser.username) return currentUser;
    return u;
  });

  localStorage.setItem("bankUsers", JSON.stringify(updatedUsers));
  sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Record transaction
  const transactions = JSON.parse(localStorage.getItem("bankTransactions"));
  transactions.push({
    type: "withdrawal",
    from: currentUser.username,
    amount,
    description,
    date: new Date().toISOString(),
  });

  localStorage.setItem("bankTransactions", JSON.stringify(transactions));

  // Update UI
  updateDashboard(currentUser);
  showSuccess(`Successfully withdrew $${amount.toFixed(2)}`);

  // Clear form
  document.getElementById("withdraw-amount").value = "";
  document.getElementById("withdraw-description").value = "";
}

// Deposit money
function depositMoney() {
  const amount = parseFloat(document.getElementById("deposit-amount").value);
  const description = document.getElementById("deposit-description").value;

  if (!amount || amount <= 0) {
    showError("Please enter a valid amount");
    return;
  }

  const users = JSON.parse(localStorage.getItem("bankUsers"));
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  // Update balance
  currentUser.balance += amount;

  // Update users in storage
  const updatedUsers = users.map((u) => {
    if (u.username === currentUser.username) return currentUser;
    return u;
  });

  localStorage.setItem("bankUsers", JSON.stringify(updatedUsers));
  sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Record transaction
  const transactions = JSON.parse(localStorage.getItem("bankTransactions"));
  transactions.push({
    type: "deposit",
    to: currentUser.username,
    amount,
    description,
    date: new Date().toISOString(),
  });

  localStorage.setItem("bankTransactions", JSON.stringify(transactions));

  // Update UI
  updateDashboard(currentUser);
  showSuccess(`Successfully deposited Ghc${amount.toFixed(2)}`);

  // Clear form
  document.getElementById("deposit-amount").value = "";
  document.getElementById("deposit-description").value = "";
}

// Pay bill
function payBill() {
  const billType = document.getElementById("bill-type").value;
  const amount = parseFloat(document.getElementById("bill-amount").value);
  const description =
    document.getElementById("bill-description").value ||
    `Payment for ${billType}`;

  if (!amount || amount <= 0) {
    showError("Please enter a valid amount");
    return;
  }

  const users = JSON.parse(localStorage.getItem("bankUsers"));
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  if (currentUser.balance < amount) {
    showError("Insufficient funds");
    return;
  }

  // Update balance
  currentUser.balance -= amount;

  // Update users in storage
  const updatedUsers = users.map((u) => {
    if (u.username === currentUser.username) return currentUser;
    return u;
  });

  localStorage.setItem("bankUsers", JSON.stringify(updatedUsers));
  sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Record transaction
  const transactions = JSON.parse(localStorage.getItem("bankTransactions"));
  transactions.push({
    type: "bill_payment",
    from: currentUser.username,
    to: billType,
    amount,
    description,
    date: new Date().toISOString(),
  });

  localStorage.setItem("bankTransactions", JSON.stringify(transactions));

  // Update UI
  updateDashboard(currentUser);
  showSuccess(`Successfully paid Ghc${amount.toFixed(2)} for ${billType}`);

  // Clear form
  document.getElementById("bill-amount").value = "";
  document.getElementById("bill-description").value = "";
}

// Load recent transactions
function loadRecentTransactions() {
  const transactions = JSON.parse(localStorage.getItem("bankTransactions"));
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  // Filter transactions for current user
  const userTransactions = transactions
    .filter(
      (t) => t.from === currentUser.username || t.to === currentUser.username
    )
    .slice(-5)
    .reverse();

  const transactionsContainer = document.getElementById("recent-transactions");
  transactionsContainer.innerHTML = "";

  if (userTransactions.length === 0) {
    transactionsContainer.innerHTML = "<p>No recent transactions</p>";
    return;
  }

  userTransactions.forEach((transaction) => {
    const transactionEl = document.createElement("div");
    transactionEl.className = "transaction-item";

    let transactionText = "";
    let amountClass = "";

    if (transaction.type === "deposit") {
      transactionText = `Deposit: ${transaction.description}`;
      amountClass = "credit";
    } else if (transaction.type === "withdrawal") {
      transactionText = `Withdrawal: ${transaction.description}`;
      amountClass = "debit";
    } else if (transaction.type === "transfer") {
      if (transaction.from === currentUser.username) {
        transactionText = `Transfer to ${transaction.to}: ${transaction.description}`;
        amountClass = "debit";
      } else {
        transactionText = `Transfer from ${transaction.from}: ${transaction.description}`;
        amountClass = "credit";
      }
    } else if (transaction.type === "bill_payment") {
      transactionText = `Bill payment: ${transaction.description}`;
      amountClass = "debit";
    }

    const date = new Date(transaction.date).toLocaleDateString();

    transactionEl.innerHTML = `
                    <div>
                        <p>${transactionText}</p>
                        <small>${date}</small>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${
                          amountClass === "debit" ? "-" : "+"
                        }Ghc${transaction.amount.toFixed(2)}
                    </div>
                `;

    transactionsContainer.appendChild(transactionEl);
  });
}

// Load full transaction history
function loadFullTransactionHistory() {
  const transactions = JSON.parse(localStorage.getItem("bankTransactions"));
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  // Filter transactions for current user
  const userTransactions = transactions
    .filter(
      (t) => t.from === currentUser.username || t.to === currentUser.username
    )
    .reverse();

  const historyContainer = document.getElementById("full-transaction-history");
  historyContainer.innerHTML = "";

  if (userTransactions.length === 0) {
    historyContainer.innerHTML = "<p>No transactions found</p>";
    return;
  }

  userTransactions.forEach((transaction) => {
    const transactionEl = document.createElement("div");
    transactionEl.className = "transaction-item";

    let transactionText = "";
    let amountClass = "";

    if (transaction.type === "deposit") {
      transactionText = `Deposit: ${transaction.description}`;
      amountClass = "credit";
    } else if (transaction.type === "withdrawal") {
      transactionText = `Withdrawal: ${transaction.description}`;
      amountClass = "debit";
    } else if (transaction.type === "transfer") {
      if (transaction.from === currentUser.username) {
        transactionText = `Transfer to ${transaction.to}: ${transaction.description}`;
        amountClass = "debit";
      } else {
        transactionText = `Transfer from ${transaction.from}: ${transaction.description}`;
        amountClass = "credit";
      }
    } else if (transaction.type === "bill_payment") {
      transactionText = `Bill payment: ${transaction.description}`;
      amountClass = "debit";
    }

    const date = new Date(transaction.date).toLocaleDateString();

    transactionEl.innerHTML = `
                    <div>
                        <p>${transactionText}</p>
                        <small>${date}</small>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${
                          amountClass === "debit" ? "-" : "+"
                        }Ghc${transaction.amount.toFixed(2)}
                    </div>
                `;

    historyContainer.appendChild(transactionEl);
  });
}

// Show success modal
function showSuccess(message) {
  document.getElementById("success-message").textContent = message;
  document.getElementById("success-modal").style.display = "flex";
}

// Show error modal
function showError(message) {
  document.getElementById("error-message").textContent = message;
  document.getElementById("error-modal").style.display = "flex";
}

// Close modal
function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Logout function
function logout() {
  sessionStorage.removeItem("currentUser");
  document.getElementById("auth-container").style.display = "flex";
  document.getElementById("dashboard").style.display = "none";

  // Clear login form
  document.getElementById("login-username").value = "";
  document.getElementById("login-password").value = "";

  // Show login form
  showLogin();
}

// Initialize the app
function init() {
  // Check if user is logged in
  const currentUser = sessionStorage.getItem("currentUser");
  if (currentUser) {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    updateDashboard(JSON.parse(currentUser));
  }
}

// Run initialization when page loads
window.onload = init;
