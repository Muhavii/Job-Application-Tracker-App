import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Job, JobStatus } from '../types/job';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  DocumentData, 
  QueryDocumentSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

interface JobContextType {
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'updatedAt'>) => Promise<void>;
  updateJobStatus: (id: string, status: JobStatus) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'jobs'));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        try {
          const jobsData: Job[] = [];
          querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            jobsData.push({
              id: doc.id,
              company: data.company,
              role: data.role,
              dateApplied: data.dateApplied,
              status: data.status as JobStatus,
              updatedAt: data.updatedAt,
              notes: data.notes
            });
          });
          setJobs(jobsData);
          setError(null);
        } catch (error) {
          console.error('Error processing jobs data:', error);
          setError(error instanceof Error ? error : new Error('Failed to process jobs data'));
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error fetching jobs:', error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addJob = useCallback(async (job: Omit<Job, 'id' | 'updatedAt'>) => {
    try {
      const newJob = {
        ...job,
        id: uuidv4(),
        updatedAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'jobs'), newJob);
    } catch (error) {
      console.error('Error adding job:', error);
      throw error;
    }
  }, []);

  const updateJobStatus = useCallback(async (id: string, status: JobStatus) => {
    try {
      const jobRef = doc(db, 'jobs', id);
      await updateDoc(jobRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  }, []);

  const deleteJob = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', id));
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }, []);

  return (
    <JobContext.Provider value={{ 
      jobs, 
      addJob, 
      updateJobStatus, 
      deleteJob, 
      loading, 
      error 
    }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
