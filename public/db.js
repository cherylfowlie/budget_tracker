let db;
const dbrequest = indexedDB.open("budget", 1);

dbrequest.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

//Result function
dbrequest.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

//On error function
dbrequest.onerror = function (event) {
  console.log("DB Request Failed " + event.target.errorCode);
};

// Save the transaction
function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");

  store.add(record);
}

// Check the database
function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  // Pull from api.js routes
  getAll.onsuccess = function () {
    //Get all results in array
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        //POST dbrequest
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}

//Delete function
function deletePending() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.clear();
}

//Window listener
window.addEventListener("online", checkDatabase);
