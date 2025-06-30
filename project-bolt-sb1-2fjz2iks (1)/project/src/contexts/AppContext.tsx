import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPreferences, UserSession } from '../types';

interface AppContextType {
  user: User | null;
  users: User[];
  session: UserSession;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  switchUser: (userId: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (userId: string) => void;
  logout: () => void;
  login: (userId: string) => void;
}

const defaultPreferences: UserPreferences = {
  darkMode: false,
  notifications: true,
  workingHours: 8,
  breakReminders: true,
  emailReports: false,
  locationTracking: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [session, setSession] = useState<UserSession>({ currentUserId: null, isLoggedIn: false });
  const [darkMode, setDarkMode] = useState(false);

  const currentUser = users.find(u => u.id === session.currentUserId) || null;

  useEffect(() => {
    // Load users from localStorage
    const storedUsers = localStorage.getItem('users_data');
    const storedSession = localStorage.getItem('user_session');
    
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      setUsers(parsedUsers);
      
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
        
        const user = parsedUsers.find((u: User) => u.id === parsedSession.currentUserId);
        if (user) {
          setDarkMode(user.preferences.darkMode);
        }
      }
    } else {
      // Create complete JAI AUTO INDUSTRIES employee database
      const companyUsers: User[] = [
        // MANAGEMENT & ADMINISTRATION
        {
          id: 'admin-system',
          name: 'System Administrator',
          email: 'admin@jaiauto.in',
          department: 'Administration',
          role: 'admin',
          preferences: { ...defaultPreferences, notifications: true, emailReports: true },
          isActive: true,
          joinDate: '2024-01-01',
          employeeId: 'ADM001'
        },
        {
          id: 'geetanjali-hr',
          name: 'Geetanjali',
          email: 'geetanjali@jaiauto.in',
          department: 'HR Administration',
          role: 'admin',
          preferences: { ...defaultPreferences, notifications: true, emailReports: true },
          isActive: true,
          joinDate: '2023-03-15',
          employeeId: 'HRA001'
        },

        // ACCOUNTS & FINANCE DEPARTMENT
        {
          id: 'govind-accounts-head',
          name: 'Govind',
          email: 'accounts2@jaiauto.in',
          department: 'Accounts',
          role: 'manager',
          preferences: { ...defaultPreferences, emailReports: true },
          isActive: true,
          joinDate: '2022-08-10',
          employeeId: 'ACC001'
        },
        {
          id: 'ajeeth-accounts',
          name: 'Ajeeth Kumar Tiwari',
          email: 'ajeetkumar.tiwari@jaiauto.in',
          department: 'Accounts',
          role: 'employee',
          preferences: defaultPreferences,
          isActive: true,
          joinDate: '2023-06-20',
          employeeId: 'ACC101'
        },
        {
          id: 'dsrawat-accounts',
          name: 'D.S Rawat',
          email: 'Accounts@jaiauto.in',
          department: 'Accounts',
          role: 'employee',
          preferences: defaultPreferences,
          isActive: true,
          joinDate: '2022-11-05',
          employeeId: 'ACC102'
        },

        // EXPORT DEPARTMENT
        {
          id: 'sushil-export-manager',
          name: 'Sushil Kumar',
          email: 'sushil.kumar@jaiauto.in',
          department: 'Export',
          role: 'manager',
          preferences: { ...defaultPreferences, emailReports: true },
          isActive: true,
          joinDate: '2022-05-12',
          employeeId: 'EXP001'
        },
        {
          id: 'komal-export-manager',
          name: 'Komal Rajoria',
          email: 'Komal@jaiauto.in',
          department: 'Export',
          role: 'manager',
          preferences: { ...defaultPreferences, emailReports: true },
          isActive: true,
          joinDate: '2022-07-18',
          employeeId: 'EXP002'
        },
        {
          id: 'rajat-export',
          name: 'Rajat Kumar',
          email: 'rajat.kumar@jaiauto.in',
          department: 'Export',
          role: 'employee',
          preferences: defaultPreferences,
          isActive: true,
          joinDate: '2023-09-01',
          employeeId: 'EXP101'
        },
        {
          id: 'vikas-export',
          name: 'Vikas Yadav',
          email: 'vikas.yadav@jaiauto.in',
          department: 'Export',
          role: 'employee',
          preferences: defaultPreferences,
          isActive: true,
          joinDate: '2023-10-15',
          employeeId: 'EXP102'
        },

        // HUMAN RESOURCES & RECRUITMENT
        {
          id: 'neetu-recruiter',
          name: 'Neetu',
          email: 'neetu.methu@jaiauto.in',
          department: 'Human Resources',
          role: 'employee',
          preferences: { ...defaultPreferences, notifications: true },
          isActive: true,
          joinDate: '2023-04-08',
          employeeId: 'HR101'
        },

        // DOMESTIC OPERATIONS
        {
          id: 'girish-domestic',
          name: 'Girish Verma',
          email: 'girish.verma@jaiauto.in',
          department: 'Domestic Operations',
          role: 'employee',
          preferences: defaultPreferences,
          isActive: true,
          joinDate: '2023-02-20',
          employeeId: 'DOM101'
        },

        // PRODUCTION CONTROL
        {
          id: 'riya-pc',
          name: 'Riya Singh',
          email: 'riya.singh@jaiauto.in',
          department: 'Production Control',
          role: 'employee',
          preferences: defaultPreferences,
          isActive: true,
          joinDate: '2023-07-03',
          employeeId: 'PC101'
        },
        {
          id: 'yashika-pc',
          name: 'Yashika Singh',
          email: 'yashika.singh@jaiauto.in',
          department: 'Production Control',
          role: 'employee',
          preferences: defaultPreferences,
          isActive: true,
          joinDate: '2023-08-14',
          employeeId: 'PC102'
        },

        // CUSTOMER RELATIONSHIP MANAGEMENT
        {
          id: 'mamta-crm',
          name: 'Mamta Sharma',
          email: 'mamta.sharma@jaiauto.in',
          department: 'Customer Relations',
          role: 'employee',
          preferences: { ...defaultPreferences, notifications: true },
          isActive: true,
          joinDate: '2023-05-25',
          employeeId: 'CRM101'
        },

        // MARKETING DEPARTMENT
        {
          id: 'himanshu-marketing',
          name: 'Himanshu Pandey',
          email: 'himanshu.pandey@jaiauto.in',
          department: 'Marketing',
          role: 'employee',
          preferences: { ...defaultPreferences, notifications: true },
          isActive: true,
          joinDate: '2023-03-10',
          employeeId: 'MKT101'
        },
        {
          id: 'vani-marketing',
          name: 'Vani Mishra',
          email: 'vani.mishra@jaiauto.in',
          department: 'Marketing',
          role: 'employee',
          preferences: { ...defaultPreferences, notifications: true },
          isActive: true,
          joinDate: '2023-04-22',
          employeeId: 'MKT102'
        },

        // SALES & MARKETING
        {
          id: 'ravi-sales',
          name: 'Ravi Kumar',
          email: 'ravikumar@jaiauto.in',
          department: 'Sales & Marketing',
          role: 'employee',
          preferences: { ...defaultPreferences, notifications: true },
          isActive: true,
          joinDate: '2023-01-16',
          employeeId: 'SAL101'
        },
        {
          id: 'sanju-sales',
          name: 'Sanju Sharma',
          email: 'sanju.sharma@jaiauto.in',
          department: 'Sales & Marketing',
          role: 'employee',
          preferences: { ...defaultPreferences, notifications: true },
          isActive: true,
          joinDate: '2023-02-28',
          employeeId: 'SAL102'
        },
        {
          id: 'samipya-sales',
          name: 'Samipya Pratap Chand',
          email: 'samipya.chand@jaiauto.in',
          department: 'Sales & Marketing',
          role: 'employee',
          preferences: { ...defaultPreferences, notifications: true },
          isActive: true,
          joinDate: '2023-06-12',
          employeeId: 'SAL103'
        },

        // STORE & INVENTORY
        {
          id: 'gopal-store',
          name: 'Gopal',
          email: 'store@jaiauto.in',
          department: 'Store & Inventory',
          role: 'employee',
          preferences: defaultPreferences,
          isActive: true,
          joinDate: '2022-12-01',
          employeeId: 'STR101'
        },

        // LOGISTICS & TRANSPORTATION
        {
          id: 'sunil-logistics',
          name: 'Sunil Rathi',
          email: 'sunil.rathi@jaiauto.in',
          department: 'Logistics',
          role: 'employee',
          preferences: defaultPreferences,
          isActive: true,
          joinDate: '2023-01-30',
          employeeId: 'LOG101'
        }
      ];
      
      setUsers(companyUsers);
      localStorage.setItem('users_data', JSON.stringify(companyUsers));
    }
  }, []);

  const saveUsers = (newUsers: User[]) => {
    localStorage.setItem('users_data', JSON.stringify(newUsers));
    setUsers(newUsers);
  };

  const saveSession = (newSession: UserSession) => {
    localStorage.setItem('user_session', JSON.stringify(newSession));
    setSession(newSession);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...updates };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    saveUsers(updatedUsers);
  };

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    if (!currentUser) return;
    
    const updatedPreferences = { ...currentUser.preferences, ...preferences };
    const updatedUser = { ...currentUser, preferences: updatedPreferences };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    saveUsers(updatedUsers);
    
    if (preferences.darkMode !== undefined) {
      setDarkMode(preferences.darkMode);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    updatePreferences({ darkMode: newDarkMode });
  };

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && user.isActive) {
      const newSession = { currentUserId: userId, isLoggedIn: true };
      saveSession(newSession);
      setDarkMode(user.preferences.darkMode);
    }
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
    };
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
  };

  const deleteUser = (userId: string) => {
    if (userId === session.currentUserId) return; // Can't delete current user
    
    const updatedUsers = users.filter(u => u.id !== userId);
    saveUsers(updatedUsers);
    
    // Clean up user data
    const userKeys = [
      `attendance_records_${userId}`,
      `leave_requests_${userId}`,
      `attendance_goals_${userId}`,
      `achievements_${userId}`,
      `short_leaves_${userId}`
    ];
    
    userKeys.forEach(key => localStorage.removeItem(key));
  };

  const login = (userId: string) => {
    switchUser(userId);
  };

  const logout = () => {
    const newSession = { currentUserId: null, isLoggedIn: false };
    saveSession(newSession);
  };

  return (
    <AppContext.Provider value={{
      user: currentUser,
      users,
      session,
      updateUser,
      updatePreferences,
      darkMode,
      toggleDarkMode,
      switchUser,
      addUser,
      deleteUser,
      logout,
      login,
    }}>
      <div className={darkMode ? 'dark' : ''}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};