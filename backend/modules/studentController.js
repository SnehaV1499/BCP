const Student = require("./studentModel");
const bcrypt = require("bcryptjs");

// ✅ Register a student
const registerStudent = async (req, res) => {
  try {
    const { name, email, studentId, password } = req.body;

    // Check if student already exists
    const existing = await Student.findOne({ $or: [{ email }, { studentId }] });
    if (existing) {
      return res.status(400).json({ message: "Email or Student ID already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      name,
      email,
      studentId,
      password: hashedPassword,
    });

    await newStudent.save();
    res.status(201).json({ message: "Student registered successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed ❌", error: err.message });
  }
};

// ✅ Login student
const loginStudent = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    const student = await Student.findOne({
      $or: [{ studentId }, { email: studentId }],
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    res.status(200).json({
      message: "Login successful ✅",
      email: student.email,
      studentId: student.studentId,
      name: student.name,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed ❌", error: err.message });
  }
};

// ✅ Get student profile by email
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving profile ❌", error: err.message });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  getStudentProfile,
};
