const validateInput = (requiredFields) => (req, res, next) => {
    for (const field of requiredFields) {
        if (!req.body[field]) {
            res.status(400).json({ error: `Missing field ${field}` });
            return;
        }
        if (typeof req.body[field] === 'string') {
            const value = req.body[field].trim();
            if (value.length === 0) {
                res.status(400).json({ error: `The field ${field} cannot be empty` });
                return;
            }
        }
    }
    next();
};

const isCreated = (Model) => async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await Model.findOne({ email });
        if (user) {
            res.status(409).json({ error: "User already exists" });
        } else {
            next();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const checkId = (Model) => async (req, res, next) => {
    const id = req.params.id || req.body.id || req.query.id;
    if (id) {
        const model = await Model.findById(id);
        if (model) {
            return next();
        } else {
            res.status(404).json({ error: `id not found in ${Model.name}` });
        }
    }
};

const checkVariable = (Model, variableName) => async (req, res, next) => {
    const val = req.params[variableName] || req.body[variableName] || req.query[variableName];
    if (val) {
        const model = await Model.findOne({  [variableName]: val } );
        if (!model) {
            return next();
        }
        else {
            res.status(409).json({ error: `${variableName} already exists` });
        }
    }
};

const isExistRoom = (Model) => async (req, res, next) => {
    const room = req.body.room || req.query.room || req.params.room;
    const roomExist = await Model.findOne({  roomNumber: room } );
    if (!roomExist) {
        next();
    }
};

module.exports = {
    validateInput,
    isCreated,
    checkId,
    checkVariable,
    isExistRoom
};