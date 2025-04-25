import { auth, db, functions } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc
} from 'firebase/firestore';

// Authentication services
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Lấy thông tin người dùng từ Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    return {
      user: userCredential.user,
      userData: userDoc.exists() ? userDoc.data() : null
    };
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error.message);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error.message);
    throw error;
  }
};

export const updateUserProfile = async (displayName, photoURL) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    await updateProfile(user, { displayName, photoURL });
    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error.message);
    throw error;
  }
};

// Cloud Functions services
export const createUserWithFunction = async (userData) => {
  try {
    const createUserFn = httpsCallable(functions, 'createUser');
    const result = await createUserFn(userData);
    return result.data;
  } catch (error) {
    console.error('Create user error:', error.message);
    throw error;
  }
};

export const getAllUsersWithFunction = async () => {
  try {
    const getAllUsersFn = httpsCallable(functions, 'getAllUsers');
    const result = await getAllUsersFn();
    return result.data.users;
  } catch (error) {
    console.error('Get all users error:', error.message);
    throw error;
  }
};

export const toggleUserStatusWithFunction = async (userId, isActive) => {
  try {
    const toggleUserStatusFn = httpsCallable(functions, 'toggleUserStatus');
    const result = await toggleUserStatusFn({ userId, isActive });
    return result.data;
  } catch (error) {
    console.error('Toggle user status error:', error.message);
    throw error;
  }
};

export const searchUsersWithFunction = async (searchTerm) => {
  try {
    const searchUsersFn = httpsCallable(functions, 'searchUsers');
    const result = await searchUsersFn({ searchTerm });
    return result.data.users;
  } catch (error) {
    console.error('Search users error:', error.message);
    throw error;
  }
};

// Firestore direct services
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Get user data error:', error.message);
    throw error;
  }
};

export const updateUserData = async (userId, userData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...userData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Update user data error:', error.message);
    throw error;
  }
};

export const getSpecialties = async () => {
  try {
    const specialtiesSnapshot = await getDocs(collection(db, 'specialties'));
    const specialties = [];
    specialtiesSnapshot.forEach(doc => {
      specialties.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return specialties;
  } catch (error) {
    console.error('Get specialties error:', error.message);
    throw error;
  }
}; 