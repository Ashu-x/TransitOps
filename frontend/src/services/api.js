const BASE_URL = "http://localhost:5000/api"; // Ensure this matches your backend PORT

// Helper to handle responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

// Helper to get auth headers (for when you connect the login system)
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // --- VEHICLES ---
  getVehicles: () =>
    fetch(`${BASE_URL}/vehicles`, { headers: getHeaders() }).then(
      handleResponse,
    ),

  getAvailableVehicles: () =>
    fetch(`${BASE_URL}/vehicles/available`, { headers: getHeaders() }).then(
      handleResponse,
    ),

  // --- DRIVERS ---
  getDrivers: () =>
    fetch(`${BASE_URL}/drivers`, { headers: getHeaders() }).then(
      handleResponse,
    ),

  getAvailableDrivers: () =>
    fetch(`${BASE_URL}/drivers/available`, { headers: getHeaders() }).then(
      handleResponse,
    ),
  login: (credentials) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    }).then(handleResponse),
  // --- TRIPS ---
  dispatchTrip: (tripData) =>
    fetch(`${BASE_URL}/trips/dispatch`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(tripData),
    }).then(handleResponse),
  // ADD SIGNUP
  signup: (userData) =>
    fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    }).then(handleResponse),

  // ADD MAINTENANCE METHODS
  getActiveMaintenance: () =>
    fetch(`${BASE_URL}/maintenance/active`, { headers: getHeaders() }).then(
      handleResponse,
    ),
  logMaintenance: (data) =>
    fetch(`${BASE_URL}/maintenance`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
  closeMaintenance: (id) =>
    fetch(`${BASE_URL}/maintenance/${id}/close`, {
      method: "PATCH",
      headers: getHeaders(),
    }).then(handleResponse),
  createVehicle: (vehicleData) =>
    fetch(`${BASE_URL}/vehicles`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(vehicleData),
    }).then(handleResponse),
  createDriver: (driverData) =>
    fetch(`${BASE_URL}/drivers`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(driverData),
    }).then(handleResponse),
  getDashboardStats: () =>
    fetch(`${BASE_URL}/dashboard/stats`, { headers: getHeaders() }).then(
      handleResponse,
    ),
  getAllMaintenance: () =>
    fetch(`${BASE_URL}/maintenance`, { headers: getHeaders() }).then(
      handleResponse,
    ),
  recordFuel: (data) =>
    fetch(`${BASE_URL}/fuel`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getOperationalCost: (vehicleId) =>
    fetch(`${BASE_URL}/fuel/${vehicleId}/costs`, {
      headers: getHeaders(),
    }).then(handleResponse),
  getAllFuelLogs: () =>
    fetch(`${BASE_URL}/fuel`, { headers: getHeaders() }).then(handleResponse),
  getAllTrips: () =>
    fetch(`${BASE_URL}/trips`, { headers: getHeaders() }).then(handleResponse),
  updateTripExpenses: (id, data) =>
    fetch(`${BASE_URL}/trips/${id}/expenses`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),
};
