import { User } from './types';

export const mockUsers: User[] = [
  {
    id: 1,
    email: "dara@pipedpeony.com",
    name: "Dara",
    isLoggedIn: false,
    membershipStatus: "active",
    membershipType: "premium",
    joinDate: "2024-01-15",
    profileImage: "/dara-about.jpeg"
  },
  {
    id: 2,
    email: "test@example.com",
    name: "Test User",
    isLoggedIn: false,
    membershipStatus: "active",
    membershipType: "basic",
    joinDate: "2024-03-01",
    profileImage: "/placeholder-user.jpg"
  },
  {
    id: 3,
    email: "guest@pipedpeony.com",
    name: "Guest User",
    isLoggedIn: false,
    membershipStatus: "inactive",
    membershipType: "trial",
    joinDate: "2024-11-01",
    profileImage: "/placeholder-user.jpg"
  }
];

// Helper functions for the mock user API
export const getUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email === email);
};

export const getUserById = (id: number): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getAllUsers = (): User[] => {
  return mockUsers;
};

export const getLoggedInUser = (): User | undefined => {
  return mockUsers.find(user => user.isLoggedIn === true);
};

export const loginUser = (email: string): User | undefined => {
  const user = getUserByEmail(email);
  if (user) {
    // First log out all other users
    mockUsers.forEach(u => u.isLoggedIn = false);
    // Then log in the requested user
    user.isLoggedIn = true;
    return user;
  }
  return undefined;
};

export const logoutUser = (): void => {
  mockUsers.forEach(user => user.isLoggedIn = false);
};

export const isUserLoggedIn = (): boolean => {
  return mockUsers.some(user => user.isLoggedIn === true);
};

export const createUser = (userData: { name: string; email: string; password: string }): User | undefined => {
  // Check if user with this email already exists
  const existingUser = getUserByEmail(userData.email);
  if (existingUser) {
    return undefined; // User already exists
  }

  // Create new user
  const newUser: User = {
    id: Math.max(...mockUsers.map(u => u.id)) + 1, // Generate new ID
    email: userData.email,
    name: userData.name,
    isLoggedIn: false,
    membershipStatus: "active",
    membershipType: "trial", // New users start with trial
    joinDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    profileImage: "/placeholder-user.jpg"
  };

  // Add to mock database
  mockUsers.push(newUser);
  return newUser;
};

export const signupAndLogin = (userData: { name: string; email: string; password: string }): User | undefined => {
  // Create the user
  const newUser = createUser(userData);
  if (!newUser) {
    return undefined; // User creation failed (email already exists)
  }

  // Log in the new user
  return loginUser(newUser.email);
};
