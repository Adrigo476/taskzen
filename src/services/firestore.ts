import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, FirestoreError } from 'firebase/firestore';
import type { Objective } from '@/lib/types';

const getUserObjectivesCollection = (userId: string) => {
    if (!userId) {
        throw new Error("User ID is required to get objectives collection.");
    }
    return collection(db, 'users', userId, 'objectives');
}

export const getObjectives = async (userId: string): Promise<Objective[]> => {
    try {
        const snapshot = await getDocs(getUserObjectivesCollection(userId));
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Objective[];
    } catch (error) {
        if (error instanceof FirestoreError) {
             console.error("Error getting objectives: ", error.message);
             throw new Error(`Error de Firestore: ${error.code}`);
        }
        console.error("Error getting objectives: ", error);
        return [];
    }
};

export const addObjective = async (userId: string, objective: Omit<Objective, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(getUserObjectivesCollection(userId), objective);
        return docRef.id;
    } catch (error) {
         if (error instanceof FirestoreError) {
            console.error("Error adding objective: ", error.message);
            throw new Error(`Error de Firestore: ${error.code}. Revisa tus reglas de seguridad.`);
        }
        console.error("Error adding objective: ", error);
        throw new Error("Could not add objective");
    }
};

export const updateObjective = async (userId: string, id: string, partialObjective: Partial<Objective>): Promise<void> => {
    try {
        const objectiveDoc = doc(db, 'users', userId, 'objectives', id);
        await updateDoc(objectiveDoc, partialObjective);
    } catch (error) {
        if (error instanceof FirestoreError) {
            console.error("Error updating objective: ", error.message);
            throw new Error(`Error de Firestore: ${error.code}. Revisa tus reglas de seguridad.`);
        }
        console.error("Error updating objective: ", error);
        throw new Error("Could not update objective");
    }
};

export const deleteObjective = async (userId: string, id: string): Promise<void> => {
    try {
        const objectiveDoc = doc(db, 'users', userId, 'objectives', id);
        await deleteDoc(objectiveDoc);
    } catch (error) {
        if (error instanceof FirestoreError) {
            console.error("Error deleting objective: ", error.message);
            throw new Error(`Error de Firestore: ${error.code}. Revisa tus reglas de seguridad.`);
        }
        console.error("Error deleting objective: ", error);
        throw new Error("Could not delete objective");
    }
};
