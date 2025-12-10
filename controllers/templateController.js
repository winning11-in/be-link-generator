import QRTemplate from '../models/QRTemplate.js';

// Get all public templates (for all users)
export const getAllTemplates = async (req, res) => {
  try {
    const templates = await QRTemplate.find({ isPublic: true })
      .select('-createdBy')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message,
    });
  }
};

// Get single template by ID
export const getTemplateById = async (req, res) => {
  try {
    const template = await QRTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    if (!template.isPublic && template.createdBy.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching template',
      error: error.message,
    });
  }
};

// Create template (Admin only)
export const createTemplate = async (req, res) => {
  try {
    const { name, description, category, customization, design, thumbnail, isPublic } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Template name is required',
      });
    }

    // Check if template with same name exists
    const existingTemplate = await QRTemplate.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        message: 'Template with this name already exists',
      });
    }

    const templateData = {
      name,
      description,
      category,
      thumbnail,
      isPublic: isPublic || false,
      createdBy: req.user._id,
      customization: customization || {
        qrColor: '#000000',
        bgColor: '#ffffff',
        qrSize: 256,
        errorLevel: 'M',
        dotStyle: 'square',
        cornerSquareStyle: 'square',
        cornerDotStyle: 'square',
        logo: null,
        logoSize: 50,
        logoPadding: 5,
        removeBackground: true,
      },
      design: design || {
        pattern: null,
        patternOpacity: 0.3,
        borderRadius: 0,
        borderColor: null,
        borderWidth: 0,
        gradient: false,
        gradientColor1: null,
        gradientColor2: null,
      },
    };

    const template = new QRTemplate(templateData);
    await template.save();

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating template',
      error: error.message,
    });
  }
};

// Update template (Admin only)
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const template = await QRTemplate.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Check if user is the creator or admin
    if (template.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== 'createdBy' && key !== '_id') {
        if (key === 'customization' || key === 'design') {
          template[key] = { ...template[key], ...updates[key] };
        } else {
          template[key] = updates[key];
        }
      }
    });

    await template.save();

    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: template,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating template',
      error: error.message,
    });
  }
};

// Delete template (Admin only)
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await QRTemplate.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Check if user is the creator or admin
    if (template.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await QRTemplate.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: error.message,
    });
  }
};

// Get admin templates (only for admin)
export const getAdminTemplates = async (req, res) => {
  try {
    const templates = await QRTemplate.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    console.error('Error fetching admin templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message,
    });
  }
};

// Get templates by category
export const getTemplatesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const templates = await QRTemplate.find({ isPublic: true, category })
      .select('-createdBy')
      .sort({ usageCount: -1 });
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    console.error('Error fetching templates by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message,
    });
  }
};

// Increment template usage count
export const incrementTemplateUsage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await QRTemplate.findByIdAndUpdate(
      id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error incrementing template usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating template usage',
      error: error.message,
    });
  }
};
