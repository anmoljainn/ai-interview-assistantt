// Mock implementation for resume parsing
export const parseResume = async (file) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock extracted data
  const mockData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
  };
  
  // Randomly omit some fields to test the missing fields flow
  const random = Math.random();
  if (random < 0.3) {
    delete mockData.phone;
  } else if (random < 0.6) {
    delete mockData.email;
  } else if (random < 0.9) {
    delete mockData.name;
  }
  
  return mockData;
};