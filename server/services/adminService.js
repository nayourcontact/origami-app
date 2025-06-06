const Admin = require("../models/Admin");

exports.findByEmail = async (email) => {
    return await Admin.findOne({ email });
};

exports.createAdmin = async (email, password) => {
    const admin = new Admin({ email, password });
    return await admin.save();
};

exports.updateEmail = async (id, newEmail) => {
    return await Admin.findByIdAndUpdate(id, { email: newEmail }, { new: true });
};

exports.countAdmins = async () => {
    return await Admin.countDocuments();
};
