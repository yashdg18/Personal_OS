import { AppError } from '../utils/appError.js';

export function getProfile(req, res) {
  res.json({ success: true, data: { user: req.user.toSafeObject() } });
}

export async function updateProfile(req, res) {
  const allowed = ['name', 'timezone'];
  for (const field of allowed) {
    if (req.body[field] !== undefined) req.user[field] = String(req.body[field]).trim();
  }
  if (req.body.profile && typeof req.body.profile === 'object') {
    const profileFields = ['age', 'dateOfBirth', 'education', 'degree', 'graduationYear', 'careerGoal', 'currentRole', 'about', 'profilePhoto'];
    req.user.profile = req.user.profile || {};
    for (const field of profileFields) {
      if (req.body.profile[field] !== undefined) req.user.profile[field] = req.body.profile[field];
    }
  }
  if (!req.user.name) throw new AppError('Name is required.', 400, 'NAME_REQUIRED');
  await req.user.save();
  res.json({ success: true, data: { user: req.user.toSafeObject() } });
}
