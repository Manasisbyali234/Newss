import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Save, Plus, Trash2, Edit3 } from 'lucide-react';
import { api } from '../../../../utils/api';
import showToast from '../../../../utils/toastNotification';

const InterviewProcessManager = ({ applicationId, onSave }) => {
  const [interviewProcess, setInterviewProcess] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const stageTypes = [
    { value: 'assessment', label: 'Assessment Schedule', icon: '📝' },
    { value: 'technical', label: 'Technical Round', icon: '💻' },
    { value: 'hr', label: 'HR Round', icon: '👥' },
    { value: 'managerial', label: 'Managerial Round', icon: '👔' },
    { value: 'final', label: 'Final Round', icon: '🎯' },
    { value: 'custom', label: 'Custom Round', icon: '⚙️' }
  ];

  useEffect(() => {
    if (applicationId) {
      fetchInterviewProcess();
    }
  }, [applicationId]);

  const fetchInterviewProcess = async () => {
    setLoading(true);
    try {
      const data = await api.getEmployerInterviewProcess(applicationId);
      if (data.interviewProcess) {
        setInterviewProcess(data.interviewProcess);
        setStages(data.interviewProcess.stages || []);
      }
    } catch (error) {
      console.error('Error fetching interview process:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStage = () => {
    const newStage = {
      stageType: 'assessment',
      stageName: 'Assessment Schedule',
      stageOrder: stages.length + 1,
      status: 'pending',
      fromDate: '',
      toDate: '',
      scheduledTime: '',
      location: '',
      interviewerName: '',
      interviewerEmail: '',
      meetingLink: '',
      instructions: '',
      description: ''
    };
    setStages([...stages, newStage]);
  };

  const removeStage = (index) => {
    const updatedStages = stages.filter((_, i) => i !== index);
    // Update stage orders
    updatedStages.forEach((stage, i) => {
      stage.stageOrder = i + 1;
    });
    setStages(updatedStages);
  };

  const updateStage = (index, field, value) => {
    const updatedStages = [...stages];
    updatedStages[index] = { ...updatedStages[index], [field]: value };
    
    // Update stage name when type changes
    if (field === 'stageType') {
      const stageType = stageTypes.find(type => type.value === value);
      if (stageType) {
        updatedStages[index].stageName = stageType.label;
      }
    }
    
    setStages(updatedStages);
  };

  const saveInterviewProcess = async () => {
    setSaving(true);
    try {
      const data = await api.createEmployerInterviewProcess(applicationId, {
        stages,
        processStatus: stages.length > 0 ? 'in_progress' : 'not_started'
      });
      
      setInterviewProcess(data.interviewProcess);
      showToast('Interview process saved successfully!', 'success');
      if (onSave) onSave(data.interviewProcess);
    } catch (error) {
      console.error('Error saving interview process:', error);
      showToast('Error saving interview process. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
      <div className="card-header border-0" style={{ background: '#f8f9fa', borderRadius: '15px 15px 0 0' }}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold" style={{ color: '#000' }}>
            Interview Process Management
          </h5>
          <button
            className="btn btn-sm"
            style={{ backgroundColor: '#ff6600', color: 'white', border: 'none' }}
            onClick={addStage}
          >
            <Plus size={16} className="me-1" />
            Add Stage
          </button>
        </div>
      </div>
      
      <div className="card-body p-4">
        {stages.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted mb-3">No interview stages configured yet.</p>
            <button
              className="btn"
              style={{ backgroundColor: '#ff6600', color: 'white', border: 'none' }}
              onClick={addStage}
            >
              <Plus size={16} className="me-1" />
              Add First Stage
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {stages.map((stage, index) => (
              <div key={index} className="col-12">
                <div className="border rounded-3 p-4" style={{ backgroundColor: '#fafafa', borderColor: '#e9ecef' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                      <span className="badge me-2" style={{ backgroundColor: '#ff6600', color: 'white' }}>
                        {stage.stageOrder}
                      </span>
                      {stageTypes.find(type => type.value === stage.stageType)?.icon} {stage.stageName}
                    </h6>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeStage(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="row g-3">
                    {/* Stage Type Selection */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Interview Round Type</label>
                      <select
                        className="form-select"
                        value={stage.stageType}
                        onChange={(e) => updateStage(index, 'stageType', e.target.value)}
                        style={{ borderColor: '#ff6600' }}
                      >
                        {stageTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Stage Name */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Stage Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={stage.stageName}
                        onChange={(e) => updateStage(index, 'stageName', e.target.value)}
                        style={{ borderColor: '#ff6600' }}
                      />
                    </div>

                    {/* Assessment Schedule - Show when Assessment is selected */}
                    {stage.stageType === 'assessment' && (
                      <>
                        <div className="col-12">
                          <div className="alert alert-info" style={{ backgroundColor: '#e3f2fd', borderColor: '#2196f3', color: '#1976d2' }}>
                            <strong>Assessment Schedule:</strong> Configure the date range when candidates can take the assessment.
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label fw-semibold d-flex align-items-center gap-2">
                            <Calendar size={16} style={{ color: '#ff6600' }} />
                            From Date
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={formatDate(stage.fromDate)}
                            onChange={(e) => updateStage(index, 'fromDate', e.target.value)}
                            style={{ borderColor: '#ff6600' }}
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-semibold d-flex align-items-center gap-2">
                            <Calendar size={16} style={{ color: '#ff6600' }} />
                            To Date
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={formatDate(stage.toDate)}
                            onChange={(e) => updateStage(index, 'toDate', e.target.value)}
                            style={{ borderColor: '#ff6600' }}
                            min={formatDate(stage.fromDate)}
                          />
                        </div>
                      </>
                    )}

                    {/* Interview Schedule - Show for other types */}
                    {stage.stageType !== 'assessment' && (
                      <>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold d-flex align-items-center gap-2">
                            <Calendar size={16} style={{ color: '#ff6600' }} />
                            Interview Date
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={formatDate(stage.scheduledDate)}
                            onChange={(e) => updateStage(index, 'scheduledDate', e.target.value)}
                            style={{ borderColor: '#ff6600' }}
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label fw-semibold d-flex align-items-center gap-2">
                            <Clock size={16} style={{ color: '#ff6600' }} />
                            Time
                          </label>
                          <input
                            type="time"
                            className="form-control"
                            value={stage.scheduledTime || ''}
                            onChange={(e) => updateStage(index, 'scheduledTime', e.target.value)}
                            style={{ borderColor: '#ff6600' }}
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Location/Mode</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g., Office, Online, Phone"
                            value={stage.location || ''}
                            onChange={(e) => updateStage(index, 'location', e.target.value)}
                            style={{ borderColor: '#ff6600' }}
                          />
                        </div>
                      </>
                    )}

                    {/* Interviewer Details */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Interviewer Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter interviewer name"
                        value={stage.interviewerName || ''}
                        onChange={(e) => updateStage(index, 'interviewerName', e.target.value)}
                        style={{ borderColor: '#ff6600' }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Interviewer Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter interviewer email"
                        value={stage.interviewerEmail || ''}
                        onChange={(e) => updateStage(index, 'interviewerEmail', e.target.value)}
                        style={{ borderColor: '#ff6600' }}
                      />
                    </div>

                    {/* Meeting Link */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">Meeting Link (Optional)</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://meet.google.com/... or https://zoom.us/..."
                        value={stage.meetingLink || ''}
                        onChange={(e) => updateStage(index, 'meetingLink', e.target.value)}
                        style={{ borderColor: '#ff6600' }}
                      />
                    </div>

                    {/* Instructions */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">Instructions for Candidate</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Enter any specific instructions for the candidate..."
                        value={stage.instructions || ''}
                        onChange={(e) => updateStage(index, 'instructions', e.target.value)}
                        style={{ borderColor: '#ff6600' }}
                      />
                    </div>

                    {/* Status */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Status</label>
                      <select
                        className="form-select"
                        value={stage.status}
                        onChange={(e) => updateStage(index, 'status', e.target.value)}
                        style={{ borderColor: '#ff6600' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {stages.length > 0 && (
          <div className="mt-4 d-flex justify-content-end">
            <button
              className="btn btn-lg px-4"
              style={{ backgroundColor: '#ff6600', color: 'white', border: 'none' }}
              onClick={saveInterviewProcess}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="me-2" />
                  Save Interview Process
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewProcessManager;