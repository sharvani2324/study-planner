import { StudyPlan, ALLOWED_SUBJECTS } from '../models/StudyPlan.js';
import { applyStatusChange } from '../utils/planHelpers.js';

// @desc    Get all study plans for the logged-in student with filters & search
// @route   GET /api/study-plans
// @access  Private
export const getPlans = async (req, res) => {
  try {
    const { subject, status, search, date, sortBy = 'date' } = req.query;

    const query = { userId: req.user._id };

    if (subject && subject !== 'All') {
      if (ALLOWED_SUBJECTS.includes(subject)) {
        query.subject = subject;
      }
    }

    if (status && status !== 'All') {
      if (['Pending', 'Completed'].includes(status)) {
        query.status = status;
      }
    }

    if (date) {
      query.date = date;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ topic: searchRegex }, { notes: searchRegex }, { subject: searchRegex }];
    }

    let sortOption = { date: 1, time: 1 };
    if (sortBy === 'priority') {
      // High first, then Medium, Low
      sortOption = { priority: -1, date: 1, time: 1 };
    } else if (sortBy === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const plans = await StudyPlan.find(query).sort(sortOption);

    return res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load study plans. Please try again.',
      error: error.message,
    });
  }
};

// @desc    Get a single study plan by ID
// @route   GET /api/study-plans/:id
// @access  Private
export const getPlanById = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found or you are not authorized to view it.',
      });
    }

    return res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving study plan.',
      error: error.message,
    });
  }
};

// @desc    Create a new study plan
// @route   POST /api/study-plans
// @access  Private
export const createPlan = async (req, res) => {
  try {
    let { subject, topic, date, time, priority = 'Medium', status = 'Pending', notes = '', estimatedMinutes, localDate, localHour } = req.body;

    if (!time) time = '10:00';

    if (!subject || !topic || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (Subject, Topic, and Date).',
      });
    }

    if (!ALLOWED_SUBJECTS.includes(subject)) {
      return res.status(400).json({
        success: false,
        message: `Invalid subject. Must be one of: ${ALLOWED_SUBJECTS.join(', ')}`,
      });
    }

    const newPlan = new StudyPlan({
      userId: req.user._id,
      subject,
      topic: topic.trim(),
      date,
      time,
      priority,
      notes: notes.trim(),
    });
    if (estimatedMinutes) newPlan.estimatedMinutes = Number(estimatedMinutes);
    applyStatusChange(newPlan, status === 'Completed' ? 'Completed' : 'Pending', localDate, localHour);
    await newPlan.save();

    return res.status(201).json({
      success: true,
      message: 'Study plan created successfully! 🎯',
      plan: newPlan,
    });
  } catch (error) {
    console.error('Error creating study plan:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create study plan.',
    });
  }
};

// @desc    Update an existing study plan
// @route   PUT /api/study-plans/:id
// @access  Private
export const updatePlan = async (req, res) => {
  try {
    const { subject, topic, date, time, priority, status, notes, estimatedMinutes, localDate, localHour } = req.body;

    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found or unauthorized to update.',
      });
    }

    if (subject) {
      if (!ALLOWED_SUBJECTS.includes(subject)) {
        return res.status(400).json({
          success: false,
          message: `Subject must be one of: ${ALLOWED_SUBJECTS.join(', ')}`,
        });
      }
      plan.subject = subject;
    }

    if (topic) plan.topic = topic.trim();
    if (date) plan.date = date;
    if (time) plan.time = time;
    if (priority) plan.priority = priority;
    if (status) applyStatusChange(plan, status, localDate, localHour);
    if (notes !== undefined) plan.notes = notes.trim();
    if (estimatedMinutes) plan.estimatedMinutes = Number(estimatedMinutes);

    await plan.save();

    return res.status(200).json({
      success: true,
      message: 'Study plan updated successfully!',
      plan,
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update study plan.',
    });
  }
};

// @desc    Update only the status of a study plan (Pending <-> Completed)
// @route   PUT /api/study-plans/:id/status
// @access  Private
export const updatePlanStatus = async (req, res) => {
  try {
    const { status, localDate, localHour } = req.body;

    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found or unauthorized.',
      });
    }

    // If status is provided, use it, otherwise toggle
    const newStatus = status ? status : (plan.status === 'Completed' ? 'Pending' : 'Completed');

    if (!['Pending', 'Completed'].includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Pending or Completed.',
      });
    }

    applyStatusChange(plan, newStatus, localDate, localHour);
    await plan.save();

    return res.status(200).json({
      success: true,
      message: newStatus === 'Completed' ? 'Great job! Plan marked as completed! 🎉' : 'Plan marked as pending.',
      plan,
    });
  } catch (error) {
    console.error('Error updating plan status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update plan status.',
      error: error.message,
    });
  }
};

// @desc    Delete a study plan
// @route   DELETE /api/study-plans/:id
// @access  Private
export const deletePlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found or unauthorized to delete.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Study plan deleted successfully.',
      deletedId: req.params.id,
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete study plan.',
      error: error.message,
    });
  }
};

// @desc    Get progress statistics & subject-wise breakdown for the logged-in student
// @route   GET /api/study-plans/progress
// @access  Private
export const getProgressAndStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all user plans
    const allPlans = await StudyPlan.find({ userId });

    const total = allPlans.length;
    const completed = allPlans.filter((p) => p.status === 'Completed').length;
    const pending = total - completed;
    const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Subject-wise statistics for the 8 core subjects (supporting legacy and standard aliases)
    const CORE_SUBJECTS = [
      { key: 'DAA', label: 'DAA', aliases: ['DAA'] },
      { key: 'Backend', label: 'Backend', aliases: ['Backend'] },
      { key: 'Python', label: 'Python', aliases: ['Python'] },
      { key: 'Mathematics', label: 'Mathematics', aliases: ['Mathematics', 'Maths'] },
      { key: 'DBMS', label: 'DBMS', aliases: ['DBMS'] },
      { key: 'ACS', label: 'ACS', aliases: ['ACS'] },
      { key: 'Web Development', label: 'Web Development', aliases: ['Web Development', 'WebDevelopment'] },
      { key: 'P and S', label: 'P and S', aliases: ['P and S', 'PandS', 'PNS'] },
    ];

    const subjectStats = CORE_SUBJECTS.map(({ key, label, aliases }) => {
      const subPlans = allPlans.filter((p) => aliases.includes(p.subject) || p.subject === key);
      const subTotal = subPlans.length;
      const subCompleted = subPlans.filter((p) => p.status === 'Completed').length;
      const subPending = subTotal - subCompleted;
      const percentage = subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0;

      return {
        subject: key,
        label,
        total: subTotal,
        completed: subCompleted,
        pending: subPending,
        percentage,
      };
    });

    // Today's statistics
    const todayStr = new Date().toISOString().split('T')[0];
    const todayPlans = allPlans.filter((p) => p.date === todayStr);
    const todayTotal = todayPlans.length;
    const todayCompleted = todayPlans.filter((p) => p.status === 'Completed').length;
    const todayPending = todayTotal - todayCompleted;

    // Priority breakdown
    const highPriorityPending = allPlans.filter((p) => p.priority === 'High' && p.status === 'Pending').length;

    return res.status(200).json({
      success: true,
      stats: {
        total,
        completed,
        pending,
        overallProgress,
        highPriorityPending,
        todayTotal,
        todayCompleted,
        todayPending,
        subjectStats,
      },
    });
  } catch (error) {
    console.error('Error computing progress:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to calculate progress statistics.',
      error: error.message,
    });
  }
};
