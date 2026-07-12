const BASE_URL = 'http://localhost:5000/api'; // Ensure this matches your backend PORT

// Helper to handle responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// Helper to get auth headers (for when you connect the login system)
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // --- VEHICLES ---
  getVehicles: () => 
    fetch(`${BASE_URL}/vehicles`, { headers: getHeaders() }).then(handleResponse),
  
  getAvailableVehicles: () => 
    fetch(`${BASE_URL}/vehicles/available`, { headers: getHeaders() }).then(handleResponse),

  // --- DRIVERS ---
  getDrivers: () => 
    fetch(`${BASE_URL}/drivers`, { headers: getHeaders() }).then(handleResponse),
  
  getAvailableDrivers: () => 
    fetch(`${BASE_URL}/drivers/available`, { headers: getHeaders() }).then(handleResponse),

  // --- TRIPS ---
  dispatchTrip: (tripData) => 
    fetch(`${BASE_URL}/trips/dispatch`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(tripData)
    }).then(handleResponse)
};