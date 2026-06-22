import * as assessmentService from '../services/assessment.service.js';

export const getMyAssessments = async (req, res) => {
    try {
        const assessments = await assessmentService.getAssessmentsByInstructor(req.user.id);
        res.json(assessments);
    } catch (error) {
        console.error('Get assessments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPublishedAssessments = async (req, res) => {
    try {
        const assessments = await assessmentService.getPublishedAssessments();
        res.json(assessments);
    } catch (error) {
        console.error('Get published assessments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const assessment = await assessmentService.getAssessmentById(id);
        
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        res.json(assessment);
    } catch (error) {
        console.error('Get assessment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createAssessment = async (req, res) => {
    try {
        const { title, description, total_marks } = req.body;

        if (!title || !total_marks) {
            return res.status(400).json({ error: 'Title and total_marks are required' });
        }

        const assessmentId = await assessmentService.createAssessment({
            title,
            description: description || '',
            total_marks: parseInt(total_marks),
            created_by: req.user.id
        });

        res.status(201).json({ id: assessmentId, message: 'Assessment created successfully' });
    } catch (error) {
        console.error('Create assessment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, total_marks, status } = req.body;

        const assessment = await assessmentService.getAssessmentById(id);
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        if (assessment.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await assessmentService.updateAssessment(id, {
            title,
            description,
            total_marks: total_marks ? parseInt(total_marks) : assessment.total_marks,
            status
        });

        res.json({ message: 'Assessment updated successfully' });
    } catch (error) {
        console.error('Update assessment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const assessment = await assessmentService.getAssessmentById(id);
        
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        if (assessment.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await assessmentService.deleteAssessment(id);
        res.json({ message: 'Assessment deleted successfully' });
    } catch (error) {
        console.error('Delete assessment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getQuestions = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const questions = await assessmentService.getQuestionsByAssessment(assessmentId);
        res.json(questions);
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createQuestion = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const { question, question_type, options, correct_option, marks, source } = req.body;

        if (!question || !question_type || marks === undefined) {
            return res.status(400).json({ error: 'Question, question_type, and marks are required' });
        }

        const questionId = await assessmentService.createQuestion({
            assessment_id: assessmentId,
            question,
            question_type,
            options: options || null,
            correct_option: correct_option || null,
            marks: parseInt(marks),
            source: source || 'manual'
        });

        res.status(201).json({ id: questionId, message: 'Question created successfully' });
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { question, question_type, options, correct_option, marks } = req.body;

        await assessmentService.updateQuestion(questionId, {
            question,
            question_type,
            options,
            correct_option,
            marks: parseInt(marks)
        });

        res.json({ message: 'Question updated successfully' });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        await assessmentService.deleteQuestion(questionId);
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAIQuestions = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const questions = await assessmentService.getAIQuestionsByAssessment(assessmentId);
        res.json(questions);
    } catch (error) {
        console.error('Get AI questions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getStats = async (req, res) => {
    try {
        const stats = await assessmentService.getAssessmentStats(req.user.id);
        res.json(stats);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

