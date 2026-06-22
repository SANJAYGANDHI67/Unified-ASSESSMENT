import * as submissionService from '../services/submission.service.js';
import * as assessmentService from '../services/assessment.service.js';

export const getMySubmissions = async (req, res) => {
    try {
        const submissions = await submissionService.getSubmissionsByStudent(req.user.id);
        res.json(submissions);
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await submissionService.getSubmissionById(id);
        
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        if (submission.student_id !== req.user.id && req.user.role !== 'instructor' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(submission);
    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const startAssessment = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const assessment = await assessmentService.getAssessmentById(assessmentId);
        
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        if (assessment.status !== 'published') {
            return res.status(400).json({ error: 'Assessment is not published' });
        }

        let submission = await submissionService.getSubmissionByStudentAndAssessment(req.user.id, assessmentId);
        
        if (submission && submission.status === 'submitted') {
            return res.status(400).json({ error: 'Assessment already submitted' });
        }

        if (!submission) {
            const submissionId = await submissionService.createSubmission(assessmentId, req.user.id);
            submission = await submissionService.getSubmissionById(submissionId);
        }

        res.json(submission);
    } catch (error) {
        console.error('Start assessment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getSubmissionAnswers = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await submissionService.getSubmissionById(submissionId);
        
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        if (submission.student_id !== req.user.id && req.user.role !== 'instructor' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const answers = await submissionService.getAnswersBySubmission(submissionId);
        res.json(answers);
    } catch (error) {
        console.error('Get answers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const saveAnswer = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { question_id, answer, marks_awarded } = req.body;

        const submission = await submissionService.getSubmissionById(submissionId);
        
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        if (submission.student_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (submission.status === 'submitted') {
            return res.status(400).json({ error: 'Cannot modify submitted assessment' });
        }

        await submissionService.saveAnswer({
            submission_id: submissionId,
            question_id,
            answer,
            marks_awarded
        });

        res.json({ message: 'Answer saved successfully' });
    } catch (error) {
        console.error('Save answer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const submitAssessment = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await submissionService.getSubmissionById(submissionId);
        
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        if (submission.student_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (submission.status === 'submitted') {
            return res.status(400).json({ error: 'Assessment already submitted' });
        }

        await submissionService.submitAssessment(submissionId);
        res.json({ message: 'Assessment submitted successfully' });
    } catch (error) {
        console.error('Submit assessment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAssessmentSubmissions = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const assessment = await assessmentService.getAssessmentById(assessmentId);
        
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        if (assessment.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const submissions = await submissionService.getSubmissionsByAssessment(assessmentId);
        res.json(submissions);
    } catch (error) {
        console.error('Get assessment submissions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

