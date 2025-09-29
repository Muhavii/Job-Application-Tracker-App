import React from 'react';
import { useJobs } from '../contexts/JobContext';
import { Job, JobStatus } from '../types/job';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Select, 
  MenuItem, 
  IconButton,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const JobList: React.FC = () => {
  const { jobs, updateJobStatus, deleteJob, loading } = useJobs();

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    try {
      await updateJobStatus(jobId, newStatus);
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId);
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (jobs.length === 0) {
    return (
      <Box my={4} textAlign="center">
        <Typography variant="h6">No jobs added yet. Add your first job application!</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Company</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Date Applied</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>{job.company}</TableCell>
              <TableCell>{job.role}</TableCell>
              <TableCell>{new Date(job.dateApplied).toLocaleDateString()}</TableCell>
              <TableCell>
                <Select
                  value={job.status}
                  onChange={(e) => handleStatusChange(job.id, e.target.value as JobStatus)}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="Applied">Applied</MenuItem>
                  <MenuItem value="Interview">Interview</MenuItem>
                  <MenuItem value="Offer">Offer</MenuItem>
                  <MenuItem value="Accepted">Accepted</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(job.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default JobList;
