import * as UsersService from "../services/users.services.js";

export async function createUser(req, res) {
  try {
    const data = req.body;
    console.log('[CRUD][CREATE] Received createUser request', JSON.stringify(data));

    const result = await UsersService.createUser(data);
    console.log('[CRUD][CREATE] createUser result:', JSON.stringify(result));

    res.status(201).json({
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    console.error('[CRUD][CREATE] createUser error:', error && error.message ? error.message : error);
    if (
      error.message.includes("dateOfBirth") ||
      error.message.includes("DOB")
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

export async function getUsers(req, res) {
  try {
    console.log('[CRUD][READ] Received getUsers request');
    const users = await UsersService.getAllUsers();
    console.log(`[CRUD][READ] getUsers returned ${Array.isArray(users) ? users.length : 0} users`);

    res.status(200).json(users || []);
  } catch (error) {
    console.error('[CRUD][READ] getUsers error:', error);
    res.status(500).json({ error: error.message });
  }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[CRUD][READ] getUserById request for id:', id);
    const user = await UsersService.getUserById(id);
    console.log('[CRUD][READ] getUserById result for id:', id, user ? 'found' : 'not found');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('[CRUD][READ] getUserById error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getUsersByYear = async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    console.log('[CRUD][READ] getUsersByYear request for year:', year);

    if (isNaN(year)) {
      return res.status(400).json({ error: "Invalid year format" });
    }

    const users = await UsersService.getAllUsersByDate(year);

    if (users === null) {
      console.warn('[CRUD][READ] getUsersByYear invalid year:', year);
      return res.status(400).json({ error: "Year must be 2006 or 2007" });
    }

    console.log(`[CRUD][READ] getUsersByYear returned ${users.length} records for year ${year}`);
    res.status(200).json(users);
  } catch (error) {
    console.error('[CRUD][READ] getUsersByYear error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const isolation = req.query.isolation || null;
    const mode = req.query.mode || null;

    console.log('[CRUD][UPDATE] updateUserById request', { id, updates, isolation, mode });

    const result = await UsersService.updateUserById(id, updates, {
      isolation,
      mode,
    });

    console.log('[CRUD][UPDATE] updateUserById result for id:', id, JSON.stringify(result));

    if (!result) {
      return res.status(404).json({ message: `no user found with id: ${id}` });
    }

    res.status(200).json({
      success: true,
      message: "user updated successfully",
    });
  } catch (error) {
    console.error('[CRUD][UPDATE] updateUserById error:', error && error.message ? error.message : error);
    if (
      error.message.includes("dob") ||
      error.message.includes("unauthorized")
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[CRUD][DELETE] deleteUserById request for id:', id);

    const result = await UsersService.deleteUserById(id);

    console.log('[CRUD][DELETE] deleteUserById result for id:', id, JSON.stringify(result));

    if (!result) {
      return res.status(404).json({ message: `no user found with id: ${id}` });
    }

    res.status(200).json({
      success: true,
      message: "user deleted successfully",
    });
  } catch (error) {
    console.error('[CRUD][DELETE] deleteUserById error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const recoverCentral = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    console.log('[RECOVERY] recoverCentral request for id:', id);
    const result = await UsersService.recoverCentral(id)

    if (!result.recovered) {
      console.warn('[RECOVERY] recoverCentral failed for id:', id, result);
      return res.status(404).json(result);
    }

    console.log('[RECOVERY] recoverCentral success for id:', id);
    res.status(200).json({
      success: true,
      message: "Central node recovered.",
    });
  } catch (error) {
    console.error('[RECOVERY] recoverCentral error:', error);
    res.status(500).json({ error: error.message });
  }
}

export const recoverFragment = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    console.log('[RECOVERY] recoverFragment request for id:', id);
    const result = await UsersService.recoverFragment(id);

    if (!result.recovered) {
      console.warn('[RECOVERY] recoverFragment failed for id:', id, result);
      return res.status(404).json(result);
    }

    console.log('[RECOVERY] recoverFragment success for id:', id, 'targetYear:', result.targetYear);
    res.status(200).json({
      success: true,
      message: "Fragment node recovered.",
      targetYear: result.targetYear,
    });
  } catch (error) {
    console.error('[RECOVERY] recoverFragment error:', error);
    res.status(500).json({ error: error.message });
  }
}