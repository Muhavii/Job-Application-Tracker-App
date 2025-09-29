import React, { useState } from 'react';
import { useJobs } from '../contexts/JobContext';
import { JobStatus } from '../types/job';
import { 
  Button, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  MenuItem,
  Box,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const JobForm: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<JobStatus>('Applied');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { addJob } = useJobs();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!company.trim() || !role.trim()) {
      setError('Company and role are required');
      return;
    }

    try {
      setLoading(true);
      await addJob({
        company: company.trim(),
        role: role.trim(),
        dateApplied,
        status,
      });
      handleClose();
    } catch (err) {
      console.error('Error adding job:', err);
      setError('Failed to add job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCompany('');
    setRole('');
    setDateApplied(new Date().toISOString().split('T')[0]);
    setStatus('Applied');
    setError('');
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleClickOpen}
        sx={{ mb: 2 }}
      >
        Add Job Application
      </Button>
      
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Job Application</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Company"
                type="text"
                fullWidth
                variant="outlined"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
              <TextField
                margin="dense"
                label="Role"
                type="text"
                fullWidth
                variant="outlined"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
              <TextField
                margin="dense"
                label="Date Applied"
                type="date"
                fullWidth
                variant="outlined"
                value={dateApplied}
                onChange={(e) => setDateApplied(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                select
                margin="dense"
                label="Status"
                fullWidth
                variant="outlined"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
              >
                <MenuItem value="Applied">Applied</MenuItem>
                <MenuItem value="Interview">Interview</MenuItem>
                <MenuItem value="Offer">Offer</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained" disabled={loading}>
              {loading ? 'Adding...' : 'Add Job'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default JobForm;
